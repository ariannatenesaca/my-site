import { ComingSoon } from "@/components/ComingSoon";
import { loadLatestGame } from "@/lib/simulator-store";

export const metadata = { title: "Decision Simulator" };

export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const latest = await loadLatestGame();

  if (!latest) {
    return (
      <ComingSoon
        lane={3}
        title="Decision Simulator"
        description="A service that simulates investment games and recommends the growth-optimal stake. Built after Lane 3."
      />
    );
  }

  const { problem, answer } = latest;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        Lane 3 · live decision service
      </p>
      <h1 className="mt-3 text-4xl font-bold">My Decision Simulator</h1>
      <p className="mt-4 max-w-prose text-muted">
        This service simulates many coin-flip investment paths and picks the stake
        fraction that grows the typical (median) ending balance the most.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">How the game is generated</h2>
        <p className="mt-3 max-w-prose text-muted">{String(problem.scenario ?? "")}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-simulator="dag"
          src="/simulator-dag.png"
          alt="Probabilistic graphical model of the investment game: stake fraction and each year's coin flip determine next wealth."
          className="mt-6 w-full max-w-lg rounded-xl border border-line bg-surface p-4"
        />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Latest recommendation</h2>
        <p className="mt-3 text-lg">
          Stake fraction:{" "}
          <strong data-simulator="recommended-fraction" className="text-accent">
            {String(answer.recommendedFraction)}
          </strong>
        </p>
        <p className="mt-2 text-lg">
          Median final balance:{" "}
          <strong data-simulator="median-final" className="text-accent">
            {String(answer.medianFinalBalance)}
          </strong>
        </p>
        <p className="mt-2 text-lg">
          Probability of ending below buy-in:{" "}
          <strong data-simulator="prob-loss" className="text-accent">
            {String(answer.probLoss)}
          </strong>
        </p>
        {typeof answer.reasoning === "string" && (
          <p className="mt-4 max-w-prose text-sm text-muted">{answer.reasoning}</p>
        )}
      </section>
    </main>
  );
}
