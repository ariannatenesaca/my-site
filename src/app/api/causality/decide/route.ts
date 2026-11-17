import { NextResponse } from "next/server";
import { saveLatest } from "@/lib/causality-store";

type Structure = "fork" | "pipe" | "collider" | "direct";

const VISIBLE = 0.35;

function mean(ys: number[]): number {
  return ys.reduce((a, b) => a + b, 0) / ys.length;
}

function naiveEffect(rows: { x: number; y: number }[]): number {
  const treated = rows.filter((r) => r.x === 1).map((r) => r.y);
  const control = rows.filter((r) => r.x === 0).map((r) => r.y);
  if (!treated.length || !control.length) return 0;
  return mean(treated) - mean(control);
}

function stratifiedEffect(rows: { x: number; z: number; y: number }[]): number {
  let weighted = 0;
  for (const z of [0, 1]) {
    const slice = rows.filter((r) => r.z === z);
    if (slice.length === 0) continue;
    weighted += naiveEffect(slice) * slice.length;
  }
  return weighted / rows.length;
}

function classifyStructure(
  facts: { zTiming?: string; zInfluencesX?: boolean },
  naive: number,
  strat: number
): Structure {
  const a = Math.abs(naive);
  const s = Math.abs(strat);
  const naiveOn = a >= VISIBLE;
  const stratOn = s >= VISIBLE;

  if (facts.zTiming === "before-x" && facts.zInfluencesX) return "fork";
  if (facts.zTiming === "after-x" && naiveOn && !stratOn) return "pipe";
  if (!naiveOn && stratOn) return "collider";
  if (facts.zTiming === "before-x" && facts.zInfluencesX === false) return "direct";
  if (naiveOn && stratOn && Math.abs(naive - strat) <= 0.2) return "direct";
  if (naiveOn && !stratOn) return "pipe";
  return "direct";
}

export async function POST(req: Request) {
  const probe = await req.json().catch(() => null);
  if (!probe || probe.type !== "causality-audit" || !Array.isArray(probe.dataset)) {
    return NextResponse.json(
      { error: "expected a JSON causality-audit with a dataset" },
      { status: 400 }
    );
  }

  const rows = probe.dataset as { x: number; z: number; y: number }[];
  const naive = naiveEffect(rows);
  const strat = stratifiedEffect(rows);
  const facts = probe.context?.domainFacts ?? {};
  const structure = classifyStructure(facts, naive, strat);
  const causal =
    structure === "pipe" || structure === "direct"
      ? true
      : structure === "fork"
        ? Math.abs(strat) >= VISIBLE
        : false;
  const advice = structure === "fork" ? "stratify" : "do-not-stratify";

  const answer = {
    structure,
    causal,
    advice,
    stratifiedEffect: strat,
    reasoning:
      structure === "fork"
        ? "Z comes before X and influences who gets X, so stratify on Z to read the within-group effect."
        : structure === "pipe"
          ? "Z sits on the path from X to Y, so stratifying would block the very effect we care about."
          : structure === "collider"
            ? "Z is a common effect of X and Y; stratifying on it would invent a fake association."
            : "Z is not on the causal path from X to Y, so the naive contrast already is the effect.",
  };

  await saveLatest(probe, answer);
  return NextResponse.json(answer);
}
