#!/usr/bin/env python3
"""Architecture / flow figures — arrows meet box edges with a real shaft + head."""

import math
import os

import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon

OUT = "/home/user/stockflow/docs/figures"
SAGE = "#E4EFE8"
SAND = "#F4EFE6"
EDGE = "#1C1916"
INK = "#1C1916"
ARROW = "#1C1916"


def canvas(w, h, xmax=None, ymax=None):
    xmax = w if xmax is None else xmax
    ymax = h if ymax is None else ymax
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, xmax)
    ax.set_ylim(0, ymax)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")
    return fig, ax


class Box:
    def __init__(self, ax, cx, cy, w, h, text, fill=SAGE, size=10):
        self.cx, self.cy, self.w, self.h = cx, cy, w, h
        patch = FancyBboxPatch(
            (cx - w / 2, cy - h / 2),
            w,
            h,
            boxstyle="round,pad=0.012,rounding_size=0.09",
            facecolor=fill,
            edgecolor=EDGE,
            linewidth=1.7,
            zorder=2,
        )
        ax.add_patch(patch)
        ax.text(
            cx,
            cy,
            text,
            ha="center",
            va="center",
            color=INK,
            fontsize=size,
            linespacing=1.32,
            zorder=3,
        )

    def port(self, side, along=0.0):
        along = max(-0.92, min(0.92, along))
        if side == "n":
            return self.cx + along * self.w / 2, self.cy + self.h / 2
        if side == "s":
            return self.cx + along * self.w / 2, self.cy - self.h / 2
        if side == "e":
            return self.cx + self.w / 2, self.cy + along * self.h / 2
        if side == "w":
            return self.cx - self.w / 2, self.cy + along * self.h / 2
        raise ValueError(side)


def _out(side, amount):
    return {
        "n": (0.0, amount),
        "s": (0.0, -amount),
        "e": (amount, 0.0),
        "w": (-amount, 0.0),
    }[side]


def _head(ax, tip_x, tip_y, ux, uy, head, hw):
    bx, by = tip_x - ux * head, tip_y - uy * head
    px, py = -uy, ux
    ax.add_patch(
        Polygon(
            [
                (tip_x, tip_y),
                (bx + px * hw, by + py * hw),
                (bx - px * hw, by - py * hw),
            ],
            closed=True,
            facecolor=ARROW,
            edgecolor=ARROW,
            linewidth=0.3,
            zorder=5,
            joinstyle="miter",
        )
    )
    return bx, by


def arrow(ax, a, sa, b, sb, dual=False, along_a=0.0, along_b=0.0, gap=0.06, head=0.18):
    """Straight arrow; tip sits just outside the destination border."""
    x1, y1 = a.port(sa, along_a)
    x2, y2 = b.port(sb, along_b)
    ox1, oy1 = _out(sa, gap)
    ox2, oy2 = _out(sb, gap)
    x1, y1 = x1 + ox1, y1 + oy1
    x2, y2 = x2 + ox2, y2 + oy2
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy) or 1.0
    ux, uy = dx / length, dy / length
    hw = head * 0.36
    sx, sy = x1, y1
    ex, ey = x2, y2
    if dual:
        sx, sy = _head(ax, x1, y1, -ux, -uy, head, hw)
    ex, ey = _head(ax, x2, y2, ux, uy, head, hw)
    ax.plot(
        [sx, ex],
        [sy, ey],
        color=ARROW,
        linewidth=1.7,
        solid_capstyle="butt",
        solid_joinstyle="miter",
        zorder=4,
        clip_on=False,
    )
    return (x1, y1, x2, y2)


def along_for(parent, child):
    """along on a wide parent edge so the arrow is vertical above/below child.cx."""
    half = parent.w / 2 or 1.0
    return max(-0.9, min(0.9, (child.cx - parent.cx) / half))


def save(fig, name):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=200, bbox_inches="tight", pad_inches=0.28, facecolor="white")
    plt.close(fig)
    print("wrote", path, os.path.getsize(path))


def fig_1_1():
    fig, ax = canvas(10.6, 6.0, 10.6, 6.0)
    buyer = Box(
        ax,
        2.25,
        4.55,
        3.3,
        1.6,
        "Buyer\n/  or  /shop\nMRP · cart · hub",
        size=10.5,
    )
    warehouse = Box(
        ax,
        8.35,
        4.55,
        3.3,
        1.6,
        "Warehouse\n/admin\nCatalog · Stock\nBuying · Floor",
        size=10.5,
    )
    ledger = Box(
        ax,
        5.3,
        1.5,
        3.9,
        1.6,
        "Shared ledger\nproducts · byHub qty\npicks · tickets",
        size=10.5,
    )
    arrow(ax, buyer, "s", ledger, "n", dual=True, along_a=0.42, along_b=-0.55)
    arrow(ax, warehouse, "s", ledger, "n", dual=True, along_a=-0.42, along_b=0.55)
    save(fig, "fig_1_1.png")


def fig_1_2():
    fig, ax = canvas(12.6, 6.0, 12.6, 6.0)
    ax.text(6.3, 5.62, "Order path", ha="center", va="center", fontsize=11, color="#3F3A36")
    ax.text(6.3, 2.58, "Warehouse operations", ha="center", va="center", fontsize=11, color="#3F3A36")

    w, h = 1.95, 1.32
    xs = [1.3, 3.8, 6.3, 8.8, 11.3]
    y1 = 4.2
    boxes = [
        Box(ax, xs[0], y1, w, h, "1. Search\nKMP / RK / fuzzy", size=9.5),
        Box(ax, xs[1], y1, w, h, "2. Cart\n(no qty cut)", size=9.5),
        Box(ax, xs[2], y1, w, h, "3. Place order\ncut hub qty", size=9.5),
        Box(ax, xs[3], y1, w, h, "4. Floor pick\n2-approx schedule", size=9.5),
        Box(ax, xs[4], y1, w, h, "5. Packed\nor Cancel", size=9.5),
    ]
    for a, b in zip(boxes, boxes[1:]):
        arrow(ax, a, "e", b, "w")

    y2 = 1.22
    w2, h2 = 3.35, 1.32
    c6 = Box(ax, 2.2, y2, w2, h2, "6. Buying\nKnapsack POs", size=10)
    c7 = Box(ax, 6.3, y2, w2, h2, "7. Supply\nEdmonds–Karp + Kuhn", size=10)
    c8 = Box(ax, 10.4, y2, w2, h2, "8. Counts\nreservoir sample", size=10)
    arrow(ax, c6, "e", c7, "w")
    arrow(ax, c7, "e", c8, "w")
    save(fig, "fig_1_2.png")


def fig_3_1():
    fig, ax = canvas(11.2, 6.5, 11.2, 6.5)
    fill = SAND
    browser = Box(
        ax,
        5.6,
        5.82,
        9.9,
        0.92,
        "Browser  ·  Vite + React 19  ·  two URLs",
        fill=fill,
        size=11,
    )
    shop = Box(
        ax,
        2.7,
        4.12,
        4.7,
        1.12,
        "ShopLayout\ncatalogue · cart · orders",
        fill=fill,
        size=10.5,
    )
    admin = Box(
        ax,
        8.5,
        4.12,
        4.7,
        1.12,
        "Admin Layout\nCatalog · Stock · Buying · Floor",
        fill=fill,
        size=10.5,
    )
    store = Box(
        ax,
        5.6,
        2.42,
        9.9,
        0.92,
        "StoreProvider  ·  persist localStorage v2  ·  BroadcastChannel",
        fill=fill,
        size=10.5,
    )
    seed = Box(
        ax,
        1.9,
        0.72,
        3.2,
        1.18,
        "seed.js\ncatalogue, hubs\nsuppliers, docks",
        fill=fill,
        size=9.5,
    )
    algos = Box(
        ax,
        5.6,
        0.72,
        3.2,
        1.18,
        "algorithms/\nKMP RK ED DP\nflow match R",
        fill=fill,
        size=9.5,
    )
    lib = Box(
        ax,
        9.3,
        0.72,
        3.2,
        1.18,
        "lib/\nshopSearch\nstock (byHub)",
        fill=fill,
        size=9.5,
    )
    arrow(ax, browser, "s", shop, "n", along_a=along_for(browser, shop))
    arrow(ax, browser, "s", admin, "n", along_a=along_for(browser, admin))
    arrow(ax, shop, "s", store, "n", along_b=along_for(store, shop))
    arrow(ax, admin, "s", store, "n", along_b=along_for(store, admin))
    arrow(ax, store, "s", seed, "n", along_a=along_for(store, seed))
    arrow(ax, store, "s", algos, "n", along_a=along_for(store, algos))
    arrow(ax, store, "s", lib, "n", along_a=along_for(store, lib))
    save(fig, "fig_3_1.png")


def fig_3_2():
    fig, ax = canvas(12.0, 4.6, 12.0, 4.6)
    y = 2.7
    w, h = 2.3, 1.5
    xs = [1.5, 4.5, 7.5, 10.5]
    q = Box(ax, xs[0], y, w, h, "Query q", size=11)
    kmp = Box(ax, xs[1], y, w, h, "KMP\nO(n+m)", size=11)
    rk = Box(ax, xs[2], y, w, h, "Rabin–Karp\navg O(n+m)", size=11)
    ed = Box(ax, xs[3], y, w, h, "Edit distance\nthreshold 3", size=11)
    arrow(ax, q, "e", kmp, "w")
    p2 = arrow(ax, kmp, "e", rk, "w")
    p3 = arrow(ax, rk, "e", ed, "w")
    for pts in (p2, p3):
        ax.text(
            (pts[0] + pts[2]) / 2,
            (pts[1] + pts[3]) / 2 + 0.28,
            "else",
            ha="center",
            va="center",
            fontsize=8.5,
            color="#3F3A36",
            zorder=5,
        )

    hit_k = Box(ax, xs[1], 0.72, 2.15, 0.7, "hit → stop", size=9.5)
    hit_r = Box(ax, xs[2], 0.72, 2.15, 0.7, "hit → stop", size=9.5)
    close = Box(ax, xs[3], 0.72, 2.3, 0.7, "close match", size=9.5)
    arrow(ax, kmp, "s", hit_k, "n")
    arrow(ax, rk, "s", hit_r, "n")
    arrow(ax, ed, "s", close, "n")
    save(fig, "fig_3_2.png")


if __name__ == "__main__":
    fig_1_1()
    fig_1_2()
    fig_3_1()
    fig_3_2()
