# Re-Kon, engineering specification

**Version**: 0.1 (draft, pending Vincent gate)
**Date**: 2026-09-16
**Product**: Re-Kon, sovereign research & recon agent
**Company**: VF Empire Corp Ltd (Malta, C 94160)
**Licence**: FSL-1.1-ALv2 (source-available, commercial after 2 years)
**Distribution**: one-time purchase, perpetual licence, runs on customer hardware

---

## 1. Product context

Re-Kon is the first agent in the VF Empire agent fleet. It is not a chatbot. It is a **headless research operator**, a buyer briefs it once, it plans a mission, executes the mission on their machine using their choice of model and search backend, and returns a structured dossier with an evidence chain.

Design constraints, all load-bearing:

- **The buyer owns it.** One-time payment, no subscription, no phone-home, no ingestion of their queries by VF or anyone else.
- **Runs on their hardware.** Windows, macOS, Linux. No VF-controlled cloud in the path.
- **Bring-your-own-everything.** Buyer supplies (a) the LLM (local Ollama / LM Studio / vLLM, or their cloud key), (b) the search backend (self-hosted SearXNG, or their Brave / Serper / Kagi key). VF sells the harness, the mission engine, the evidence chain, the UI, the fleet integration.
- **PrivacyKit LAW inherited.** Every artefact at rest is encrypted with a machine-bound key.
- **Fleet-native.** If other VF agents are installed on the same machine, Re-Kon advertises its capabilities to them and consumes theirs. Details in §11.
- **Permanence Guarantee.** If VF disappears, the buyer's binary keeps working. No licence server call after activation.

## 2. Non-goals

- Not a general chat assistant. No conversational memory. No "hi, how are you today". You brief it, it works, it hands back a dossier. Missions are the unit of work.
- Not a search engine. It uses search engines.
- Not a scraping product. It is a research operator that dispatches searches, reads results, and reasons over them.
- Not multiplayer / shared / cloud-collaborative. Single-user product on the buyer's machine. Fleet integration is between agents on the same host, not between users.
- Not a data broker. It never sends the buyer's brief, findings, or dossier anywhere without the buyer's explicit act (export / share).

## 3. Repo shape

Single Cargo workspace: `github.com/vfempire-hq/re-kon`

```
re-kon/
  Cargo.toml               # workspace root, license = "LicenseRef-FSL-1.1-ALv2"
  LICENSE                  # FSL-1.1-ALv2 text copied from ~/vf-license-templates/
  crates/
    re-kon-core/          # mission model + lifecycle
    re-kon-planner/       # LLM-driven mission planner
    re-kon-search/        # search backend trait + impls (searxng, brave, serper, kagi)
    re-kon-ingest/        # url fetch + content extract (html, pdf, docx)
    re-kon-model/         # LLM backend trait + OpenAI-compat impl
    re-kon-evidence/      # evidence chain, hashing, quote tracking
    re-kon-store/         # sqlite storage layer, PrivacyKit-encrypted at rest
    re-kon-fleet/         # inter-agent bus (client + advertiser)
    re-kon-licence/       # Ed25519 licence verification + hw fingerprint
    re-kon-ui/            # embedded web UI (Axum server + house-styled assets)
    re-kon-cli/           # thin CLI wrapper
    re-kon-app/           # binary target: assembles all crates
  docs/
    ARCHITECTURE.md
    MISSION-LIFECYCLE.md
    FLEET-BUS.md
    THREAT-MODEL.md
  ui/                      # static assets served by re-kon-ui (house.css port)
  tests/
    golden/                # fixed brief -> mocked search -> snapshot dossier
```

## 4. Architecture overview

Single native binary. On startup:

1. Reads `~/.vf/re-kon/config.toml` (or platform equivalent).
2. Opens `~/.vf/re-kon/store.sqlite` (creates + migrates on first run).
3. Loads the licence file, verifies signature, checks hardware fingerprint.
4. Advertises its capabilities to the fleet by writing `~/.vf/agents/re-kon.toml`.
5. Starts the local web UI on `127.0.0.1:5410` (default, configurable).
6. Starts the fleet-bus listener on a Unix domain socket (or Windows named pipe).
7. Idle until a mission is dispatched by (a) the local UI, (b) the CLI, or (c) another agent in the fleet.

There is no background worker service by default. Re-Kon is a foreground process that the buyer starts (Start Menu / Dock / systemd user unit). Optional: install as a login-item on macOS / Startup on Windows / user-service on Linux, off by default.

**Ports** (VF port block, 51xx–54xx range):
- `5410`, local web UI (loopback only by default)
- `5411`, internal metrics / health (loopback, opt-in)

**Runtime**: Rust stable, `tokio` async, `axum` for the UI, `rusqlite` for the store, `reqwest` for HTTP, `ed25519-dalek` for signatures, `argon2` for local secret derivation, `zstd` for dossier compression.

## 5. Mission lifecycle

A mission has six stages. Each stage is a discrete typed state in SQLite; a mission can be paused, resumed, or forensically inspected at any stage.

```
Brief  →  Plan  →  Dispatch  →  Ingest  →  Distill  →  Dossier
  ↓        ↓         ↓            ↓          ↓          ↓
  stored   stored    stored       stored     stored     stored
```

### 5.1 Brief
Free-text brief from the buyer. Optional structured fields (jurisdiction, time window, output language, output format). Stored verbatim.

### 5.2 Plan
The planner LLM (§7) reads the brief and produces a `MissionPlan`:
- 3–12 sub-questions covering the brief
- Per sub-question: 1–5 search queries
- Per sub-question: expected evidence type (news, filing, forum, primary source)
- Overall scope guardrails: max sources, max tokens, time budget

The plan is presented to the buyer for one-click approval before dispatch (opt-out: run-immediately toggle in settings).

### 5.3 Dispatch
For each sub-question, each search query is sent to the configured search backend. Results are deduplicated by canonical URL, ranked by (backend score × recency × domain quality prior), capped at `max_sources_per_subq`.

### 5.4 Ingest
Every retained URL is fetched:
- Respect `robots.txt` (configurable strict/lax; strict = default)
- Rate-limited per host (token bucket, 1 req/2s per host default)
- User-Agent identifies as `Re-Kon/<ver> (+https://vfempire.com/agents/re-kon)`
- Content extractors run in order: readability (HTML), pdf-extract (PDF), docx-rs (DOCX), plain text fallback
- Raw response + extracted text + SHA-256 hash + retrieved-at timestamp stored

### 5.5 Distill
Per sub-question, the distiller LLM reads the ingested sources and produces:
- 1–3 findings, each tied to specific source excerpts
- Confidence tag: solid / probable / inferred / unknown
- Contradiction flag if sources disagree

Findings roll up into the mission-level dossier.

### 5.6 Dossier
Structured output:
- **Executive summary** (200–500 words)
- **Findings by theme**, each finding lists source URLs, retrieval timestamps, direct quoted excerpts (with hash for tamper detection)
- **Confidence map**, visual summary of what is solid vs inferred
- **Open questions**, what the mission could not answer, why
- **Evidence appendix**, full source list with hashes

Exported as: Markdown (primary), PDF (via `typst`), JSON (machine-readable evidence chain).

## 6. Search subsystem

Trait, in `re-kon-search`:

```rust
#[async_trait]
pub trait SearchBackend: Send + Sync {
    async fn search(&self, q: &Query) -> Result<Vec<Hit>>;
    fn name(&self) -> &'static str;
    fn requires_key(&self) -> bool;
}

pub struct Query { pub q: String, pub site: Option<String>, pub freshness: Option<Duration>, pub limit: u32 }
pub struct Hit { pub url: String, pub title: String, pub snippet: String, pub score: f32, pub retrieved_at: DateTime<Utc> }
```

Implementations shipping in v1:
- **SearXNG** (recommended default), points at a URL the buyer runs locally; no keys, no cost, no third-party dependency. Docs teach how to stand up SearXNG in 2 minutes.
- **Brave Search API**, buyer's key
- **Serper (Google proxy)**, buyer's key
- **Kagi**, buyer's key

Backends are picked per-mission or globally in config. Multiple backends can be active. Re-Kon will merge and dedupe.

## 7. Model subsystem

Trait, in `re-kon-model`:

```rust
#[async_trait]
pub trait ModelBackend: Send + Sync {
    async fn generate(&self, req: GenerateRequest) -> Result<TokenStream>;
    fn name(&self) -> &'static str;
    fn context_window(&self) -> usize;
    fn requires_key(&self) -> bool;
}
```

Single implementation: **OpenAI-compatible endpoint**. This one impl covers, out of the box:
- Ollama (local, `http://127.0.0.1:11434/v1`)
- LM Studio (local, `http://127.0.0.1:1234/v1`)
- vLLM, llama.cpp, oobabooga (local, various ports)
- OpenAI, DeepSeek, Grok, Together, Fireworks (cloud, buyer's key)
- Anthropic (via built-in adapter that maps OpenAI-format ↔ Anthropic API)

Per-mission model config: buyer may set `planner_model` fast/cheap and `distiller_model` big/careful. Default: same model for both.

Streaming, token accounting, retry with backoff on 429/5xx, hard cap on tokens per mission.

## 8. Evidence chain

Every claim in the dossier is a first-class record:

```rust
pub struct Claim {
    pub id: Uuid,
    pub mission_id: Uuid,
    pub sub_question_id: Uuid,
    pub text: String,                      // the claim itself
    pub confidence: Confidence,            // solid | probable | inferred | unknown
    pub sources: Vec<SourceRef>,           // one or many
}
pub struct SourceRef {
    pub url: String,
    pub retrieved_at: DateTime<Utc>,
    pub excerpt: String,                   // the exact text supporting the claim
    pub excerpt_hash: Sha256,              // hash of the full source content at retrieval
    pub archive_ref: Option<String>,       // optional wayback / local snapshot ID
}
```

Exported as JSON alongside the human dossier so downstream tools (or a buyer's compliance workflow) can verify claims without parsing prose.

## 9. Storage

- **SQLite** bundled, one file per install (`~/.vf/re-kon/store.sqlite`)
- Migrations under `re-kon-store/migrations/`, tracked by `refinery`
- **Encryption at rest**: `SQLCipher` if the buyer opts in, else per-record encryption of sensitive columns (brief, findings, excerpts) using a key derived from the OS keychain entry via Argon2id
- **Export**: `re-kon export <mission>` produces a portable `.re-kon` archive (zstd-compressed tar of the mission's rows + assets, optionally PrivacyKit-sealed)
- **Vacuum + backup**: `re-kon maintain` runs `VACUUM` and rotates a `.bak` copy

## 10. Local UI

Embedded Axum server on `127.0.0.1:5410`, serving a static SPA whose CSS is a **port of `/house.css`**, same tokens, same nav feel, same type scale, so the product looks like the site. Light theme only.

Screens (v1):
- **Home**, recent missions, "new mission" button
- **New mission**, brief input, optional structured fields, model + search backend picker
- **Mission live**, streaming progress (plan → dispatch → ingest → distill), source list building in real time
- **Mission detail**, full dossier viewer, evidence inspector (click any claim → see sources → hover any source → see excerpt + hash)
- **Fleet**, other VF agents on this machine, capabilities they expose, one-tap route missions to them
- **Settings**, model config, search config, licence status, storage location, PrivacyKit key management
- **Journal**, plain-text log of every mission for audit

No third-party fonts, no CDN calls, no analytics. Fonts served from the binary. Assets embedded via `rust-embed`.

## 11. Fleet bus, inter-agent communication

This is the pattern that lets Re-Kon + Elrond (agent #2) + future VF agents behave as one system on the buyer's machine.

### 11.1 Discovery

Every VF agent on startup writes a manifest to `~/.vf/agents/<agent-name>.toml`:

```toml
name = "re-kon"
version = "1.0.0"
socket = "/home/vincent/.vf/re-kon/agent.sock"    # Unix DS on Linux/macOS
# pipe = "\\\\.\\pipe\\vf-re-kon"                 # Windows named pipe
capabilities = ["research.mission.new", "research.mission.get", "research.mission.list"]
publishes  = ["mission.completed", "dossier.ready"]
```

The directory `~/.vf/agents/` is the fleet index. Agents watch it (inotify / ReadDirectoryChangesW / FSEvents) so they see peers appearing and vanishing in real time.

### 11.2 Transport

- **Linux + macOS**: Unix domain sockets, one per agent
- **Windows**: named pipes, one per agent
- **Protocol**: JSON-RPC 2.0
- **Framing**: length-prefixed (u32 big-endian) JSON messages
- No TCP by default. The bus is local-only.

### 11.3 Authentication

- Shared secret in `~/.vf/fleet.key` (0600), generated on first fleet-aware install, rotatable via `vf fleet rekey`
- Every request signs a challenge with HMAC-SHA256 using the shared key
- Rejects any peer that can't sign
- A buyer can disable inter-agent comms entirely (`fleet = "off"` in config)

### 11.4 Calling a capability

```
Elrond wants to run research.

1. Elrond reads ~/.vf/agents/re-kon.toml
2. Elrond opens Re-Kon's socket
3. Elrond sends: {jsonrpc:"2.0", id:42, method:"research.mission.new",
                  params:{brief:"...", opts:{...}}, auth:"hmac-sha256:..."}
4. Re-Kon verifies auth, plans the mission, replies with mission id
5. Re-Kon publishes `mission.completed` event when done
6. Elrond, subscribed, receives the event and pulls the dossier
```

### 11.5 Events

Pub/sub over the same socket. Any agent can `subscribe` to events with a filter (agent name + event pattern). Events are delivered at-least-once and are idempotent by `event_id`.

### 11.6 Capability naming

`<domain>.<object>.<verb>`, e.g. `research.mission.new`, `mail.message.send`, `tax.filing.submit`, `wallet.transaction.list`. VF publishes a public capability registry so third-party fleet agents (not just VF's) can join by matching well-known names.

### 11.7 What breaks with fleet off

Nothing critical. Re-Kon works standalone. Fleet integration is additive; Elrond just can't call Re-Kon until fleet comes back on.

## 12. Licensing + activation

- **Format**: signed JSON. Fields: `licence_id`, `product = "re-kon"`, `tier = "single" | "company"`, `issued_at`, `not_before`, `not_after = null` (perpetual), `hw_fingerprint_max`, `signature (Ed25519)`
- **Signing key**: VF's Ed25519 signing key, public key baked into the binary
- **Activation**: on first run, the app computes the hardware fingerprint (motherboard UUID + primary NIC MAC + machine ID, all hashed with a salt from the licence), submits it either online (form on vfempire.com/agents/activate) or offline (challenge / response codes shown in the UI)
- **Fingerprint rotations**: buyer gets N free rotations (say 3), then contact support (email, human touch, no gate on buying replacement fingerprints. VF's brand promise)
- **Revocation**: none. Once activated, the buyer's binary works forever. If they lose the machine, they support-ticket a new fingerprint; VF's obligation is to honour reasonable requests, not police piracy at the customer's expense.

## 13. Security posture

- **Threat model doc**: `docs/THREAT-MODEL.md` in the repo, covers: (a) exfiltration by a compromised search backend, (b) prompt injection in ingested pages, (c) local-machine attacker with read access to store.sqlite, (d) supply-chain attack on a model backend
- **Prompt-injection**: ingested content is delimited with a signed sentinel; the distiller LLM is instructed with a strict schema and never told to execute retrieved instructions; findings are validated against source excerpts before entering the evidence chain
- **Secrets**: all API keys held in OS keychain (`keyring` crate), never in the SQLite store
- **Sandboxing**: the ingest fetcher runs with a strict URL allowlist per mission (only URLs from the current mission's search results), an outbound-only egress policy, and a 10 MB per-response cap
- **CI**: gitleaks (per your standing security template at `~/vf-security-templates/`), `cargo audit`, `cargo deny`, cargo-vet on all deps

## 14. Distribution

- **Windows**: signed `.msi` and portable `.zip`. SmartScreen warning until Azure signing account unblocks (per current memory arc).
- **macOS**: signed + notarised `.dmg`. Universal binary (x86_64 + arm64).
- **Linux**: `.deb`, `.rpm`, and `AppImage`. Also a Flatpak candidate for later.
- **Direct-from-site**: every artefact download page shows the SHA-256, matching the dual-lane distribution LAW.
- **Auto-update**: opt-in, off by default. When on, checks a signed manifest on vfempire.com; downloads and verifies before installing.

## 15. Testing

- **Unit**: per-crate, standard `cargo test`
- **Integration**: docker-compose stack in `tests/it/`. SearXNG + mock model server + Re-Kon, runs three canned missions and asserts dossier shape
- **Golden missions**: `tests/golden/`, a mission brief, a fixed set of source HTMLs, and a frozen dossier. Snapshot testing catches distillation regressions
- **Fleet tests**: two-agent fixture (Re-Kon + a stub agent) exercising the bus end-to-end
- **CI**: GitHub Actions matrix (Linux + macOS + Windows), gitleaks direct-binary install per `~/vf-security-templates/gitleaks-workflow.yml`

## 16. Observability (buyer's, not ours)

- Structured JSON log at `~/.vf/re-kon/logs/YYYY-MM-DD.jsonl`, rotated at 10 MB, kept 30 days by default
- `re-kon doctor`, verifies model reachability, search reachability, licence validity, fleet peers
- Per-mission cost estimate shown in UI (input × output tokens × the buyer's per-token price, configured in settings)

## 17. Roadmap

**v1.0 (ship target)**
- Windows + macOS + Linux binaries
- OpenAI-compat model backend
- SearXNG + Brave search backends
- Full mission lifecycle
- Evidence chain + Markdown / PDF / JSON export
- Local UI + CLI
- Single-seat + company licences
- Fleet bus (advertise + consume)
- FSL-1.1-ALv2 licence, source on GitHub

**v1.1 (~4 weeks post-launch)**
- Serper + Kagi search backends
- Anthropic native backend (drop the adapter)
- Watch missions (a mission that re-runs on a schedule and diffs against the previous dossier)
- Dossier templating (custom output formats)

**v1.2**
- Mobile companion (read-only dossier viewer for iOS + Android, sync via a paired device on the same LAN)
- Team dossier sharing (encrypted archive with a decryption key held by another Re-Kon seat)

## 18. Site pages the spec implies

- `/agents/`, hub
- `/agents/re-kon`, product page
- `/agents/re-kon/activate`, hardware-fingerprint activation form
- `/agents/re-kon/download`, signed artefacts with SHA-256
- `/agents/re-kon/changelog`, dated release notes
- `/agents/re-kon/docs`, user manual (later)

Everything above ships behind the ship-content LAW: co-built, Vincent-approved piece by piece.

---

## Open decisions requiring Vincent gate

1. **Port choice** (5410 default): OK, or pick a different VF port block slot?
2. **Fingerprint rotations** (3 free): sit with the number or move it?
3. **Auto-update posture** (opt-in, off by default): keep or flip?
4. **Company tier at 10 machines / 10 users**: right shape or should company be unlimited-within-one-org?
5. **Anthropic backend at v1 vs v1.1**: at launch, or after?
6. **Fleet bus at v1**: keep in v1 or push to v1.1? (I lean keep. Elrond will need it, and it's the differentiator vs any single-agent competitor.)
