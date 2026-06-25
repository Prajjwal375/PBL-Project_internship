// import { getGrantReport } from "@/lib/program-intelligence";

// export default async function GrantReporting(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
//   const searchParams = await props.searchParams;
  
//   const grantId = searchParams.grantId;
//   const month = searchParams.month;

//   const { options, report } = getGrantReport(grantId, month);

//   const getRecordTypeBadgeClasses = (type: string) => {
//     switch (type) {
//       case "Image":
//         return "bg-blue-50 text-blue-700 border border-blue-200";
//       case "News Clip":
//         return "bg-purple-50 text-purple-700 border border-purple-200";
//       case "Recognition":
//         return "bg-emerald-50 text-emerald-700 border border-emerald-200";
//       default:
//         return "bg-surface-container text-on-surface-variant border border-outline-variant";
//     }
//   };

//   return (
//     <main className="p-lg bg-background min-h-screen">
//       <div className="mb-lg">
//         <h1 className="font-headline-lg text-headline-lg text-on-surface">Grant Reporting</h1>
//         <p className="font-body-md text-body-md text-on-surface-variant">
//           Review financial utilization and program performance for specific grants.
//         </p>
//       </div>

//       {/* GRANT SELECTOR BAR */}
//       <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md mb-[20px]">
//         <form method="GET" className="flex items-end gap-md">
//           <div className="flex flex-col gap-xs flex-1 max-w-[300px]">
//             <label className="font-label-sm text-on-surface-variant">Grant</label>
//             <select
//               name="grantId"
//               defaultValue={grantId || options.grants[0]?.grantId || ""}
//               className="bg-surface-container-low border border-outline-variant rounded p-sm font-body-md text-on-surface focus:outline-none focus:border-primary"
//             >
//               {options.grants.map((g) => (
//                 <option key={g.grantId} value={g.grantId}>
//                   {g.grantName}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col gap-xs flex-1 max-w-[200px]">
//             <label className="font-label-sm text-on-surface-variant">Month</label>
//             <select
//               name="month"
//               defaultValue={month || options.months.at(-1) || ""}
//               className="bg-surface-container-low border border-outline-variant rounded p-sm font-body-md text-on-surface focus:outline-none focus:border-primary"
//             >
//               {options.months.map((m) => (
//                 <option key={m} value={m}>{m}</option>
//               ))}
//             </select>
//           </div>

//           <button
//             type="submit"
//             className="h-[38px] px-md bg-primary hover:bg-blue-800 text-white rounded font-body-md transition-colors"
//           >
//             Apply
//           </button>
//         </form>
//       </div>

//       {!report ? (
//         <div className="flex flex-col items-center justify-center p-xl bg-surface-container-lowest border border-tertiary-fixed rounded-lg text-center mt-lg">
//           <span className="material-symbols-outlined text-[48px] text-outline mb-sm">summarize</span>
//           <h2 className="font-headline-md text-on-surface mb-xs">No Report Found</h2>
//           <p className="font-body-md text-on-surface-variant max-w-md">
//             Select a grant and month to view the report. Make sure the combination you selected has data available.
//           </p>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-[20px]">
//           {/* GRANT OVERVIEW CARD */}
//           <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-lg flex flex-wrap gap-lg justify-between items-center">
//             <div className="flex flex-col gap-sm max-w-2xl">
//               <div className="flex items-center gap-sm">
//                 <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
//                   {report.performance.grantName}
//                 </h2>
//                 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
//                   {report.performance.reportStatus}
//                 </span>
//               </div>
//               <div className="font-body-md text-on-surface-variant flex flex-wrap gap-x-lg gap-y-xs">
//                 <span><strong>Donor:</strong> {report.performance.donor}</span>
//                 <span><strong>Districts:</strong> {report.performance.coveredDistricts}</span>
//                 <span><strong>Period End:</strong> {report.performance.periodEndDate}</span>
//               </div>
//             </div>
            
//             <div className="flex flex-col gap-xs min-w-[250px]">
//               <div className="flex justify-between items-end">
//                 <span className="font-label-md text-on-surface-variant">Budget Utilization</span>
//                 <span className="font-headline-lg text-headline-lg text-on-surface">
//                   {report.financeSummary.utilizationRate}%
//                 </span>
//               </div>
//               <div className="h-2 bg-surface-container-high rounded-full overflow-hidden w-full">
//                 <div
//                   className="h-full bg-primary"
//                   style={{ width: `${Math.min(100, parseFloat(report.financeSummary.utilizationRate as unknown as string))}%` }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* KPI CARDS ROW */}
//           <div className="grid grid-cols-3 gap-[20px]">
//             <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md">
//               <div className="font-headline-lg text-headline-lg text-on-surface mb-xs">
//                 {report.performance.pblCompletionRate}%
//               </div>
//               <div className="font-label-md text-label-md text-on-surface">PBL Completion</div>
//               <div className="font-label-sm text-on-surface-variant">of sampled schools</div>
//             </div>
//             <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md">
//               <div className="font-headline-lg text-headline-lg text-on-surface mb-xs">
//                 {report.performance.evidenceSubmissionRate}%
//               </div>
//               <div className="font-label-md text-label-md text-on-surface">Evidence Submission</div>
//               <div className="font-label-sm text-on-surface-variant">of participating schools</div>
//             </div>
//             <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md">
//               <div className="font-headline-lg text-headline-lg text-on-surface mb-xs">
//                 {report.performance.attendanceRate}%
//               </div>
//               <div className="font-label-md text-label-md text-on-surface">Attendance Rate</div>
//               <div className="font-label-sm text-on-surface-variant">across all sessions</div>
//             </div>
//           </div>

//           {/* TABLE AND MILESTONES ROW */}
//           <div className="grid grid-cols-12 gap-[20px]">
//             {/* FINANCE TABLE */}
//             <div className="col-span-8 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md overflow-x-auto">
//               <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Budget Lines</h3>
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="border-b border-outline-variant">
//                     <th className="py-sm font-label-md text-on-surface-variant font-medium">Budget Line</th>
//                     <th className="py-sm font-label-md text-on-surface-variant font-medium text-right">Approved</th>
//                     <th className="py-sm font-label-md text-on-surface-variant font-medium text-right">Utilized</th>
//                     <th className="py-sm font-label-md text-on-surface-variant font-medium text-right">Rate</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {report.finance.map((row, idx) => (
//                     <tr key={idx} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest">
//                       <td className="py-sm font-body-md text-on-surface">{row.budgetLine}</td>
//                       <td className="py-sm font-body-md text-on-surface text-right">{row.approvedBudgetUnits.toLocaleString()}</td>
//                       <td className="py-sm font-body-md text-on-surface text-right">{row.cumulativeUtilizedUnits.toLocaleString()}</td>
//                       <td className="py-sm font-body-md text-right">
//                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium bg-surface-container text-on-surface border border-outline-variant">
//                           {row.cumulativeUtilizationRate}%
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                   {report.finance.length === 0 && (
//                     <tr>
//                       <td colSpan={4} className="py-md text-center text-on-surface-variant font-body-md">
//                         No financial data for this period.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* MILESTONES */}
//             <div className="col-span-4 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col gap-md">
//               <h3 className="font-headline-md text-headline-md text-on-surface">Milestone Summary</h3>
//               <p className="font-body-md text-on-surface flex-1">
//                 {report.performance.milestoneSummary || "No milestone summary available."}
//               </p>
//               <div className="flex flex-col gap-xs pt-md border-t border-outline-variant mt-auto">
//                 <div className="flex justify-between font-label-md text-on-surface-variant">
//                   <span>Period End Date:</span>
//                   <span className="text-on-surface">{report.performance.periodEndDate}</span>
//                 </div>
//                 <div className="flex justify-between font-label-md text-on-surface-variant">
//                   <span>Report Due Date:</span>
//                   <span className="text-on-surface font-medium">{report.performance.reportDueDate}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* AI NARRATIVE CARD */}
//           <div className="bg-primary-container border border-primary/30 rounded-lg p-md">
//             <h3 className="font-headline-md text-headline-md text-primary mb-sm flex items-center gap-xs">
//               <span className="material-symbols-outlined">auto_awesome</span>
//               Grant Narrative
//             </h3>
//             <p className="font-body-md text-on-surface mb-md">
//               {report.narrative}
//             </p>
//             <div>
//               <div className="font-label-sm font-medium text-on-surface-variant mb-xs">Source Facts</div>
//               <ul className="text-label-sm italic text-on-surface-variant flex flex-col gap-[2px]">
//                 {report.sourceFacts.map((fact, idx) => (
//                   <li key={idx} className="flex gap-xs">
//                     <span className="w-1 h-1 rounded-full bg-outline-variant mt-1.5 shrink-0" />
//                     {fact}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* EVIDENCE SECTION */}
//           <div>
//             <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Linked Evidence</h3>
//             {report.evidence.length === 0 ? (
//               <div className="p-lg border border-dashed border-outline-variant rounded-lg text-center font-body-md text-on-surface-variant">
//                 No evidence linked for this grant and month.
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[20px]">
//                 {report.evidence.map((ev) => (
//                   <div key={ev.recordId} className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow">
//                     {/* Use proper Next.js friendly image rendering if needed, or simple img */}
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img 
//                       src={ev.publicPath} 
//                       alt={ev.title} 
//                       className="w-full h-48 object-cover bg-surface-container"
//                     />
//                     <div className="p-md flex flex-col gap-sm flex-1">
//                       <div className="font-headline-md text-on-surface font-bold line-clamp-1" title={ev.title}>
//                         {ev.title}
//                       </div>
//                       <div className="flex flex-wrap gap-xs">
//                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm bg-surface-container text-on-surface">
//                           {ev.district}
//                         </span>
//                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm bg-surface-container text-on-surface">
//                           {ev.reportingMonth}
//                         </span>
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm ${getRecordTypeBadgeClasses(ev.recordType)}`}>
//                           {ev.recordType}
//                         </span>
//                       </div>
//                       <p className="font-body-md text-on-surface-variant line-clamp-2 mt-xs text-sm">
//                         {ev.summary}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }






import { getGrantReport, getGrantOptions } from "@/lib/program-intelligence";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function clean(v: string | string[] | undefined) {
  const val = Array.isArray(v) ? v[0] : v;
  return val && val !== "all" ? val : undefined;
}

function riskBadge(status: string) {
  if (status === "On Track") return "bg-[#dcfce7] text-[#166534]";
  if (status === "Behind") return "bg-[#fef9c3] text-[#854d0e]";
  if (status === "At Risk") return "bg-[#ffedd5] text-[#9a3412]";
  return "bg-error-container text-on-error-container";
}

function typeBadge(type: string) {
  if (type === "Image") return "bg-[#dbeafe] text-[#1e40af]";
  if (type === "News Clip") return "bg-[#f3e8ff] text-[#6b21a8]";
  return "bg-[#dcfce7] text-[#166534]";
}

export default async function ReportingPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const grantId = clean(sp.grantId);
  const month = clean(sp.month);

  const { options, report } = getGrantReport(grantId, month);
  const selectedGrantId = grantId ?? options.grants[0]?.grantId ?? "";
  const selectedMonth = month ?? options.months.at(-1) ?? "";

  return (
    <main className="p-xl max-w-[1600px] w-full mx-auto">
      <div className="flex justify-between items-start mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Grant Reporting</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Comprehensive overview and narrative generation for active grants.</p>
        </div>
        <div className="flex gap-sm">
          <button className="h-10 px-md bg-surface-container-lowest border border-outline-variant rounded-md text-on-surface font-label-md hover:bg-surface-container-low flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
          </button>
          <button className="h-10 px-md bg-primary-container text-on-primary-container rounded-md font-label-md hover:bg-primary hover:text-white flex items-center gap-xs transition-colors">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Generate Full Report
          </button>
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
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Choose a grant and reporting month above to view the report.</p>
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{report.performance.reportingMonth} • {report.performance.donor}</span>
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm ${f.cumulativeUtilizationRate >= 0.75 ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef9c3] text-[#854d0e]"}`}>
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

          {/* AI Narrative */}
          <div className="bg-surface-container-lowest border-2 border-primary-container rounded-xl p-lg shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">AI-Generated Grant Summary</h3>
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm ${typeBadge(ev.recordType)}`}>{ev.recordType}</span>
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
