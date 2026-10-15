import { createClient } from "@supabase/supabase-js";

export interface LatestGame {
  problem: Record<string, any>;
  answer: Record<string, any>;
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

export async function saveLatestGame(
  problem: LatestGame["problem"],
  answer: LatestGame["answer"]
): Promise<void> {
  const client = supabase();
  if (!client) {
    throw new Error("Supabase env vars not set. See .env.example and the README.");
  }
  const { error } = await client.from("reasoning_latest").upsert({
    type: "simulator",
    problem,
    answer,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    throw new Error(`Could not save the latest game: ${error.message}`);
  }
}

export async function loadLatestGame(): Promise<LatestGame | null> {
  const client = supabase();
  if (!client) return null;
  const { data, error } = await client
    .from("reasoning_latest")
    .select("problem, answer")
    .eq("type", "simulator")
    .maybeSingle();
  if (error || !data) return null;
  return { problem: data.problem, answer: data.answer };
}
