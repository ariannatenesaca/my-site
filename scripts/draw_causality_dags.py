"""Draw the four candidate DAGs into public/images/causality/."""

from pathlib import Path

import daft

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "images" / "causality"
OUT_DIR.mkdir(parents=True, exist_ok=True)

SPECS = [
    ("fork", [("Z", "X"), ("Z", "Y")]),
    ("pipe", [("X", "Z"), ("Z", "Y")]),
    ("collider", [("X", "Z"), ("Y", "Z")]),
    ("direct", [("X", "Y")]),
]

for title, edges in SPECS:
    pgm = daft.PGM(shape=[2.6, 2.4], origin=[-0.3, -0.2])
    pgm.add_node("Z", r"$Z$", 1.0, 1.8)
    pgm.add_node("X", r"$X$", 0.35, 0.5)
    pgm.add_node("Y", r"$Y$", 1.65, 0.5)
    for a, b in edges:
        pgm.add_edge(a, b)
    pgm.render()
    out = OUT_DIR / f"{title}.png"
    pgm.savefig(str(out), dpi=140)
    print(f"saved {out.relative_to(ROOT)}")
