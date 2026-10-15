import { createClient } from "@supabase/supabase-js";

/** What the simulation found for one candidate stake fraction. */
export interface CandidateSummary {
  fraction: number;
  p5: number;
  p25: number;
  median: number;
  p75: number;
  p95: number;
  probLoss: number;
}

export interface SimulatorLatest {
  problem: Record<string, any>;
  answer: Record<string, any>;
  candidates: CandidateSummary[];
}

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function saveLatest(
  problem: SimulatorLatest["problem"],
  answer: SimulatorLatest["answer"],
  candidates: CandidateSummary[]
): Promise<void> {
  const client = supabase();
  if (!client) {
    throw new Error("Supabase env vars not set. See .env.example and the README.");
  }

  const { error } = await client.from("simulator_latest").upsert({
    key: "latest",
    problem,
    answer,
    candidates,
    updated_at: new Date().toISOString(),
  });
  if (!error) return;

  const fallback = await client.from("reasoning_latest").upsert({
    type: "simulator",
    problem,
    answer: { ...answer, candidates },
    updated_at: new Date().toISOString(),
  });
  if (fallback.error) {
    throw new Error(`Could not save the latest game: ${error.message}`);
  }
}

export async function loadLatest(): Promise<SimulatorLatest | null> {
  const client = supabase();
  if (!client) return null;

  const primary = await client
    .from("simulator_latest")
    .select("problem, answer, candidates")
    .eq("key", "latest")
    .maybeSingle();
  if (!primary.error && primary.data) return primary.data as SimulatorLatest;

  const fallback = await client
    .from("reasoning_latest")
    .select("problem, answer")
    .eq("type", "simulator")
    .maybeSingle();
  if (fallback.error || !fallback.data) return null;
  const answer = fallback.data.answer ?? {};
  const candidates = Array.isArray(answer.candidates) ? answer.candidates : [];
  return { problem: fallback.data.problem, answer, candidates };
}

export const saveLatestGame = saveLatest;
export const loadLatestGame = loadLatest;
