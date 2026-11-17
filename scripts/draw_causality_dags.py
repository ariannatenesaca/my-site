"""Draw the four candidate DAGs and save public/images/causality-dags.png."""

from pathlib import Path

import daft
import matplotlib.image as mpimg
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "causality-dags.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

SPECS = [
    ("fork", [("Z", "X"), ("Z", "Y")]),
    ("pipe", [("X", "Z"), ("Z", "Y")]),
    ("collider", [("X", "Z"), ("Y", "Z")]),
    ("direct", [("X", "Y")]),
]

tmp_dir = ROOT / "public" / "images" / "_dag_parts"
tmp_dir.mkdir(parents=True, exist_ok=True)
parts = []
for title, edges in SPECS:
    pgm = daft.PGM(shape=[2.6, 2.4], origin=[-0.3, -0.2])
    pgm.add_node("Z", r"$Z$", 1.0, 1.8)
    pgm.add_node("X", r"$X$", 0.35, 0.5)
    pgm.add_node("Y", r"$Y$", 1.65, 0.5)
    for a, b in edges:
        pgm.add_edge(a, b)
    pgm.render()
    part = tmp_dir / f"{title}.png"
    pgm.savefig(str(part), dpi=140)
    parts.append((title, part))

fig, axes = plt.subplots(1, 4, figsize=(12, 3.2))
for ax, (title, part) in zip(axes, parts):
    ax.imshow(mpimg.imread(part))
    ax.set_title(title, fontsize=12)
    ax.axis("off")
fig.tight_layout()
fig.savefig(OUT, dpi=150, facecolor="white")
plt.close(fig)
for _, part in parts:
    part.unlink(missing_ok=True)
tmp_dir.rmdir()
print(f"saved {OUT.relative_to(ROOT)}")
