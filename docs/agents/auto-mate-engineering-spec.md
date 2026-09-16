# Auto-Mate, engineering specification

**Version**: 0.1 (draft, pending Vincent gate)
**Date**: 2026-09-16
**Product**: Auto-Mate, the floating-input-box agent that runs anything on your machine or browser
**Company**: VF Empire Corp Ltd (Malta, C 94160)
**Licence**: FSL-1.1-ALv2 (source-available, commercial after 2 years)
**Distribution**: one-time purchase, perpetual licence, runs on customer hardware
**Sibling**: Re-Kon (research & recon agent), composable via the fleet bus

---

## 1. Product context

Auto-Mate is the second agent in the VF Empire fleet and the intended day-to-day face of it. It is a **floating input box** summoned by a global hotkey. The buyer types intent in plain language; Auto-Mate classifies the intent, plans an action, previews it, and, on one confirmation keystroke, executes it on the machine, in a sandboxed bundled Chromium browser, or by routing to a specialist VF agent (Re-Kon for research, VF Mail for mail, FileIT for tax, etc.).

Design constraints, all load-bearing:

- **One-time purchase, perpetual licence.** No subscription. Buyer owns it. Same posture as Re-Kon.
- **Runs on the buyer's hardware.** Windows, macOS, Linux. Nothing traverses VF servers.
- **BYO model.** OpenAI-compatible endpoint (Ollama / LM Studio / vLLM local, or their cloud key).
- **Dry-run preview then confirm** on every machine-changing action (locked with Vincent). Buyer sees exactly what will happen before it happens.
- **Bundled sandboxed Chromium** for browser tasks (locked with Vincent). No touch to the buyer's real Chrome profile unless they explicitly whitelist a domain.
- **Fleet-native.** Discovers Re-Kon and any other VF agent installed on the same machine; exposes their capabilities in the input box as commands.
- **PrivacyKit LAW.** No queries, no history, no artefacts leave the machine without a deliberate export.
- **Permanence Guarantee.** No licence server call after activation; binary works forever.

## 2. Non-goals

- Not a chat assistant. No conversational memory across sessions by default. Every invocation is a discrete mission with a discrete result.
- Not a general RPA platform. Auto-Mate targets the buyer's own daily desktop and browser work, not enterprise headless automation.
- Not an ambient dictation product. It is summoned on demand by hotkey; it does not listen passively.
- Not a screen-scraping surveillance product. It reads the screen only when the current action requires it, and only within the scope of that action.
- Not a cloud service. Ever.

## 3. Repo shape

Single Cargo workspace: `github.com/vfempire-hq/auto-mate`

```
auto-mate/
  Cargo.toml               # workspace root, license = "LicenseRef-FSL-1.1-ALv2"
  LICENSE                  # FSL-1.1-ALv2 text
  crates/
    automate-core/         # invocation model + lifecycle + confirmation gates
    automate-window/       # floating input window (platform-conditional)
    automate-hotkey/       # global hotkey subsystem (platform-conditional)
    automate-classify/     # LLM-driven intent classifier
    automate-machine/      # machine execution: shell, files, apps, screen
    automate-browser/      # bundled Chromium driver + sandbox
    automate-fleet/        # fleet-bus CLIENT (peer discovery + rpc calls + event sub)
    automate-model/        # OpenAI-compatible model backend (shared with re-kon-model? see §17)
    automate-store/        # sqlite, PrivacyKit-encrypted at rest
    automate-licence/      # Ed25519 licence verification + hw fingerprint (shared crate w/ re-kon-licence)
    automate-ui/            # settings + activity panel served on localhost
    automate-cli/           # `automate ...` CLI (mostly for diagnostics)
    automate-app/           # binary target
  vendor/
    chromium/              # bundled Chromium build (produced by CI, not in git)
  docs/
    ARCHITECTURE.md
    INVOCATION-LIFECYCLE.md
    ACTION-LIBRARY.md
    BROWSER-SANDBOX.md
    THREAT-MODEL.md
  ui/                       # static assets for the floating window + settings panel
  tests/
    golden/                # frozen invocation → frozen action plan snapshots
    e2e/                   # headless invocation against real bundled Chromium
```

## 4. Architecture overview

Auto-Mate is a long-lived user-space process that owns three things at once: (a) a global hotkey listener, (b) a floating window that appears when the hotkey fires, and (c) a state machine that drives every invocation from summon to done.

On startup:

1. Read `~/.vf/auto-mate/config.toml`.
2. Open `~/.vf/auto-mate/store.sqlite` (create + migrate on first run).
3. Load licence, verify signature, check hardware fingerprint.
4. Write manifest to `~/.vf/agents/auto-mate.toml`, advertises Auto-Mate's own capabilities (`automate.invoke.new`, `automate.action.execute`, etc.).
5. Scan `~/.vf/agents/*.toml` for peer agents; open their sockets on demand.
6. Register the global hotkey.
7. Prepare (but do not show) the floating window.
8. Start the local settings UI on `127.0.0.1:5420` (loopback, off by default, a click in the tray to open).
9. Idle.

**Ports** (VF port block):
- `5420`, settings + activity panel (loopback)
- `5421`, internal health (loopback)
- Chromium CDP port assigned dynamically at Chromium launch, only bound to loopback

**Runtime**: Rust stable, `tokio`, native window frameworks per platform (see §11), `chromiumoxide` or a bespoke minimal CDP client for the bundled Chromium, `rusqlite`, `ed25519-dalek`, `argon2`, `serde_json`.

## 5. Invocation lifecycle

An invocation is Auto-Mate's unit of work. Six stages, every one persisted so nothing is lost if the process is killed mid-flight.

```
Summon → Type → Classify → Plan → Confirm → Execute → Result
   ↓       ↓       ↓         ↓        ↓         ↓        ↓
   -    stored  stored    stored   stored   stored   stored
```

### 5.1 Summon

The buyer presses the global hotkey. Auto-Mate:
- Fades in the floating window at last-position or screen-centre (configurable)
- Grabs keyboard focus
- Starts recording latency for the "type → classify → preview" round trip (SLO: <400 ms from Enter to preview showing)

### 5.2 Type

Input is a single-line grow-to-multiline textbox. Enter submits (Shift+Enter for newline). Two secondary keys:

- `/`, opens capability autocomplete: lists every capability advertised by every fleet peer (`> research …`, `> mail …`, `> tax …`), plus Auto-Mate's own built-in verbs.
- `?`, opens quick-help overlay for the current input (what will happen, no execution).

### 5.3 Classify

One LLM call to the configured classifier model. Structured output only, the LLM is instructed to return JSON matching this schema:

```json
{
  "intent_class": "machine" | "browser" | "fleet" | "compound",
  "fleet_agent": "re-kon" | "vf-mail" | "fileit" | null,
  "fleet_capability": "research.mission.new" | null,
  "confidence": 0.0..1.0,
  "requires_confirmation": true | false,
  "brief_summary": "one sentence, what the user asked for"
}
```

If `confidence < 0.7`, Auto-Mate shows a disambiguation strip ("Did you mean: (1) research this, (2) open a browser tab, (3) run a shell command"). Otherwise proceeds to Plan.

### 5.4 Plan

The classifier's `intent_class` selects a **planner**:

- `machine` → Machine planner (§7) produces an `ActionPlan` of typed machine ops
- `browser` → Browser planner (§8) produces an `ActionPlan` of typed browser ops
- `fleet` → Fleet client (§9) calls the target agent's `.new` capability directly with the brief and returns a `MissionRef`
- `compound` → Sequences the above (e.g. "download the latest PDFs from this page and file them" = browser sub-plan then a fleet call to FileIT)

An `ActionPlan` is a directed graph of typed actions with declared side-effects. Every action has:

```rust
pub struct Action {
    pub id: Uuid,
    pub kind: ActionKind,        // one of the typed variants (see §7 §8)
    pub inputs: Value,           // structured params
    pub side_effects: Vec<Effect>, // FS writes, network calls, UI clicks, etc
    pub reversible: bool,
    pub preview: String,         // human-readable, shown in the confirm panel
    pub depends_on: Vec<Uuid>,   // DAG edges
}
```

### 5.5 Confirm

**This is the load-bearing safety gate.** Locked with Vincent: every machine-changing or browser-executing action requires explicit confirmation. The floating window expands to show a preview panel:

- Each planned action listed with its `preview` text
- Colour-coded by reversibility (green = read-only, blue = reversible write, amber = irreversible write, red = destructive)
- Any action reading a file shows the file path and size
- Any action writing shows the destination + diff / new-content sample
- Any browser action shows the target URL, action kind (click, type, download), and target element preview

Buyer confirms with `Enter`, edits the plan with `E` (opens the ActionPlan as JSON in their editor), cancels with `Esc`. Read-only actions (screenshot, search-only) can be configured to skip confirmation.

### 5.6 Execute

The executor walks the DAG. Machine ops go to `automate-machine`; browser ops go to `automate-browser`; fleet ops go to the target agent's socket via `automate-fleet`.

Every action logs: start-time, end-time, exit status, any produced artefact (file path, download path, dossier ref). Stream of updates back to the floating window so the buyer sees progress.

### 5.7 Result

Final state stored in SQLite. The floating window shows a compact summary:
- What was done
- Where the artefacts are (paths, URLs, dossier IDs)
- Reversal offer if any actions are undoable
- `L` opens the invocation in the activity panel for full detail

Then fades out (default) or stays sticky (buyer choice).

## 6. Intent classifier

A single, tightly-scoped LLM call. The system prompt is baked in and versioned in the binary; users cannot edit it (this is a safety and quality gate). The classifier is optimised for latency:

- Small model recommended (7–8B local, or a fast cloud tier like `claude-haiku-4-5-20251001`)
- Max output ~200 tokens (schema is small)
- Streaming disabled (need the full JSON before proceeding)
- Retries: one retry with a stricter re-prompt if JSON parse fails; hard-fall to disambiguation strip after that

The classifier is deliberately NOT the planner. Cleaner separation: classify what the buyer wants, then a specialist planner shapes the actions. Cheaper, faster, easier to test, easier to audit.

## 7. Machine execution subsystem

Typed action library, a closed set of variants. New action types require a code change (and a threat-model review). No open-ended shell execution by default.

```rust
pub enum MachineAction {
    ReadFile      { path: PathBuf },
    ListDir       { path: PathBuf, glob: Option<String> },
    WriteFile     { path: PathBuf, content: Bytes, mode: WriteMode },  // WriteMode = Create | Overwrite | Append
    MoveFile      { from: PathBuf, to: PathBuf },
    CopyFile      { from: PathBuf, to: PathBuf },
    DeleteFile    { path: PathBuf, trash: bool },                       // trash=true = OS trash, not immediate delete
    LaunchApp     { app: AppRef, args: Vec<String> },
    KillProcess   { selector: ProcessSelector },
    Screenshot    { target: ScreenshotTarget, save_to: PathBuf },
    Shell         { cmd: String, args: Vec<String>, cwd: PathBuf },     // gated + previewed, opt-in class
    Clipboard     { op: ClipboardOp },
    Notification  { title: String, body: String },
}
```

**Path scoping**: by default Auto-Mate can only touch paths inside the buyer's home directory + configured extra roots. System paths (`/etc`, `C:\Windows`, `/System`) are refused. Buyer can widen scope in settings; every widening writes a settings-log entry.

**Shell** is behind a per-invocation confirm plus a global on/off switch (default: on for macOS/Linux, off for Windows to reduce PowerShell blast radius on first-run). Shell command previews show the exact command string and the effective `cwd`.

**Reversibility layer**: `WriteFile` (overwrite) and `DeleteFile` (non-trash) create a `.automate-undo/<uuid>` sidecar with the prior content before the change; `automate undo <invocation-id>` restores them.

**Screen understanding**: for actions like "click on the settings icon", Auto-Mate takes a screenshot, sends it plus a target description to a vision-capable model (buyer's choice; Auto-Mate degrades to keyboard-only automation if no vision model is configured), gets coordinates back, executes a click. The screenshot is deleted from memory after the action unless the buyer opted into a session log.

## 8. Browser execution subsystem

Bundled Chromium, locked with Vincent. Rationale: clean security boundary, buyer's real cookies never touched unless whitelisted.

### 8.1 The bundle

- CI builds a Chromium tarball per platform, signed, hosted at `vfempire.com/agents/auto-mate/chromium/<version>/<sha256>`
- First-run download prompt (Chromium is ~150 MB); explicit opt-in
- Chromium runs under a dedicated profile at `~/.vf/auto-mate/chromium/`
- CDP endpoint bound to `127.0.0.1:<dynamic-port>`, ephemeral token in `~/.vf/auto-mate/cdp.token`

### 8.2 Typed browser actions

```rust
pub enum BrowserAction {
    Navigate     { url: Url, wait_for: WaitCondition },
    Click        { selector: Selector, timeout: Duration },
    Type         { selector: Selector, text: String, secret: bool },   // secret=true suppresses text in logs
    Select       { selector: Selector, value: String },
    Submit       { selector: Selector },
    Download     { url: Url, save_to: PathBuf },
    ExtractText  { selector: Selector },
    ExtractHtml  { selector: Selector },
    Screenshot   { target: ScreenshotTarget, save_to: PathBuf },
    WaitFor      { condition: WaitCondition, timeout: Duration },
    Cookie       { op: CookieOp },  // gated, requires per-domain whitelist
}
```

Selectors: CSS, XPath, or a semantic accessibility-tree query (`role=button name="Sign in"`) resolved via CDP's `Accessibility` domain, more resilient to markup churn.

### 8.3 Sandbox rules

- No arbitrary JS execution from the LLM. Auto-Mate's browser planner produces only typed actions; the LLM cannot inject `page.evaluate(...)` scripts. This is a hard architectural gate.
- Per-domain whitelist required for: sending cookies from the buyer's real Chrome profile (opt-in per-domain), file uploads from paths outside the download folder, granting geolocation or camera.
- Every session records a JSON activity log in `~/.vf/auto-mate/browser-logs/YYYY-MM-DD.jsonl` (rotated, kept 30 days).

### 8.4 Attach-mode (deliberately deferred to v1.1)

Vincent's answer locked bundled-sandboxed for v1. Attach-to-existing-Chromium (via `--user-data-dir` + CDP, per the trap already in memory) is scoped for v1.1 as an advanced setting with strong safety copy, not the default.

## 9. Fleet consumption

Auto-Mate is the primary fleet consumer. It advertises `automate.*` capabilities (useful for other agents that want a UI channel) but its main behaviour is calling out.

- On startup: reads `~/.vf/agents/*.toml`, cataloguing each peer's `capabilities` and `publishes` lists
- On directory change (inotify/FSEvents/ReadDirectoryChangesW): re-scans and updates the in-memory catalogue
- On invocation classified as `fleet`: opens the peer's socket, sends the RPC signed with the fleet secret, streams progress back to the floating window
- Subscribes to `mission.completed` and `dossier.ready` events from all peers so it can notify the buyer when a long-running peer job finishes

**The Re-Kon ↔ Auto-Mate composition** (v1 day-one flow):

```
buyer types: "everything filed by Meta in the EU in the last 90 days"

  classifier decides intent_class=fleet, fleet_agent=re-kon, capability=research.mission.new
  Auto-Mate confirm-panel shows: "Route to Re-Kon, research mission (Enter to confirm)"
  buyer hits Enter

  Auto-Mate opens ~/.vf/re-kon/agent.sock
  Auto-Mate sends: {method: research.mission.new, params: {brief: "...", ...}}
  Re-Kon returns: {result: {mission_id: "abc123"}}

  Auto-Mate shows floating-window progress bar tied to Re-Kon's mission progress events
  When Re-Kon publishes mission.completed(mission_id=abc123),
    Auto-Mate calls research.mission.get and opens the dossier preview panel
```

Whole flow completes without leaving the floating window and without a single query touching VF-controlled infrastructure.

## 10. Floating window platform impls

Native windowing per platform, unified behind `automate-window`'s `Window` trait.

### 10.1 Linux (X11 + Wayland)

- X11: layer-shell-style via `x11rb`; window class `auto-mate`, `_NET_WM_WINDOW_TYPE_UTILITY`, `override_redirect=true` when compositor allows
- Wayland: `wlr-layer-shell-v1` on wlroots compositors; on GNOME (no layer-shell), fall back to a client-side always-on-top window with careful focus management
- Multi-monitor: window appears on the monitor with current pointer focus

### 10.2 macOS

- `NSPanel` with `nonactivatingPanel` style so summoning doesn't yank focus from the underlying app
- `.canJoinAllSpaces` + `.fullScreenAuxiliary` so it appears over full-screen apps
- Ships as a `.app` with a menu bar item; the app itself is `LSUIElement=YES` (no dock icon)

### 10.3 Windows

- `HWND` created with `WS_EX_TOOLWINDOW | WS_EX_TOPMOST`
- Custom render via a `IDCompositionSurface` (crisp corners, no client-area black flash)
- Custom keyboard hook so the input box works over full-screen apps without stealing focus destructively

Chrome across all three: minimal, a rounded-rect input, a subtle Auto-Mate mark (see §18), no visible title bar. House palette (paper #fbfbfd background, ink text, `--core` blue accent for focus ring). Light theme only.

## 11. Global hotkey subsystem

Per-platform APIs:

- Linux X11: `XGrabKey` on the root window (documented flaky under some WMs; fall back to `evdev` reader with permission escalation prompt at install)
- Linux Wayland: no compositor-agnostic API; ship with instructions to bind the hotkey to a `dbus-send` command in the compositor's own settings. Second-class UX on Wayland, flag as a known gap in v1 launch notes.
- macOS: `CGEventTap` (requires Accessibility permission on first-run, one-time system dialog)
- Windows: `RegisterHotKey`

Default binding: `Ctrl+Space` (Linux/Windows), `Cmd+Shift+Space` (macOS, leaves Spotlight untouched). Rebindable in settings.

**Feedback trap acknowledged**: PC stuck-modifier keys (Alt+F4 killed a session in prior memory). Auto-Mate never binds destructive combos and never holds modifiers longer than the OS event needs; input-hook watchdog releases stuck modifiers if it detects them.

## 12. Storage

- SQLite bundled, `~/.vf/auto-mate/store.sqlite`
- Tables: `invocations`, `action_plans`, `actions`, `results`, `undo_log`, `settings_log`, `browser_activity`, `fleet_peers_cache`
- Migrations tracked by `refinery`
- Encryption: sensitive columns (input text, action inputs, results) encrypted per-record with a key derived via Argon2id from an OS-keychain entry
- Retention defaults: invocations kept 90 days, `.automate-undo/*` kept 30 days, both buyer-configurable
- Export: `automate export --since <date>` produces a portable archive

## 13. Licensing

Same posture as Re-Kon, see `re-kon-engineering-spec.md` §12. The `automate-licence` and `re-kon-licence` crates share code so both products validate against the same VF signing key. Separate product IDs (`auto-mate` / `re-kon`); separate purchase, separate hardware fingerprint bound to each.

Auto-Mate proposed tiers:
- **Single Seat**: €149 one-time, one machine, all features
- **Company Seat**: €499 one-time, up to 10 machines / 10 users, priority support
- Founding pricing: **€89** (first 100) single, **€299** (first 25) company

Bundle proposed (deferred to Vincent):
- **Re-Kon + Auto-Mate together**: €249 single (vs €149+€149=€298 standalone), €799 company (vs €998). Bundle appears on both product pages as an upsell.

## 14. Security threat model

Full doc lives in `docs/THREAT-MODEL.md` in the repo. Headline items:

- **Prompt injection via the classifier LLM**, attacker crafts input that manipulates the classifier's JSON output. Mitigation: strict schema validation, disambiguation strip on low-confidence, `Shell` action gated behind global setting, no shell execution from `fleet` intents.
- **Prompt injection via page content in browser sessions**, attacker's page tries to steer Auto-Mate's next action via visible text. Mitigation: planner never reads page content back into itself unless the buyer explicitly enables "adaptive browser flows" (off by default in v1).
- **Local attacker with FS read access**, reads `store.sqlite` for buyer history. Mitigation: per-record encryption + OS-keychain-derived key. If the OS keychain is compromised the attacker has the machine anyway.
- **Malicious peer on the fleet bus**, pretends to be a legitimate agent. Mitigation: HMAC-SHA256 signed with the fleet shared secret in `~/.vf/fleet.key` (0600); peers advertising unrecognised capability namespaces get a first-use consent prompt.
- **Supply-chain on bundled Chromium**. CI-built, signed with VF's key, verified on install; buyer can pin a specific hash in settings.
- **Screenshot exfil**. Auto-Mate's screenshots are stored under `~/.vf/auto-mate/screenshots/<uuid>.png` and deleted after the action unless the buyer opted in to a session log.
- **CI**: gitleaks, `cargo audit`, `cargo deny`, cargo-vet on deps.

## 15. Distribution

- **Windows**: signed `.msi` + portable `.zip`. SmartScreen warning until Azure signing account unblocks.
- **macOS**: signed + notarised `.dmg`, universal binary. First-run walks the buyer through Accessibility permission for global hotkey + screen recording.
- **Linux**: `.deb`, `.rpm`, `AppImage`. Wayland caveat flagged in the install page.
- **Chromium bundle**: separate signed tarball, fetched on first-run with SHA-256 verification (per dual-lane distribution LAW pattern).
- **Auto-update**: opt-in, off by default. Same posture as Re-Kon.

## 16. Testing

- **Unit**: per-crate. Machine-action library and browser-action library each have exhaustive param-parsing + preview-generation tests.
- **Golden invocations**: `tests/golden/`, a fixed input string, a fixed classifier mock, an expected `ActionPlan` snapshot. Regression guard on planner behaviour.
- **Browser E2E**: `tests/e2e/`, launches the bundled Chromium against a local fixture site, exercises every `BrowserAction` variant.
- **Fleet-composition test**: two-process fixture (Auto-Mate + a Re-Kon stub) verifying end-to-end intent → route → dossier flow.
- **Hotkey conformance**: platform-specific harness ensuring the global hotkey summons the window under representative WMs / compositors.

## 17. Shared crates with Re-Kon

To avoid drift and cut maintenance:

- `vf-fleet`, the bus (server + client + protocol). Re-Kon depends on it as an advertiser, Auto-Mate as a consumer.
- `vf-licence`. Ed25519 licence verification + hardware fingerprinting.
- `vf-model`, the OpenAI-compatible model backend crate, reused by any agent that talks to an LLM.
- `vf-privacy-kit`, sealed identity + sealed transport + at-rest encryption, per the PrivacyKit LAW.

These live in a separate GitHub org repo `github.com/vfempire-hq/vf-agent-kit` and are published as internal crates, versioned semver.

## 18. Roadmap

**v1.0 (ship target)**
- Windows + macOS + Linux binaries
- Floating window with global hotkey
- Intent classifier (single LLM call, JSON schema)
- Machine execution: full typed action library + dry-run confirm + undo layer
- Browser execution: bundled sandboxed Chromium + typed action library
- Fleet consumption: discovery + RPC + event subscription (against Re-Kon v1 + any third-party agent following the protocol)
- Single-seat + company licences
- FSL-1.1-ALv2, source on GitHub

**v1.1 (~4 weeks post-launch)**
- Attach-to-existing-Chromium mode (opt-in, safety-heavy UX)
- Adaptive browser flows (planner reads page content to shape next action, opt-in)
- Workflow save + rerun (a completed invocation becomes a saved macro)
- Wayland global-hotkey polish (compositor plugins for GNOME + KDE)

**v1.2**
- Mobile companion (approve/deny an Auto-Mate confirmation from your phone via the paired-device LAN protocol)
- Voice input (local Whisper), a spoken invocation becomes text before Classify

## 19. Site pages implied

- `/agents/`, hub (already scoped)
- `/agents/auto-mate`, product page
- `/agents/auto-mate/activate`, hardware-fingerprint activation
- `/agents/auto-mate/download`, signed artefacts + Chromium bundle + SHA-256
- `/agents/auto-mate/changelog`
- `/agents/auto-mate/docs`
- `/bundle/re-kon-plus-auto-mate`, bundle offer page (if Vincent gates the bundle)

## 20. Visual identity notes

Same house palette. Auto-Mate's mark suggested: a rounded-square emblem with a subtle horizontal line inside, reads as "input box", not "person" or "creature". TM-clean, machine-honest, house-consistent. Full brief on render lane (German PC forge) once tunnel is up.

---

## Open decisions requiring Vincent gate

1. **Default hotkey** (Ctrl+Space Linux/Windows, Cmd+Shift+Space macOS): keep, or pick different defaults?
2. **Shell action default** (on for macOS/Linux, off for Windows): keep, or on-everywhere / off-everywhere?
3. **Bundle offer** (Re-Kon+Auto-Mate at €249 single / €799 company): add to plan, or ship products separately first?
4. **Wayland global-hotkey gap**: acceptable v1 caveat, or ship-blocker?
5. **Workflow-save-and-rerun feature** (v1.1 as planned, or pull forward into v1)?
