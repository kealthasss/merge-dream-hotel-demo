#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Merge Dream Hotel Demo — 美术图生成脚本
========================================
生图聚合站（ai.liaobots2.work，模型 gpt-image-2）经 /v1/chat/completions 实测可用，
沙箱与本机均可运行。运行后把所有物品/生成器图标下载到 src/public/assets/items/，
UI 会自动用图替换 emoji（缺失时回退 emoji）。

用法：
    cd <项目根目录>
    python3 scripts/gen_images.py

完成后推送到 GitHub 触发 Pages 即可看到真图：
    git add src/public/assets/items
    git commit -m "art: 生成 18 张物品/生成器美术图"
    git push

可调项（见下方常量）：API_BASE / LOGIN / MODEL。
"""
import os
import re
import sys
import json
import base64
import urllib.request
import urllib.error

API_BASE = "https://ai.liaobots2.work/v1/chat/completions"
LOGIN    = "8ZnfRXtWkWGsO"   # 聚合站登陆码；若需作为其他头，见 HEADERS 注释
MODEL    = "gpt-image-2"     # 经 /v1/chat/completions 实测可用，返回 markdown 图片 URL

# 输出目录：scripts/../src/public/assets/items
OUT_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "src", "public", "assets", "items")
)

# 每个 id 的生成提示词（透明背景、扁平卡通图标、酒店翻修主题、居中简洁）
PROMPTS = {
    # 清洁链
    "cleaning_1": "Game UI icon, a blue cleaning sponge cloth, transparent background, flat cartoon style, centered, simple",
    "cleaning_2": "Game UI icon, a broom, transparent background, flat cartoon style, centered, simple",
    "cleaning_3": "Game UI icon, a mop, transparent background, flat cartoon style, centered, simple",
    "cleaning_4": "Game UI icon, a handheld vacuum cleaner, transparent background, flat cartoon style, centered, simple",
    "cleaning_5": "Game UI icon, a hotel cleaning cart with supplies, transparent background, flat cartoon style, centered, simple",
    # 布草链
    "linen_1": "Game UI icon, a ball of yarn, transparent background, flat cartoon style, centered, simple",
    "linen_2": "Game UI icon, a folded towel, transparent background, flat cartoon style, centered, simple",
    "linen_3": "Game UI icon, a bedsheet, transparent background, flat cartoon style, centered, simple",
    "linen_4": "Game UI icon, a pillow, transparent background, flat cartoon style, centered, simple",
    "linen_5": "Game UI icon, a duvet comforter, transparent background, flat cartoon style, centered, simple",
    # 餐饮链
    "fb_1": "Game UI icon, a wheat stalk, transparent background, flat cartoon style, centered, simple",
    "fb_2": "Game UI icon, a bag of flour, transparent background, flat cartoon style, centered, simple",
    "fb_3": "Game UI icon, a ball of dough, transparent background, flat cartoon style, centered, simple",
    "fb_4": "Game UI icon, a loaf of bread, transparent background, flat cartoon style, centered, simple",
    "fb_5": "Game UI icon, a birthday cake, transparent background, flat cartoon style, centered, simple",
    # 生成器
    "gen_toolbox": "Game UI icon, a toolbox, transparent background, flat cartoon style, centered, simple",
    "gen_linen": "Game UI icon, a laundry basket with linen, transparent background, flat cartoon style, centered, simple",
    "gen_pantry": "Game UI icon, a pantry shelf with food, transparent background, flat cartoon style, centered, simple",
}


def build_headers():
    # 默认 Bearer。若聚合站返回 401，可改为如 {"api-key": LOGIN} 或按文档调整。
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LOGIN}",
        "Accept": "application/json",
    }


def call_api(item_id: str):
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": PROMPTS[item_id]}],
        "stream": False,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(API_BASE, data=data, headers=build_headers())
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_error": e.read().decode("utf-8", "replace")[:400], "_status": e.code}
    except Exception as e:  # noqa: BLE001
        return {"_error": f"{type(e).__name__}: {e}", "_status": 0}


def extract_image(resp: dict):
    """从响应中抽取图片：返回 ('b64', data) 或 ('url', url) 或 None。"""
    if "_error" in resp:
        return None
    msg = (resp.get("choices") or [{}])[0].get("message", {})
    content = msg.get("content", "")
    if isinstance(content, list):  # 多模态 parts
        for part in content:
            if isinstance(part, dict):
                if part.get("image"):
                    return ("b64", part["image"])
                if part.get("image_url"):
                    return ("url", part["image_url"].get("url", ""))
        content = str(content)
    if msg.get("b64_json"):
        return ("b64", msg["b64_json"])
    if "data:image" in content:
        m = re.search(r"data:image/[a-zA-Z0-9.+-]+;base64,[^\s\"'<>]+", content)
        if m:
            return ("b64", m.group(0))
    m = re.search(r"!\[[^\]]*\]\((https?://[^)\s]+)\)", content)
    if m:
        return ("url", m.group(1))
    m = re.search(r"https?://[^\s\"'<>]+\.(?:png|jpe?g|webp|gif)", content)
    if m:
        return ("url", m.group(0))
    return None


def save_image(kind: str, data: str, path: str) -> bool:
    try:
        if kind == "b64":
            if data.startswith("data:image"):
                data = data.split(",", 1)[1]
            with open(path, "wb") as f:
                f.write(base64.b64decode(data))
        else:
            req = urllib.request.Request(data, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                with open(path, "wb") as f:
                    f.write(r.read())
        return True
    except Exception as e:  # noqa: BLE001
        print(f"    [save-fail] {e}")
        return False


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"输出目录: {OUT_DIR}\n")
    ok, fail = 0, 0
    for item_id in PROMPTS:
        out_path = os.path.join(OUT_DIR, f"{item_id}.png")
        if os.path.exists(out_path):
            print(f"[skip] {item_id} 已存在")
            ok += 1
            continue
        print(f"[gen ] {item_id} ...", end=" ", flush=True)
        resp = call_api(item_id)
        if "_error" in resp:
            print(f"API 错误 {resp.get('_status')}: {resp['_error']}")
            fail += 1
            continue
        found = extract_image(resp)
        if not found:
            print("未解析到图片，原始响应片段：")
            print("   ", json.dumps(resp, ensure_ascii=False)[:300])
            fail += 1
            continue
        if save_image(found[0], found[1], out_path):
            print("OK")
            ok += 1
        else:
            fail += 1
    print(f"\n完成：成功 {ok} / 失败 {fail} / 共 {len(PROMPTS)}")
    if fail:
        print("失败项请检查 API_BASE/LOGIN/MODEL 或解析逻辑后重跑（已成功的会跳过）。")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
