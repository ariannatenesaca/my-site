/**
 * Station 2.4: four views of the same Bernoulli business (support, masses,
 * payoffs, and the expected payoff as a weighted average).
 */
export function BernoulliFourViews({
  theta,
  onSuccess,
  onFailure,
}: {
  theta: number;
  onSuccess: number;
  onFailure: number;
}) {
  const pFail = 1 - theta;
  const expected = theta * onSuccess + pFail * onFailure;
  const money = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  const views = [
    {
      title: "Support",
      body: "X takes only two values: 0 (the event fails) and 1 (it succeeds).",
    },
    {
      title: "Probabilities",
      body: `P(X = 1) = ${theta.toFixed(2)} and P(X = 0) = ${pFail.toFixed(2)}.`,
    },
    {
      title: "Payoffs",
      body: `Success pays ${money(onSuccess)}; failure pays ${money(onFailure)}.`,
    },
    {
      title: "Expected payoff",
      body: `${theta.toFixed(2)} × ${money(onSuccess)} + ${pFail.toFixed(2)} × ${money(onFailure)} = ${money(expected)}. That is a long-run average, not a promise for the next trial.`,
    },
  ];

  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {views.map((v) => (
        <li key={v.title} className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">{v.title}</p>
          <p className="mt-2 text-sm">{v.body}</p>
        </li>
      ))}
    </ul>
  );
}
