import { getGrantReport } from "@/lib/program-intelligence";
import CopyButton from "../components/CopyButton";
import ExportPdfButton from "../components/ExportPdfButton";

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

function typeBadge(type: string) {
  if (type === "image") return "bg-[#dbeafe] text-[#1e40af]";
  if (type === "news_clipping") return "bg-[#f3e8ff] text-[#6b21a8]";
  return "bg-[#dcfce7] text-[#166634]";
}

function prettyType(type: string) {
  return type
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function ReportingPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const grantId = clean(sp.grantId);
  const month = clean(sp.month);

  const { options, report } = getGrantReport(grantId, month);
  const selectedGrantId = grantId ?? options.grants[0]?.grantId ?? "";
  const selectedMonth = month ?? options.months.at(-1) ?? "";

  // Copy-ready grant report section, assembled from the same computed facts.
  const copyText = report
    ? [
        `GRANT REPORT — ${report.performance.grantName} — ${report.performance.reportingMonth}`,
        `Donor: ${report.performance.donor}`,
        `Districts: ${report.performance.coveredDistricts}`,
        `Risk status: ${report.performance.riskStatus}`,
        "",
        `PERFORMANCE`,
        `- PBL completion: ${report.performance.pblCompletionRate}% of sampled schools`,
        `- Evidence submission: ${report.performance.evidenceSubmissionRate}% of participating schools`,
        `- Attendance: ${report.performance.attendanceRate}%`,
        "",
        `FINANCE`,
        `- Budget utilization: ${report.financeSummary.utilizationRate}% (${report.financeSummary.cumulativeUtilized.toLocaleString()} / ${report.financeSummary.approvedBudget.toLocaleString()} units)`,
        ...report.finance.map(
          (f) => `- ${f.budgetLine}: ${f.cumulativeUtilizedUnits.toLocaleString()} / ${f.approvedBudgetUnits.toLocaleString()} (${Math.round(f.cumulativeUtilizationRate * 100)}%)`,
        ),
        "",
        `MILESTONE SUMMARY`,
        report.performance.milestoneSummary,
        `Period end: ${report.performance.periodEndDate} · Report due: ${report.performance.reportDueDate}`,
        "",
        `NARRATIVE`,
        report.narrative,
        "",
        `SOURCE FACTS`,
        ...report.sourceFacts.map((f) => `- ${f}`),
        "",
        `LINKED EVIDENCE`,
        ...(report.evidence.length
          ? report.evidence.map((ev) => `- ${ev.title} (${prettyType(ev.recordType)}, ${ev.district})`)
          : ["- None for selected grant and month"]),
      ].join("\n")
    : "";

  return (
    <main className="p-xl max-w-[1600px] w-full mx-auto">
      <div className="flex justify-between items-start mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Grant Reporting</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Comprehensive overview and narrative generation for active grants.
          </p>
        </div>
        <div className="flex gap-sm">
          {report && (
            <>
              <CopyButton text={copyText} label="Copy report" />
              <ExportPdfButton
                title={`Grant Report — ${report.performance.grantName}`}
                subtitle={`${report.performance.reportingMonth} · ${report.performance.donor}`}
                body={copyText}
                fileName={`grant-report-${report.performance.grantId}-${report.performance.reportingMonth}.pdf`.replace(/\s+/g, "-")}
                label="Download PDF"
              />
            </>
          )}
        </div>
      </div>

      {/* Grant + Month Selector */}
      <form method="GET" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md items-end shadow-sm">
        <div className="flex flex-col gap-xs flex-1 min-w-[200px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Select Grant</label>
          <select name="grantId" defaultValue={selectedGrantId}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="">All Grants</option>
            {options.grants.map(g => <option key={g.grantId} value={g.grantId}>{g.grantName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[180px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Select Month</label>
          <select name="month" defaultValue={selectedMonth}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="">All Months</option>
            {options.months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button type="submit" className="h-10 px-md bg-primary-container text-on-primary-container rounded font-label-md hover:bg-primary hover:text-white transition-colors">
          Apply
        </button>
      </form>

      {!report ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest border border-tertiary-fixed rounded-xl">
          <span className="material-symbols-outlined text-[48px] text-outline mb-md">description</span>
          <h3 className="font-headline-md text-headline-md text-on-surface">Select a grant and month</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Choose a grant and reporting month above to view the report.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-lg">
          {/* Grant Overview Card */}
          <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-lg shadow-sm">
            <div className="flex items-center gap-lg">
              <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-on-primary-container">handshake</span>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Primary Partner</div>
                <div className="font-headline-lg text-headline-lg text-on-surface">{report.performance.grantName}</div>
                <div className="flex items-center gap-sm mt-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm ${riskBadge(report.performance.riskStatus)}`}>
                    ● {report.performance.riskStatus}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {report.performance.reportingMonth} • {report.performance.donor}
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Budget Utilization</div>
              <div className="font-headline-lg text-headline-lg text-primary">{report.financeSummary.utilizationRate}%</div>
              <div className="w-48 h-2 bg-surface-container rounded-full overflow-hidden mt-sm">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(report.financeSummary.utilizationRate, 100)}%` }} />
              </div>
              <div className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
                {report.financeSummary.cumulativeUtilized.toLocaleString()} / {report.financeSummary.approvedBudget.toLocaleString()} units
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {[
              { label: "PBL Completion", value: `${report.performance.pblCompletionRate}%`, sub: "of sampled schools", icon: "task_alt" },
              { label: "Evidence Submission", value: `${report.performance.evidenceSubmissionRate}%`, sub: "of participating schools", icon: "fact_check" },
              { label: "Attendance Rate", value: `${report.performance.attendanceRate}%`, sub: "across all sessions", icon: "groups" },
            ].map(card => (
              <div key={card.label} className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{card.label}</span>
                  <span className="material-symbols-outlined text-outline">{card.icon}</span>
                </div>
                <div className="mt-lg">
                  <div className="font-headline-lg text-headline-lg text-on-surface">{card.value}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant mt-xs">{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Finance + Milestones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Budget Lines</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-label-sm font-label-sm text-on-surface-variant border-b border-tertiary-fixed">
                    <th className="pb-sm font-medium">Budget Line</th>
                    <th className="pb-sm font-medium">Approved</th>
                    <th className="pb-sm font-medium">Utilized</th>
                    <th className="pb-sm font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {report.finance.map((f, i) => (
                    <tr key={i} className="border-b border-tertiary-fixed text-body-md font-body-md">
                      <td className="py-sm text-on-surface">{f.budgetLine}</td>
                      <td className="py-sm text-on-surface-variant">{f.approvedBudgetUnits.toLocaleString()}</td>
                      <td className="py-sm text-on-surface-variant">{f.cumulativeUtilizedUnits.toLocaleString()}</td>
                      <td className="py-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm ${f.cumulativeUtilizationRate >= 0.75 ? "bg-[#dcfce7] text-[#166634]" : "bg-[#fef9c3] text-[#854d0e]"}`}>
                          {Math.round(f.cumulativeUtilizationRate * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Milestone Summary</h3>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">{report.performance.milestoneSummary}</p>
              <div className="mt-md pt-md border-t border-tertiary-fixed grid grid-cols-2 gap-sm">
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Period End</div>
                  <div className="font-body-md text-body-md text-on-surface mt-xs">{report.performance.periodEndDate}</div>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Report Due</div>
                  <div className="font-body-md text-body-md text-on-surface mt-xs">{report.performance.reportDueDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grant Narrative */}
          <div className="bg-surface-container-lowest border-2 border-primary-container rounded-xl p-lg shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Grant Summary</h3>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded">Drafted Today</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Grant Narrative</div>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">{report.narrative}</p>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Source Facts</div>
                <div className="flex flex-col gap-xs">
                  {report.sourceFacts.map((fact, i) => (
                    <div key={i} className="flex items-start gap-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant mt-1.5 shrink-0" />
                      <span className="font-label-sm text-label-sm text-on-surface-variant italic">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Evidence */}
          {report.evidence.length > 0 && (
            <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-xl p-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Linked Evidence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {report.evidence.map((ev) => (
                  <div key={ev.recordId} className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-surface-container relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ev.publicPath} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-sm">
                      <div className="font-label-md text-label-md text-on-surface font-semibold">{ev.title}</div>
                      <div className="flex items-center gap-xs mt-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-sm">{ev.district}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm ${typeBadge(ev.recordType)}`}>{prettyType(ev.recordType)}</span>
                      </div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs line-clamp-2">{ev.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
