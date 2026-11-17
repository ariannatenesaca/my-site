import { ComingSoon } from "@/components/ComingSoon";
import { loadLatest } from "@/lib/causality-store";

export const metadata = { title: "Causality Audit" };

export const dynamic = "force-dynamic";

export default async function CausalityPage() {
  const latest = await loadLatest();

  if (!latest) {
    return (
      <ComingSoon
        lane={4}
        title="Causality Audit"
        description="A service that tells forks from pipes from colliders, and knows when to stratify. Built after Lane 4."
      />
    );
  }

  const { problem, answer } = latest;
  const verdict = answer.causal ? "causal" : "not causal";

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        Lane 4 · live decision service
      </p>
      <h1 className="mt-3 text-4xl font-bold">My Causality Audit Service</h1>
      <p className="mt-4 max-w-prose text-muted">
        This service reads a business story and a dataset, names the structure (fork, pipe,
        collider, or direct), and says whether to stratify.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">The latest case</h2>
        <p className="mt-3 max-w-prose text-muted">{String(problem.context?.narrative ?? "")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">The audit</h2>
        <ul className="mt-3 space-y-1 text-lg">
          <li>
            Structure:{" "}
            <strong data-causality="structure" className="text-accent">
              {String(answer.structure)}
            </strong>
          </li>
          <li>
            Verdict:{" "}
            <strong data-causality="verdict" className="text-accent">
              {verdict}
            </strong>
          </li>
          <li>
            Stratified effect:{" "}
            <strong data-causality="stratified-effect" className="text-accent">
              {Number(answer.stratifiedEffect).toFixed(3)}
            </strong>
          </li>
        </ul>
        {typeof answer.reasoning === "string" && (
          <p className="mt-3 max-w-prose text-muted">{answer.reasoning}</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">The four candidate DAGs</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-causality="dag"
          src="/images/causality-dags.png"
          alt="Four candidate DAGs: fork, pipe, collider, and direct effect."
          className="mt-3 w-full max-w-2xl rounded-lg border border-line bg-white p-3"
        />
      </section>
    </main>
  );
}
