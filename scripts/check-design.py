"""Source-level color contrast check, separate from browser accessibility review."""


def rgb(s):
    values = [int(s[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    return sum(
        w * (v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)
        for w, v in zip((0.2126, 0.7152, 0.0722), values, strict=True)
    )


def contrast(a, b):
    x, y = sorted((rgb(a), rgb(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


pairs = [
    ("body", "#f3eff8", "#24222c"),
    ("secondary", "#c5bdcf", "#24222c"),
    ("muted", "#a79eaf", "#24222c"),
    ("purple label", "#c9acf0", "#332442"),
    ("primary command", "#271c12", "#ffbd3e"),
    ("routine badge", "#ffca52", "#3c3222"),
    ("significant badge", "#f4a1ae", "#402831"),
    ("emergency badge", "#ffbac5", "#532a38"),
    ("completed badge", "#91cfb1", "#23352d"),
]
for label, fg, bg in pairs:
    ratio = contrast(fg, bg)
    print(f"{label}: {ratio:.2f}:1")
    if ratio < 4.5:
        raise SystemExit(f"Contrast failed: {label}")
