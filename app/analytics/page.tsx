import { getProgramReview, getFilterOptions, getSchoolRecordsForMonth, type ProgramFilters } from "@/lib/program-intelligence";

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

function barColor(status: string) {
  if (status === "On Track") return "bg-[#16a34a]";
  if (status === "Behind") return "bg-[#f59e0b]";
  if (status === "At Risk") return "bg-[#f97316]";
  return "bg-error";
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters: ProgramFilters = {
    month: clean(sp.month),
    district: clean(sp.district),
    block: clean(sp.block),
    grade: clean(sp.grade),
    subject: clean(sp.subject),
  };

  const options = getFilterOptions(filters);
  // Drop a stale block selection that doesn't belong to the chosen district,
  // so changing district never leaves the dashboard filtered to an empty set.
  if (filters.block && !options.blocks.includes(filters.block)) {
    filters.block = undefined;
  }
  const activeMonth = filters.month ?? options.months.at(-1) ?? "";
  const activeFilters: ProgramFilters = { ...filters, month: activeMonth };

  const review = getProgramReview(activeFilters);
  const schoolRows = getSchoolRecordsForMonth(activeFilters);
  const m = review.metrics;

  return (
    <main className="p-margin-desktop min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">School Analytics</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Monitor implementation fidelity and outcome metrics across all registered sites.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <form method="GET" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md items-end shadow-sm">
        <div className="flex flex-col gap-xs flex-1 min-w-[140px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">District</label>
          <select name="district" defaultValue={filters.district ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Districts</option>
            {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[140px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Block</label>
          <select name="block" defaultValue={filters.block ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Blocks</option>
            {options.blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[140px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Month</label>
          <select name="month" defaultValue={activeFilters.month}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            {options.months.map(mo => <option key={mo} value={mo}>{mo}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[140px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Grade</label>
          <select name="grade" defaultValue={filters.grade ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Grades</option>
            {options.grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[140px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Subject</label>
          <select name="subject" defaultValue={filters.subject ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Subjects</option>
            {options.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-sm">
          <button type="submit" className="h-10 px-md bg-primary-container text-on-primary-container rounded font-label-md hover:bg-primary hover:text-white transition-colors">
            Apply
          </button>
          <a href="/analytics" className="h-10 px-md flex items-center rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-md border border-outline-variant transition-colors">
            Reset
          </a>
        </div>
      </form>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-md mb-lg">
        {[
          { label: "Total Schools", value: m.totalSchools.toLocaleString(), icon: "school" },
          { label: "Participating", value: m.participatingSchools.toLocaleString(), icon: "groups" },
          { label: "Participation %", value: `${m.participationRate}%`, icon: "task_alt" },
          { label: "Evidence %", value: `${m.evidenceRate}%`, icon: "fact_check" },
          { label: "Total Enrollment", value: m.totalEnrollment.toLocaleString(), icon: "diversity_3" },
          { label: "Total Attendance", value: m.totalAttendance.toLocaleString(), icon: "how_to_reg" },
          { label: "Attendance %", value: `${m.attendanceRate}%`, icon: "show_chart" },
        ].map(card => (
          <div key={card.label} className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{card.label}</span>
              <span className="material-symbols-outlined text-outline">{card.icon}</span>
            </div>
            <div className="font-headline-lg text-headline-lg text-on-surface mt-lg">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Month-over-Month Movement */}
      {review.movement.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Month-over-Month Movement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {review.movement.map(mv => (
              <div key={mv.metric} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-tertiary-fixed">
                <div>
                  <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{mv.metric}</div>
                  <div className="font-headline-md text-headline-md text-on-surface mt-xs">{mv.current}%</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">prev: {mv.previous}%</div>
                </div>
                <div className={`flex items-center gap-xs font-headline-md text-headline-md ${mv.delta >= 0 ? "text-[#166634]" : "text-error"}`}>
                  <span className="material-symbols-outlined">{mv.delta >= 0 ? "trending_up" : "trending_down"}</span>
                  {mv.delta > 0 ? "+" : ""}{mv.delta}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* District & Block Performance Charts */}
      <div className="grid grid-cols-12 gap-lg mb-lg">
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">District Performance</h3>
          <div className="mb-md">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">High Performing</div>
            <div className="flex flex-col gap-sm">
              {review.districts.top.map(d => (
                <div key={d.name} className="flex items-center gap-sm">
                  <span className="w-24 text-label-sm font-label-sm text-on-surface-variant truncate">{d.name}</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${barColor(d.riskStatus)} rounded-full`} style={{ width: `${Math.min(d.attendanceRate, 100)}%` }} />
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface w-10 text-right">{d.attendanceRate}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Needs Follow-up</div>
            <div className="flex flex-col gap-sm">
              {review.districts.bottom.map(d => (
                <div key={d.name} className="flex items-center gap-sm">
                  <span className="w-24 text-label-sm font-label-sm text-on-surface-variant truncate">{d.name}</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${barColor(d.riskStatus)} rounded-full`} style={{ width: `${Math.min(d.attendanceRate, 100)}%` }} />
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface w-10 text-right">{d.attendanceRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Block Performance</h3>
          <div className="mb-md">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">High Performing</div>
            <div className="flex flex-col gap-sm">
              {review.blocks.top.map(b => (
                <div key={b.name} className="flex items-center gap-sm">
                  <span className="w-24 text-label-sm font-label-sm text-on-surface-variant truncate">{b.name}</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${barColor(b.riskStatus)} rounded-full`} style={{ width: `${Math.min(b.attendanceRate, 100)}%` }} />
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface w-10 text-right">{b.attendanceRate}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Needs Follow-up</div>
            <div className="flex flex-col gap-sm">
              {review.blocks.bottom.map(b => (
                <div key={b.name} className="flex items-center gap-sm">
                  <span className="w-24 text-label-sm font-label-sm text-on-surface-variant truncate">{b.name}</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${barColor(b.riskStatus)} rounded-full`} style={{ width: `${Math.min(b.attendanceRate, 100)}%` }} />
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface w-10 text-right">{b.attendanceRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* School Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline-md text-headline-md text-on-surface">Detailed School Records</h3>
          <span className="text-label-sm font-label-sm text-on-surface-variant">Showing {Math.min(schoolRows.length, 50)} of {schoolRows.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                <th className="p-md font-semibold">School Name</th>
                <th className="p-md font-semibold">District</th>
                <th className="p-md font-semibold">Block</th>
                <th className="p-md font-semibold">Attendance %</th>
                <th className="p-md font-semibold">PBL Conducted</th>
                <th className="p-md font-semibold">Evidence</th>
                <th className="p-md font-semibold">Risk Status</th>
              </tr>
            </thead>
            <tbody className="text-body-md font-body-md text-on-surface divide-y divide-outline-variant">
              {schoolRows.slice(0, 50).map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-md font-medium">{row.school}</td>
                  <td className="p-md text-on-surface-variant">{row.district}</td>
                  <td className="p-md text-on-surface-variant">{row.block}</td>
                  <td className="p-md">
                    <div className="flex items-center gap-sm">
                      <span>{row.attendanceRate}%</span>
                      <div className="w-16 h-1.5 bg-surface-container rounded-full">
                        <div className={`h-full ${barColor(row.riskStatus)} rounded-full`} style={{ width: `${Math.min(row.attendanceRate, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-md">
                    {row.conducted
                      ? <span className="text-[#16a34a]"><span className="material-symbols-outlined text-sm">check_circle</span></span>
                      : <span className="text-on-surface-variant"><span className="material-symbols-outlined text-sm">remove</span></span>}
                  </td>
                  <td className="p-md">
                    {row.evidenceSubmitted
                      ? <span className="text-[#16a34a]"><span className="material-symbols-outlined text-sm">check_circle</span></span>
                      : <span className="text-on-surface-variant"><span className="material-symbols-outlined text-sm">remove</span></span>}
                  </td>
                  <td className="p-md">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm ${riskBadge(row.riskStatus)}`}>
                      {row.riskStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-sm border-t border-outline-variant bg-surface-bright flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant">
          <span>Showing {Math.min(schoolRows.length, 50)} of {schoolRows.length} records</span>
          <span>Filter by month/district to narrow results</span>
        </div>
      </div>
    </main>
  );
}
