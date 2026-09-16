#!/usr/bin/env python3
"""Queue FLUX-dev renders on the German PC ComfyUI (10.1.0.2:8188) and pull results back.

Usage:
    python3 scripts/comfy-flux-render.py <config.json>

Config JSON schema:
    {
      "prompts": [
        {"name": "auto-mate-01", "prompt": "...", "width": 896, "height": 1152, "seed": 42},
        ...
      ],
      "steps": 20,           # default 20
      "guidance": 3.5,       # default 3.5 (flux)
      "sampler": "euler",    # default euler
      "scheduler": "simple", # default simple
      "output_dir": "assets/agents/concepts"
    }
"""
import sys, json, time, urllib.request, urllib.parse, uuid, pathlib, os

COMFY_HOST = "http://10.1.0.2:8188"

def api(path, method="GET", body=None):
    url = COMFY_HOST + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def build_workflow(prompt, width, height, seed, steps=20, guidance=3.5, sampler="euler", scheduler="simple", filename_prefix="render", unet_name="flux1-dev-fp8-unet.safetensors"):
    """Standard FLUX workflow with UNETLoader + DualCLIPLoader + VAELoader."""
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": unet_name, "weight_dtype": "fp8_e4m3fn"}},
        "2": {"class_type": "DualCLIPLoader", "inputs": {"clip_name1": "t5xxl_fp8_e4m3fn.safetensors", "clip_name2": "clip_l.safetensors", "type": "flux"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": prompt}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": ""}},
        "6": {"class_type": "FluxGuidance", "inputs": {"conditioning": ["4", 0], "guidance": guidance}},
        "7": {"class_type": "EmptyLatentImage", "inputs": {"width": width, "height": height, "batch_size": 1}},
        "8": {"class_type": "KSampler", "inputs": {
            "model": ["1", 0], "seed": seed, "steps": steps, "cfg": 1.0,
            "sampler_name": sampler, "scheduler": scheduler, "denoise": 1.0,
            "positive": ["6", 0], "negative": ["5", 0], "latent_image": ["7", 0]
        }},
        "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
        "10": {"class_type": "SaveImage", "inputs": {"images": ["9", 0], "filename_prefix": filename_prefix}},
    }

def queue_prompt(workflow, client_id):
    return api("/prompt", "POST", {"prompt": workflow, "client_id": client_id})

def get_history(prompt_id):
    return api(f"/history/{prompt_id}")

def download_image(filename, subfolder, folder_type, out_path):
    qs = urllib.parse.urlencode({"filename": filename, "subfolder": subfolder, "type": folder_type})
    with urllib.request.urlopen(COMFY_HOST + "/view?" + qs, timeout=60) as r:
        data = r.read()
    pathlib.Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(data)
    return len(data)

def main():
    cfg_path = sys.argv[1]
    cfg = json.loads(pathlib.Path(cfg_path).read_text())
    prompts = cfg["prompts"]
    steps = cfg.get("steps", 20)
    guidance = cfg.get("guidance", 3.5)
    sampler = cfg.get("sampler", "euler")
    scheduler = cfg.get("scheduler", "simple")
    unet_name = cfg.get("unet_name", "flux1-dev-fp8-unet.safetensors")
    out_dir = cfg.get("output_dir", "assets/agents/concepts")
    client_id = str(uuid.uuid4())

    queued = []
    for p in prompts:
        wf = build_workflow(
            prompt=p["prompt"],
            width=p.get("width", 1024),
            height=p.get("height", 1024),
            seed=p.get("seed", 42),
            steps=steps, guidance=guidance, sampler=sampler, scheduler=scheduler,
            filename_prefix=p["name"],
            unet_name=p.get("unet_name", unet_name),
        )
        r = queue_prompt(wf, client_id)
        pid = r["prompt_id"]
        queued.append((p["name"], pid))
        print(f"queued {p['name']} -> {pid}")

    print("\npolling for completion...")
    results = []
    remaining = list(queued)
    start = time.time()
    while remaining:
        time.sleep(3)
        elapsed = int(time.time() - start)
        still = []
        for name, pid in remaining:
            try:
                h = get_history(pid)
            except Exception as e:
                still.append((name, pid)); continue
            if pid in h and h[pid].get("outputs"):
                # find images in outputs
                outs = h[pid]["outputs"]
                imgs = []
                for node_id, node_out in outs.items():
                    for img in node_out.get("images", []):
                        imgs.append(img)
                for i, img in enumerate(imgs):
                    ext = pathlib.Path(img["filename"]).suffix or ".png"
                    local = pathlib.Path(out_dir) / f"{name}{ext}"
                    size = download_image(img["filename"], img.get("subfolder", ""), img.get("type", "output"), str(local))
                    results.append((name, str(local), size))
                    print(f"  [{elapsed:>4}s] {name} -> {local} ({size} bytes)")
            else:
                still.append((name, pid))
        remaining = still
        if remaining:
            print(f"  [{elapsed:>4}s] still waiting: {len(remaining)}")

    print(f"\ndone. {len(results)} images saved:")
    for n, p, s in results:
        print(f"  {n:24s} {p}  ({s} bytes)")

if __name__ == "__main__":
    main()
