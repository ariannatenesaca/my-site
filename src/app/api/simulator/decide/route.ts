import { NextResponse } from "next/server";
import { saveLatestGame } from "@/lib/simulator-store";

const N_PATHS = 12_000;

function simulateStrategy(
  f: number,
  u: number,
  d: number,
  years: number,
  buyIn: number
): { medianFinalBalance: number; probLoss: number } {
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
  const mid = N_PATHS >> 1;
  const medianFinalBalance =
    N_PATHS % 2 === 0 ? (finals[mid - 1] + finals[mid]) / 2 : finals[mid];
  return { medianFinalBalance, probLoss: losses / N_PATHS };
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
  const candidates: number[] = game.candidateFractions;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return NextResponse.json({ error: "candidateFractions must be a non-empty array" }, { status: 400 });
  }

  let recommendedFraction = candidates[0];
  let best = simulateStrategy(recommendedFraction, u, d, years, buyIn);
  for (let i = 1; i < candidates.length; i++) {
    const stats = simulateStrategy(candidates[i], u, d, years, buyIn);
    if (stats.medianFinalBalance > best.medianFinalBalance) {
      recommendedFraction = candidates[i];
      best = stats;
    }
  }

  const answer = {
    recommendedFraction,
    medianFinalBalance: best.medianFinalBalance,
    probLoss: best.probLoss,
    reasoning:
      "This stake grows the typical (median) path the most: each year only the staked slice is flipped by the coin, and a smaller fraction dies less often than betting everything.",
  };

  await saveLatestGame(game, answer);
  return NextResponse.json(answer);
}
