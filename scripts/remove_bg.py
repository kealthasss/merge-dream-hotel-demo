"""
移除物品 PNG 的纯色/渐变背景，输出透明底图标。
策略：从四边框向内 flood-fill，只移除与边框背景色连通且颜色接近的像素。
对已带 alpha 通道（四角透明）的图片跳过处理，避免误伤。
"""
import os
import shutil
from collections import deque
from PIL import Image
import numpy as np

SRC_DIR = 'src/public/assets/items'
ORIG_DIR = os.path.join(SRC_DIR, '.orig')
TOL = 30          # 背景色容差（RGB 欧氏距离）
MARGIN = 8        # 采样边框宽度


def color_dist(c1, c2):
    return np.linalg.norm(c1.astype(float) - c2.astype(float))


def is_already_transparent(path):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()
    # 四角是否都已透明
    return all(px[x, y][3] < 128 for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])


def remove_bg(path, out, tol=TOL, margin=MARGIN):
    im = Image.open(path).convert('RGBA')
    a = np.array(im)
    h, w = a.shape[:2]

    # 从边缘采样背景色（中位数，抗噪）
    top = a[:margin, :, :3].reshape(-1, 3)
    bot = a[-margin:, :, :3].reshape(-1, 3)
    left = a[:, :margin, :3].reshape(-1, 3)
    right = a[:, -margin:, :3].reshape(-1, 3)
    border = np.vstack([top, bot, left, right])
    bg = np.median(border, axis=0)

    # 背景候选蒙版
    rgb = a[:, :, :3].astype(float)
    dist = np.linalg.norm(rgb - bg, axis=2)
    bg_mask = dist < tol

    # 从四边框开始 flood-fill（4 连通）
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for y in range(h):
        for x in (0, w - 1):
            if bg_mask[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((x, y))
    for x in range(w):
        for y in (0, h - 1):
            if bg_mask[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx] and bg_mask[ny, nx]:
                visited[ny, nx] = True
                q.append((nx, ny))

    # 被 flood-fill 到的像素设为透明
    a[visited, 3] = 0
    Image.fromarray(a, 'RGBA').save(out)
    return bg


def main():
    os.makedirs(ORIG_DIR, exist_ok=True)
    files = sorted(f for f in os.listdir(SRC_DIR) if f.endswith('.png'))
    for f in files:
        src = os.path.join(SRC_DIR, f)
        orig = os.path.join(ORIG_DIR, f)
        # 首次运行备份原图
        if not os.path.exists(orig):
            shutil.copy(src, orig)
        if is_already_transparent(src):
            print(f"SKIP {f} (already transparent)")
            continue
        bg = remove_bg(src, src)
        print(f"REMOVE_BG {f} bg={bg.astype(int)}")


if __name__ == '__main__':
    main()
