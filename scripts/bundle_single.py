"""
把 Vite 产物 (dist/) 重新打包成单个 HTML 文件 (dist-single/index.html)，
方便 Pages 上通过 /dist-single/index.html 访问，也支持本地下载后通过 http 打开。
用法：
    python3 scripts/bundle_single.py
"""
import os
import re
import base64
import mimetypes
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
OUT = ROOT / 'dist-single' / 'index.html'

def file_to_datauri(path: Path) -> str:
    data = path.read_bytes()
    mime = mimetypes.guess_type(str(path))[0] or 'application/octet-stream'
    return f"data:{mime};base64,{base64.b64encode(data).decode()}"

def inline_assets(text: str, base_dir: Path) -> str:
    """把 JS/CSS 中 assets/items/xxx.png 替换为 base64 data URI。"""
    pattern = re.compile(r'(?<=["\'])assets/items/([a-z0-9_]+\.png)(?=["\'])')
    def repl(m):
        rel = m.group(0)
        full = base_dir / rel
        if full.exists():
            return file_to_datauri(full)
        return rel
    return pattern.sub(repl, text)

def main():
    html = (DIST / 'index.html').read_text(encoding='utf-8')

    # inline CSS
    css_match = re.search(r'<link[^>]*href="(./assets/[^"]+\.css)"[^>]*>', html)
    if css_match:
        css_path = DIST / css_match.group(1)
        css = css_path.read_text(encoding='utf-8')
        css = inline_assets(css, DIST)
        html = html.replace(css_match.group(0), f'<style>\n{css}\n</style>')

    # inline JS
    js_match = re.search(r'<script[^>]*src="(./assets/[^"]+\.js)"[^>]*></script>', html)
    if js_match:
        js_path = DIST / js_match.group(1)
        js = js_path.read_text(encoding='utf-8')
        js = inline_assets(js, DIST)
        html = html.replace(js_match.group(0), f'<script type="module">\n{js}\n</script>')

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding='utf-8')

    # 验证
    refs = set(re.findall(r'data:image/png;base64,', html))
    print(f"输出: {OUT} ({OUT.stat().st_size / 1024:.1f} KB)")
    print(f"内联 PNG base64 数量: {len(re.findall(r'data:image/png;base64,', html))}")

if __name__ == '__main__':
    main()
