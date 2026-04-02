"""
Prismatic Forge — ZARAI AI visual art generator
Three pieces: DOCX cover (portrait), banner (landscape), icon (square)
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import os

FONTS = os.path.expanduser("~/.claude/skills/canvas-design/canvas-fonts")
OUT = os.path.dirname(os.path.abspath(__file__))

DARK = (13, 17, 23)
DARK_ALT = (17, 24, 34)
PINK = (255, 51, 102)
MAG = (204, 51, 255)
PURPLE = (120, 60, 200)
BLUE = (50, 100, 220)
CYAN = (51, 204, 255)
WHITE = (224, 224, 224)
MUTED = (100, 100, 120)
GRADIENT = [PINK, MAG, PURPLE, BLUE, (60, 150, 240), CYAN]
FLAG_NAMES = ["tesla", "noFallbacks", "robust", "verbose", "complex", "sophisticated"]

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def gradient_color(t):
    t = max(0, min(1, t))
    idx = t * (len(GRADIENT) - 1)
    i = min(int(idx), len(GRADIENT) - 2)
    return lerp_color(GRADIENT[i], GRADIENT[i + 1], idx - i)

def draw_hexagon(draw, cx, cy, r, fill, outline=None, width=1):
    pts = []
    for i in range(6):
        a = math.radians(60 * i - 30)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    draw.polygon(pts, fill=fill, outline=outline, width=width)
    return pts

def draw_crystal(draw, cx, cy, h, w, color, alpha=180):
    top = (cx, cy - h // 2)
    left = (cx - w // 2, cy - h // 6)
    right = (cx + w // 2, cy - h // 6)
    bot = (cx, cy + h // 2)
    mid_l = (cx - w // 3, cy + h // 5)
    mid_r = (cx + w // 3, cy + h // 5)
    c_dim = tuple(max(0, v - 60) for v in color)
    c_bright = tuple(min(255, v + 40) for v in color)
    draw.polygon([top, right, bot], fill=color)
    draw.polygon([top, left, bot], fill=c_dim)
    draw.polygon([top, left, mid_l, right], fill=c_bright)
    for pts in [[top, right, bot], [top, left, bot]]:
        draw.line(pts + [pts[0]], fill=(*color, 255), width=2)

def draw_glow(img, cx, cy, radius, color, intensity=0.4):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for r in range(radius, 0, -2):
        a = int(intensity * 255 * (r / radius) ** 0.5 * (1 - r / radius))
        a = max(0, min(255, a))
        od.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, a))
    return Image.alpha_composite(img.convert("RGBA"), overlay)

def font(name, size):
    try:
        return ImageFont.truetype(os.path.join(FONTS, name), size)
    except Exception:
        return ImageFont.load_default()


# ━━━ PIECE 1: DOCX COVER (portrait 1600x2200) ━━━
def create_cover():
    W, H = 1600, 2200
    img = Image.new("RGBA", (W, H), DARK)
    draw = ImageDraw.Draw(img)

    # Forge floor — gradient line river
    for y in range(H * 3 // 4, H):
        t = (y - H * 3 // 4) / (H // 4)
        for x in range(0, W, 3):
            wave = math.sin(x * 0.008 + y * 0.01) * 0.5 + 0.5
            if wave > 0.6 + t * 0.3:
                c = gradient_color(x / W)
                a = int(60 * (1 - t) * (wave - 0.6))
                draw.point((x, y), fill=(*c, max(0, min(255, a))))

    # Cathedral walls — faint geometric etchings
    for i in range(20):
        y_pos = 100 + i * 100
        x_off = (i % 3) * 200 + 50
        c = gradient_color(i / 20)
        c_faint = tuple(v // 6 for v in c)
        draw.rectangle([x_off, y_pos, x_off + 300, y_pos + 2], fill=c_faint)
        draw.rectangle([W - x_off - 300, y_pos + 50, W - x_off, y_pos + 52], fill=c_faint)

    # Six crystalline hammers in arc
    arc_cx, arc_cy = W // 2, H // 2 - 100
    arc_r = 500
    for i in range(6):
        angle = math.radians(-150 + i * 30 + 15)
        cx = arc_cx + int(arc_r * math.cos(angle))
        cy = arc_cy + int(arc_r * math.sin(angle)) - 100
        color = GRADIENT[i]
        img = draw_glow(img, cx, cy, 120, color, 0.35)
        draw = ImageDraw.Draw(img)
        draw_crystal(draw, cx, cy, 200, 80, color)

    # Central anvil — dark geometric form
    anvil_y = H // 2 + 200
    draw.polygon([(W // 2 - 200, anvil_y), (W // 2 + 200, anvil_y),
                   (W // 2 + 160, anvil_y + 80), (W // 2 - 160, anvil_y + 80)],
                  fill=(20, 24, 35))
    draw.polygon([(W // 2 - 160, anvil_y + 80), (W // 2 + 160, anvil_y + 80),
                   (W // 2 + 120, anvil_y + 140), (W // 2 - 120, anvil_y + 140)],
                  fill=(15, 18, 28))
    # Anvil glow seam
    for x in range(W // 2 - 180, W // 2 + 180):
        t = (x - (W // 2 - 180)) / 360
        c = gradient_color(t)
        draw.point((x, anvil_y + 1), fill=(*c, 200))
        draw.point((x, anvil_y + 2), fill=(*c, 140))

    # Sparks / embers rising
    import random
    random.seed(42)
    for _ in range(200):
        sx = random.randint(W // 2 - 300, W // 2 + 300)
        sy = random.randint(anvil_y - 600, anvil_y - 50)
        sz = random.randint(1, 3)
        t = (sx - (W // 2 - 300)) / 600
        c = gradient_color(t)
        a = random.randint(80, 220)
        draw.ellipse([sx - sz, sy - sz, sx + sz, sy + sz], fill=(*c, a))

    # Title text
    f_title = font("BigShoulders-Bold.ttf", 120)
    f_sub = font("Jura-Light.ttf", 48)
    f_tag = font("Tektur-Regular.ttf", 28)

    draw.text((W // 2, 160), "ZARAI AI", fill=PINK, font=f_title, anchor="mt")
    draw.text((W // 2, 300), "PLUGIN MARKETPLACE", fill=WHITE, font=f_sub, anchor="mt")

    # Gradient line under title
    for x in range(W // 2 - 300, W // 2 + 300):
        t = (x - (W // 2 - 300)) / 600
        draw.point((x, 370), fill=gradient_color(t))
        draw.point((x, 371), fill=gradient_color(t))

    draw.text((W // 2, H - 120), "Built to deploy. Not to demo.", fill=PINK, font=f_tag, anchor="mm")
    draw.text((W // 2, H - 70), "EchoAI Labs  |  zarai.ai  |  v1.0.0", fill=MUTED, font=font("JetBrainsMono-Regular.ttf", 18), anchor="mm")

    img.convert("RGB").save(os.path.join(OUT, "docx-cover.png"), quality=95)
    print("Created docx-cover.png")


# ━━━ PIECE 2: BANNER (landscape 1800x600) ━━━
def create_banner():
    W, H = 1800, 600
    img = Image.new("RGBA", (W, H), DARK)
    draw = ImageDraw.Draw(img)

    # Background circuit traces
    import random
    random.seed(7)
    for _ in range(40):
        x1 = random.randint(0, W)
        y1 = random.randint(0, H)
        length = random.randint(80, 300)
        horizontal = random.random() > 0.5
        t = x1 / W
        c = gradient_color(t)
        c_dim = tuple(v // 5 for v in c)
        if horizontal:
            draw.line([(x1, y1), (x1 + length, y1)], fill=c_dim, width=1)
        else:
            draw.line([(x1, y1), (x1, y1 + length)], fill=c_dim, width=1)
        # Node dots at intersections
        draw.ellipse([x1 - 2, y1 - 2, x1 + 2, y1 + 2], fill=c_dim)

    # Six hexagonal flag badges across banner
    badge_y = H // 2
    spacing = W // 8
    start_x = spacing + spacing // 2

    for i in range(6):
        cx = start_x + i * spacing
        color = GRADIENT[i]
        img = draw_glow(img, cx, badge_y, 80, color, 0.3)
        draw = ImageDraw.Draw(img)
        draw_hexagon(draw, cx, badge_y, 55, fill=(*DARK_ALT, 200), outline=color, width=3)
        draw_hexagon(draw, cx, badge_y, 40, fill=None, outline=(*color[:3],), width=1)

        # Flag name below
        f_label = font("JetBrainsMono-Regular.ttf", 14)
        draw.text((cx, badge_y + 75), FLAG_NAMES[i], fill=color, font=f_label, anchor="mt")

    # Left side: ZARAI AI text
    f_brand = font("BigShoulders-Bold.ttf", 72)
    f_sub = font("Jura-Light.ttf", 24)
    draw.text((80, H // 2 - 50), "ZARAI", fill=PINK, font=f_brand, anchor="lm")
    draw.text((80, H // 2 + 20), "AI", fill=CYAN, font=font("BigShoulders-Bold.ttf", 48), anchor="lm")
    draw.text((80, H // 2 + 60), "defense-grade tools", fill=MUTED, font=f_sub, anchor="lm")

    # Gradient line top and bottom
    for x in range(W):
        t = x / W
        c = gradient_color(t)
        draw.point((x, 0), fill=c)
        draw.point((x, 1), fill=c)
        draw.point((x, H - 1), fill=c)
        draw.point((x, H - 2), fill=c)

    img.convert("RGB").save(os.path.join(OUT, "banner.png"), quality=95)
    print("Created banner.png")


# ━━━ PIECE 3: ICON (256x256) ━━━
def create_icon():
    S = 512  # render at 2x, downscale for crispness
    img = Image.new("RGBA", (S, S), DARK)
    draw = ImageDraw.Draw(img)

    # Background hex
    cx, cy = S // 2, S // 2
    draw_hexagon(draw, cx, cy, 230, fill=(20, 26, 38))
    draw_hexagon(draw, cx, cy, 220, fill=None, outline=PURPLE, width=2)

    # Inner glow
    img = draw_glow(img, cx, cy, 200, MAG, 0.15)
    img = draw_glow(img, cx, cy - 30, 100, PINK, 0.25)
    img = draw_glow(img, cx, cy + 30, 100, CYAN, 0.2)
    draw = ImageDraw.Draw(img)

    # Z letterform
    f_z = font("BigShoulders-Bold.ttf", 280)
    draw.text((cx, cy - 10), "Z", fill=PINK, font=f_z, anchor="mm")

    # Overlay a gradient Z by drawing character segments
    # Top bar glow
    for x in range(cx - 80, cx + 80):
        t = (x - (cx - 80)) / 160
        c = gradient_color(t * 0.5)
        draw.point((x, cy - 100), fill=(*c, 180))
        draw.point((x, cy - 99), fill=(*c, 120))

    # Bottom bar glow
    for x in range(cx - 80, cx + 80):
        t = (x - (cx - 80)) / 160
        c = gradient_color(0.5 + t * 0.5)
        draw.point((x, cy + 80), fill=(*c, 180))
        draw.point((x, cy + 81), fill=(*c, 120))

    # Hex outline
    draw_hexagon(draw, cx, cy, 225, fill=None, outline=(*PINK, 150), width=3)

    # Tiny corner markers
    for i in range(6):
        a = math.radians(60 * i - 30)
        px = cx + int(235 * math.cos(a))
        py = cy + int(235 * math.sin(a))
        c = gradient_color(i / 5)
        draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill=c)

    final = img.resize((256, 256), Image.LANCZOS)
    final.convert("RGB").save(os.path.join(OUT, "icon-256.png"), quality=95)
    print("Created icon-256.png")


if __name__ == "__main__":
    create_cover()
    create_banner()
    create_icon()
    print("All pieces generated in", OUT)
