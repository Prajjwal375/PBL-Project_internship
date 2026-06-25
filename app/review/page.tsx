import { getProgramReview, getFilterOptions, type ProgramFilters } from "@/lib/program-intelligence";
import CopyButton from "../components/CopyButton";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function clean(v: string | string[] | undefined) {
  const val = Array.isArray(v) ? v[0] : v;
  return val && val !== "all" ? val : undefined;
}

function riskBadge(status: string) {
  if (status === "On Track") return "bg-[#dcfce7] text-[#166634]";
  if (status === "Behind") return "bg-[#fef9c3] text-[#854d0e]";
  if (status === "At Risk") return "bg-[#ffedd5] text-[#9a3412]";
  return "bg-error-container text-on-error-container";
}

function priorityBadge(priority: string) {
  if (priority === "High") return "bg-error-container text-on-error-container";
  if (priority === "Medium") return "bg-[#fef9c3] text-[#854d0e]";
  return "bg-surface-container text-on-surface-variant";
}

export default async function ReviewPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters: ProgramFilters = {
    month: clean(sp.month),
    district: clean(sp.district),
    block: clean(sp.block),
  };

  const options = getFilterOptions(filters);
  if (filters.block && !options.blocks.includes(filters.block)) {
    filters.block = undefined;
  }
  const activeMonth = filters.month ?? options.months.at(-1) ?? "";
  const activeFilters: ProgramFilters = { ...filters, month: activeMonth };

  const review = getProgramReview(activeFilters);
  const m = review.metrics;
  const scope = [activeFilters.district, activeFilters.block].filter(Boolean).join(" › ") || "All districts";

  // Priority geographies = lowest-performing on attendance (need follow-up first).
  const priorityDistricts = review.districts.bottom;
  const priorityBlocks = review.blocks.bottom;

  // Plain-text, copy-ready version of the same deterministic summary.
  const copyText = [
    `PBL PROGRAM REVIEW — ${activeMonth}`,
    `Scope: ${scope}`,
    "",
    `KEY METRICS`,
    `- Total schools: ${m.totalSchools}`,
    `- Participating: ${m.participatingSchools} (${m.participationRate}%)`,
    `- Evidence submission: ${m.evidenceRate}%`,
    `- Attendance: ${m.attendanceRate}% (${m.riskStatus})`,
    "",
    `ACHIEVEMENTS`,
    ...review.summary.achievements.map((a) => `- ${a}`),
    "",
    `MONTH-OVER-MONTH`,
    ...review.movement.map((mv) => `- ${mv.metric}: ${mv.current}% (prev ${mv.previous}%, ${mv.delta >= 0 ? "+" : ""}${mv.delta}%)`),
    "",
    `RISKS`,
    ...review.summary.risks.map((r) => `- ${r}`),
    "",
    `PRIORITY GEOGRAPHIES (follow-up first)`,
    ...priorityDistricts.map((d) => `- District: ${d.name} — ${d.attendanceRate}% (${d.riskStatus})`),
    ...priorityBlocks.map((b) => `- Block: ${b.name} — ${b.attendanceRate}% (${b.riskStatus})`),
    "",
    `DISCUSSION POINTS`,
    ...review.summary.discussionPoints.map((d) => `- ${d}`),
    "",
    `RECOMMENDED ACTIONS`,
    ...review.recommendedActions.map(
      (a) => `- [${a.priority}] ${a.linkedMetric} — ${a.owner}, due ${a.dueDate}, ${a.status}`,
    ),
  ].join("\n");

  return (
    <main className="p-xl max-w-[1600px] w-full mx-auto">
      <div className="flex justify-between items-start mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Monthly Review Summary</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Deterministic, review-ready summary for {activeMonth} · {scope}.
          </p>
        </div>
        <CopyButton text={copyText} label="Copy summary" />
      </div>

      {/* Filters */}
      <form method="GET" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md items-end shadow-sm">
        <div className="flex flex-col gap-xs flex-1 min-w-[160px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Month</label>
          <select name="month" defaultValue={activeFilters.month}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            {options.months.map(mo => <option key={mo} value={mo}>{mo}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[160px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">District</label>
          <select name="district" defaultValue={filters.district ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Districts</option>
            {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[160px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Block</label>
          <select name="block" defaultValue={filters.block ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Blocks</option>
            {options.blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-sm">
          <button type="submit" className="h-10 px-md bg-primary-container text-on-primary-container rounded font-label-md hover:bg-primary hover:text-white transition-colors">
            Apply
          </button>
          <a href="/review" className="h-10 px-md flex items-center rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-md border border-outline-variant transition-colors">
            Reset
          </a>
        </div>
      </form>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
        {[
          { label: "Participation", value: `${m.participationRate}%`, sub: `${m.participatingSchools}/${m.totalSchools} schools` },
          { label: "Evidence", value: `${m.evidenceRate}%`, sub: "of participating" },
          { label: "Attendance", value: `${m.attendanceRate}%`, sub: m.riskStatus },
          { label: "Total Enrollment", value: m.totalEnrollment.toLocaleString(), sub: "students" },
        ].map(card => (
          <div key={card.label} className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{card.label}</div>
            <div className="font-headline-lg text-headline-lg text-on-surface mt-xs">{card.value}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mt-xs">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-lg">
        {/* Achievements */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-[#16a34a]">check_circle</span> Achievements
          </h3>
          <ul className="flex flex-col gap-sm">
            {review.summary.achievements.map((a, i) => (
              <li key={i} className="flex gap-sm font-body-md text-body-md text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-2 shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Month-over-Month */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">trending_up</span> Month-over-Month
          </h3>
          {review.movement.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {review.movement.map(mv => (
                <div key={mv.metric} className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-tertiary-fixed">
                  <span className="font-body-md text-body-md text-on-surface">{mv.metric}</span>
                  <div className="flex items-center gap-md">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{mv.previous}% → {mv.current}%</span>
                    <span className={`font-label-md text-label-md flex items-center gap-xs ${mv.delta >= 0 ? "text-[#166634]" : "text-error"}`}>
                      <span className="material-symbols-outlined text-[16px]">{mv.delta >= 0 ? "arrow_upward" : "arrow_downward"}</span>
                      {mv.delta > 0 ? "+" : ""}{mv.delta}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant">No prior month available for comparison.</p>
          )}
        </div>

        {/* Risks */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-error">warning</span> Risks
          </h3>
          <ul className="flex flex-col gap-sm">
            {review.summary.risks.map((r, i) => (
              <li key={i} className="flex gap-sm font-body-md text-body-md text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-error mt-2 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Geographies */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">priority_high</span> Priority Geographies
          </h3>
          <div className="flex flex-col gap-sm">
            {priorityDistricts.map(d => (
              <div key={`d-${d.name}`} className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-tertiary-fixed">
                <span className="font-body-md text-body-md text-on-surface">District · {d.name}</span>
                <div className="flex items-center gap-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{d.attendanceRate}%</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm ${riskBadge(d.riskStatus)}`}>{d.riskStatus}</span>
                </div>
              </div>
            ))}
            {priorityBlocks.map(b => (
              <div key={`b-${b.name}`} className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-tertiary-fixed">
                <span className="font-body-md text-body-md text-on-surface">Block · {b.name}</span>
                <div className="flex items-center gap-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{b.attendanceRate}%</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm ${riskBadge(b.riskStatus)}`}>{b.riskStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discussion Points */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">forum</span> Discussion Points
          </h3>
          <ul className="flex flex-col gap-sm">
            {review.summary.discussionPoints.map((d, i) => (
              <li key={i} className="flex gap-sm font-body-md text-body-md text-on-surface">
                <span className="font-label-md text-label-md text-on-surface-variant shrink-0">{i + 1}.</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">task</span> Recommended Actions
          </h3>
          <div className="flex flex-col gap-sm">
            {review.recommendedActions.map((a, i) => (
              <div key={i} className="p-sm bg-surface-container-low rounded-lg border border-tertiary-fixed">
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface">{a.linkedMetric}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm ${priorityBadge(a.priority)}`}>{a.priority}</span>
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
                  {a.owner} · due {a.dueDate} · {a.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
