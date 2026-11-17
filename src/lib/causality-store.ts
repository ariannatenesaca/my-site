import { createClient } from "@supabase/supabase-js";

export interface CausalityLatest {
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

export async function saveLatest(problem: CausalityLatest["problem"], answer: CausalityLatest["answer"]): Promise<void> {
  const client = supabase();
  if (!client) {
    throw new Error("Supabase env vars not set. See .env.example and the README.");
  }

  const { error } = await client.from("causality_latest").upsert({
    key: "latest",
    problem,
    answer,
    updated_at: new Date().toISOString(),
  });
  if (!error) return;

  const fallback = await client.from("reasoning_latest").upsert({
    type: "causality",
    problem,
    answer,
    updated_at: new Date().toISOString(),
  });
  if (fallback.error) {
    throw new Error(`Could not save the latest audit: ${error.message}`);
  }
}

export async function loadLatest(): Promise<CausalityLatest | null> {
  const client = supabase();
  if (!client) return null;

  const primary = await client
    .from("causality_latest")
    .select("problem, answer")
    .eq("key", "latest")
    .maybeSingle();
  if (!primary.error && primary.data) return primary.data as CausalityLatest;

  const fallback = await client
    .from("reasoning_latest")
    .select("problem, answer")
    .eq("type", "causality")
    .maybeSingle();
  if (fallback.error || !fallback.data) return null;
  return { problem: fallback.data.problem, answer: fallback.data.answer };
}
