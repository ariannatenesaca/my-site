import type { CandidateSummary } from "@/lib/simulator-store";

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function CandidateOutcomes({
  candidates,
  buyIn,
  recommended,
}: {
  candidates: CandidateSummary[];
  buyIn: number;
  recommended: number;
}) {
  if (!candidates?.length) {
    return <p className="mt-3 text-muted">No simulated stakes yet.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="border border-line bg-surface px-3 py-2 font-semibold">Stake</th>
            <th className="border border-line bg-surface px-3 py-2 font-semibold">5th pct</th>
            <th className="border border-line bg-surface px-3 py-2 font-semibold">Median</th>
            <th className="border border-line bg-surface px-3 py-2 font-semibold">95th pct</th>
            <th className="border border-line bg-surface px-3 py-2 font-semibold">P(loss)</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => {
            const isBest = Math.abs(c.fraction - recommended) < 1e-9;
            return (
              <tr key={c.fraction} className={isBest ? "bg-surface" : undefined}>
                <td className="border border-line px-3 py-2 font-semibold">
                  {(c.fraction * 100).toFixed(0)}%{isBest ? " · recommended" : ""}
                </td>
                <td className="border border-line px-3 py-2">{money(c.p5)}</td>
                <td className="border border-line px-3 py-2">{money(c.median)}</td>
                <td className="border border-line px-3 py-2">{money(c.p95)}</td>
                <td className="border border-line px-3 py-2">{(c.probLoss * 100).toFixed(0)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        Starting buy-in {money(buyIn)}. Percentiles are across the simulated ending balances for
        that stake.
      </p>
    </div>
  );
}
