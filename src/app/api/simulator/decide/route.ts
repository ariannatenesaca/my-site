import { NextResponse } from "next/server";
import { saveLatest, type CandidateSummary } from "@/lib/simulator-store";

const N_PATHS = 12_000;

function quantile(sorted: number[], q: number): number {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - i) + sorted[hi] * (i - lo);
}

function simulateStrategy(f: number, u: number, d: number, years: number, buyIn: number): CandidateSummary {
  const finals = new Array<number>(N_PATHS);
  let losses = 0;
  for (let p = 0; p < N_PATHS; p++) {
    let w = buyIn;
    for (let t = 0; t < years; t++) {
      const r = Math.random() < 0.5 ? u : -d;
      w *= 1 + f * r;
    }
    finals[p] = w;
    if (w < buyIn) losses += 1;
  }
  finals.sort((a, b) => a - b);
  return {
    fraction: f,
    p5: quantile(finals, 0.05),
    p25: quantile(finals, 0.25),
    median: quantile(finals, 0.5),
    p75: quantile(finals, 0.75),
    p95: quantile(finals, 0.95),
    probLoss: losses / N_PATHS,
  };
}

export async function POST(req: Request) {
  const game = await req.json().catch(() => null);
  if (!game || game.type !== "investment-game") {
    return NextResponse.json(
      { error: "expected a JSON investment-game with type, upPct, downPct, horizonYears, buyIn, candidateFractions" },
      { status: 400 }
    );
  }

  const u = Number(game.upPct) / 100;
  const d = Number(game.downPct) / 100;
  const years = Number(game.horizonYears);
  const buyIn = Number(game.buyIn);
  const fractions: number[] = game.candidateFractions;
  if (!Array.isArray(fractions) || fractions.length === 0) {
    return NextResponse.json({ error: "candidateFractions must be a non-empty array" }, { status: 400 });
  }

  const candidates = fractions.map((f) => simulateStrategy(f, u, d, years, buyIn));
  const best = candidates.reduce((a, b) => (b.median > a.median ? b : a));

  const answer = {
    recommendedFraction: best.fraction,
    medianFinalBalance: best.median,
    probLoss: best.probLoss,
    reasoning:
      "This stake grows the typical (median) path the most: each year only the staked slice is flipped by the coin, and a smaller fraction dies less often than betting everything.",
  };

  await saveLatest(game, answer, candidates);
  return NextResponse.json(answer);
}
