import type { PatternDistribution } from "@/types/patterns";

/** Accessible list/table alternative for any distribution chart. */
export function DistributionTable({
  distribution,
}: {
  distribution: PatternDistribution;
}) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{distribution.title}</caption>
      <thead>
        <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
          <th scope="col" className="py-2 pr-4 font-medium">
            Category
          </th>
          <th scope="col" className="py-2 font-medium">
            Reported (range)
          </th>
        </tr>
      </thead>
      <tbody>
        {distribution.cells.map((cell) => (
          <tr key={cell.category} className="border-b border-line/70">
            <th
              scope="row"
              className="py-2.5 pr-4 text-left font-medium text-ink"
            >
              {cell.label}
            </th>
            <td className="py-2.5 text-ink-soft">
              {cell.display ? (
                <span className="tabular-nums">{cell.countBand}</span>
              ) : (
                <span className="text-ink-faint">
                  Hidden to protect privacy
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
