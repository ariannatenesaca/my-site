"""
Draw the generative DAG for the investment game and save it where the
site can serve it: public/images/dag.png.
"""

from pathlib import Path

import daft

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "dag.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

# Wealth this year, the stake fraction, and a fair coin together produce
# wealth next year. That step repeats for t = 1, ..., T.
pgm = daft.PGM(shape=[4.4, 2.8], origin=[-0.5, -0.25])
pgm.add_node("Wt", r"$W_t$", 0.7, 0.75)
pgm.add_node("f", r"$f$", 1.9, 2.05)
pgm.add_node("C", r"$C_t$", 3.0, 2.05, observed=True)
pgm.add_node("Wnext", r"$W_{t+1}$", 3.0, 0.75)
pgm.add_edge("Wt", "Wnext")
pgm.add_edge("f", "Wnext")
pgm.add_edge("C", "Wnext")
pgm.add_plate([0.15, 0.15, 3.85, 2.35], label=r"each year $t=1,\ldots,T$", shift=-0.05)

pgm.render()
pgm.savefig(str(OUT), dpi=160)
print(f"saved {OUT.relative_to(ROOT)}")
