/**
 * Station 2.3-style two-way table. Imagines N = 10,000 cases so the cells
 * are counts, then the posterior is trueFlags / (trueFlags + falseFlags).
 */
export function TwoWayTable({
  baseRate,
  hitRate,
  falseAlarmRate,
}: {
  baseRate: number;
  hitRate: number;
  falseAlarmRate: number;
}) {
  const N = 10000;
  const have = N * baseRate;
  const clean = N - have;
  const trueFlags = have * hitRate;
  const missed = have * (1 - hitRate);
  const falseFlags = clean * falseAlarmRate;
  const trueNegatives = clean * (1 - falseAlarmRate);
  const flagged = trueFlags + falseFlags;

  const cell = (n: number) => Math.round(n).toLocaleString();

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full max-w-lg border-collapse text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="border border-line bg-surface px-3 py-2 font-semibold"> </th>
            <th className="border border-line bg-surface px-3 py-2 font-semibold">Flagged</th>
            <th className="border border-line bg-surface px-3 py-2 font-semibold">Not flagged</th>
            <th className="border border-line bg-surface px-3 py-2 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="border border-line bg-surface px-3 py-2 text-left font-semibold">
              Has the condition
            </th>
            <td className="border border-line px-3 py-2">{cell(trueFlags)}</td>
            <td className="border border-line px-3 py-2">{cell(missed)}</td>
            <td className="border border-line px-3 py-2">{cell(have)}</td>
          </tr>
          <tr>
            <th className="border border-line bg-surface px-3 py-2 text-left font-semibold">
              Does not
            </th>
            <td className="border border-line px-3 py-2">{cell(falseFlags)}</td>
            <td className="border border-line px-3 py-2">{cell(trueNegatives)}</td>
            <td className="border border-line px-3 py-2">{cell(clean)}</td>
          </tr>
          <tr>
            <th className="border border-line bg-surface px-3 py-2 text-left font-semibold">
              Total
            </th>
            <td className="border border-line px-3 py-2">{cell(flagged)}</td>
            <td className="border border-line px-3 py-2">{cell(missed + trueNegatives)}</td>
            <td className="border border-line px-3 py-2">{cell(N)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        Imagined N = {N.toLocaleString()} cases. Of the {cell(flagged)} flagged cases,{" "}
        {cell(trueFlags)} actually have the condition.
      </p>
    </div>
  );
}
