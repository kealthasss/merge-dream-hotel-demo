"""
Merge Dream Hotel Demo — 场景底图生成脚本
============================================
用 ai.liaobots2.work + gpt-image-2 生成暖色轻奢酒店场景底图，落到 src/public/assets/bg/。
沙箱已验证该端点可连通（之前 18 张物品图即用此端点）。

用法：
    python3 scripts/gen_bg.py
"""
import os
import re
import json
import urllib.request

API_BASE = "https://ai.liaobots2.work/v1/chat/completions"
LOGIN    = "8ZnfRXtWkWGsO"
MODEL    = "gpt-image-2"
OUT_DIR  = os.path.join(os.path.dirname(__file__), "..", "src", "public", "assets", "bg")

PROMPTS = {
    "board_bg": (
        "Hotel lobby interior, warm luxury ambient, elegant polished wooden floor, "
        "soft golden chandelier lighting, cozy upscale boutique hotel atmosphere, "
        "dark vignette on edges, brighter in the center, top-down board game background style, "
        "no text, no people, no UI elements, no logos, photorealistic game asset, wide angle"
    ),
}

def call_api(prompt: str) -> str | None:
    payload = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }).encode("utf-8")
    req = urllib.request.Request(
        API_BASE, data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LOGIN}",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        content = data["choices"][0]["message"]["content"]
        m = re.search(r"!\[[^\]]*\]\((https?://[^)]+)\)", content)
        if m:
            return m.group(1)
        print("WARN 未匹配到图片 URL，原始响应片段：", content[:300])
        return None
    except Exception as e:
        print("ERR 请求失败:", e)
        return None

def download(url: str, out_path: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, "wb") as f:
                f.write(r.read())
        return True
    except Exception as e:
        print("ERR 下载失败:", e)
        return False

def main():
    for name, prompt in PROMPTS.items():
        print(f"生成 {name} ...")
        url = call_api(prompt)
        if not url:
            continue
        out = os.path.join(OUT_DIR, f"{name}.png")
        if download(url, out):
            print(f"OK -> {out}")

if __name__ == "__main__":
    main()
