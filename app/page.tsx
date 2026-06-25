// import { getProgramReview, getGrantOptions } from "@/lib/program-intelligence";
// import Link from "next/link";

// export default function Dashboard() {
//   const review = getProgramReview();
//   const grantOptions = getGrantOptions();

//   // Combine top and bottom districts and deduplicate to get a sample for the risk chart
//   const uniqueDistrictsMap = new Map();
//   review.districts.top.forEach((d) => uniqueDistrictsMap.set(d.name, d.riskStatus));
//   review.districts.bottom.forEach((d) => uniqueDistrictsMap.set(d.name, d.riskStatus));
//   const uniqueDistricts = Array.from(uniqueDistrictsMap.values());

//   const riskCounts = {
//     "On Track": uniqueDistricts.filter((status) => status === "On Track").length,
//     Behind: uniqueDistricts.filter((status) => status === "Behind").length,
//     "At Risk": uniqueDistricts.filter((status) => status === "At Risk").length,
//     Critical: uniqueDistricts.filter((status) => status === "Critical").length,
//   };
//   const totalRiskCount = uniqueDistricts.length || 1;

//   const getRiskBadgeClasses = (status: string) => {
//     switch (status) {
//       case "On Track":
//         return "bg-emerald-50 text-emerald-700 border border-emerald-200";
//       case "Behind":
//         return "bg-amber-50 text-amber-700 border border-amber-200";
//       case "At Risk":
//         return "bg-orange-50 text-orange-700 border border-orange-200";
//       case "Critical":
//         return "bg-red-50 text-red-700 border border-red-200";
//       default:
//         return "bg-surface-container text-on-surface-variant border border-outline-variant";
//     }
//   };

//   const riskColors = {
//     "On Track": "#10b981", // emerald-500
//     Behind: "#f59e0b", // amber-500
//     "At Risk": "#f97316", // orange-500
//     Critical: "#ef4444", // red-500
//   };

//   return (
//     <main className="p-lg bg-background min-h-screen">
//       <div className="mb-lg">
//         <h1 className="font-headline-lg text-headline-lg text-on-surface">Overview</h1>
//         <p className="font-body-md text-body-md text-on-surface-variant">
//           High-level metrics across all districts.
//         </p>
//       </div>

//       <div className="grid grid-cols-12 gap-[20px] mb-[20px]">
//         {/* Total Schools */}
//         <div className="col-span-2 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md relative">
//           <div className="absolute top-md right-md text-outline">
//             <span className="material-symbols-outlined">school</span>
//           </div>
//           <div className="font-headline-lg text-headline-lg text-on-surface mb-xs">
//             {review.metrics.totalSchools}
//           </div>
//           <div className="font-label-md text-label-md text-on-surface-variant">Total Schools</div>
//         </div>

//         {/* Avg. Attendance */}
//         <div className="col-span-2 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md relative">
//           <div className="absolute top-md right-md text-outline">
//             <span className="material-symbols-outlined">how_to_reg</span>
//           </div>
//           <div className="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center">
//             {review.metrics.attendanceRate}%
//             {review.movement.find((m) => m.metric === "Attendance")?.delta !== undefined && (
//               <span
//                 className={`ml-2 text-label-sm px-1.5 py-0.5 rounded-full ${
//                   (review.movement.find((m) => m.metric === "Attendance")?.delta || 0) >= 0
//                     ? "bg-emerald-50 text-emerald-700"
//                     : "bg-red-50 text-red-700"
//                 }`}
//               >
//                 {(review.movement.find((m) => m.metric === "Attendance")?.delta || 0) >= 0 ? "↑" : "↓"}{" "}
//                 {Math.abs(review.movement.find((m) => m.metric === "Attendance")?.delta || 0)}%
//               </span>
//             )}
//           </div>
//           <div className="font-label-md text-label-md text-on-surface-variant">Avg. Attendance</div>
//         </div>

//         {/* Participating Schools */}
//         <div className="col-span-2 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md relative">
//           <div className="absolute top-md right-md text-outline">
//             <span className="material-symbols-outlined">check_circle</span>
//           </div>
//           <div className="font-headline-lg text-headline-lg text-on-surface mb-xs">
//             {review.metrics.participatingSchools}
//           </div>
//           <div className="font-label-md text-label-md text-on-surface-variant">Participating Schools</div>
//         </div>

//         {/* Evidence Submitted */}
//         <div className="col-span-2 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md relative">
//           <div className="absolute top-md right-md text-outline">
//             <span className="material-symbols-outlined">upload_file</span>
//           </div>
//           <div className="font-headline-lg text-headline-lg text-on-surface mb-xs">
//             {review.metrics.evidenceSubmitted}
//           </div>
//           <div className="font-label-md text-label-md text-on-surface-variant">Evidence Submitted</div>
//         </div>

//         {/* Participation Rate */}
//         <div className="col-span-2 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md relative">
//           <div className="absolute top-md right-md text-outline">
//             <span className="material-symbols-outlined">percent</span>
//           </div>
//           <div className="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center">
//             {review.metrics.participationRate}%
//             {review.movement.find((m) => m.metric === "Participation")?.delta !== undefined && (
//               <span
//                 className={`ml-2 text-label-sm px-1.5 py-0.5 rounded-full ${
//                   (review.movement.find((m) => m.metric === "Participation")?.delta || 0) >= 0
//                     ? "bg-emerald-50 text-emerald-700"
//                     : "bg-red-50 text-red-700"
//                 }`}
//               >
//                 {(review.movement.find((m) => m.metric === "Participation")?.delta || 0) >= 0 ? "↑" : "↓"}{" "}
//                 {Math.abs(review.movement.find((m) => m.metric === "Participation")?.delta || 0)}%
//               </span>
//             )}
//           </div>
//           <div className="font-label-md text-label-md text-on-surface-variant">Participation Rate</div>
//         </div>

//         {/* Grant Progress */}
//         <div className="col-span-2 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md relative">
//           <div className="absolute top-md right-md text-outline">
//             <span className="material-symbols-outlined">account_balance</span>
//           </div>
//           <div className="font-headline-lg text-headline-lg text-on-surface mb-xs">
//             {grantOptions.grants.length}
//           </div>
//           <div className="font-label-md text-label-md text-on-surface-variant">Grants Available</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-12 gap-[20px] mb-[20px]">
//         {/* Monthly Trend */}
//         <div className="col-span-8 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md">
//           <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Monthly Trend</h2>
//           <div className="grid grid-cols-3 gap-md">
//             {review.movement.map((m) => (
//               <div key={m.metric} className="p-md bg-surface-container-low rounded-lg border border-outline-variant">
//                 <div className="font-label-md text-label-md text-on-surface-variant mb-xs">{m.metric}</div>
//                 <div className="flex items-end gap-sm">
//                   <div className="font-headline-lg text-headline-lg text-on-surface">{m.current}%</div>
//                   <div className="font-body-md text-body-md text-on-surface-variant mb-0.5">vs {m.previous}%</div>
//                   <div
//                     className={`ml-auto font-label-md px-2 py-0.5 rounded-full flex items-center ${
//                       m.delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
//                     }`}
//                   >
//                     <span className="material-symbols-outlined text-[14px] mr-1">
//                       {m.delta >= 0 ? "arrow_upward" : "arrow_downward"}
//                     </span>
//                     {Math.abs(m.delta)}%
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Risk Distribution */}
//         <div className="col-span-4 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col">
//           <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Risk Distribution</h2>
//           <div className="flex-1 flex items-center justify-center relative">
//             <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
//               {(() => {
//                 let cumulativePercent = 0;
//                 return ["On Track", "Behind", "At Risk", "Critical"].map((status) => {
//                   const count = riskCounts[status as keyof typeof riskCounts];
//                   if (count === 0) return null;
//                   const percent = count / totalRiskCount;
//                   const dashArray = `${percent * 314} 314`;
//                   const dashOffset = `-${cumulativePercent * 314}`;
//                   cumulativePercent += percent;
//                   return (
//                     <circle
//                       key={status}
//                       cx="50"
//                       cy="50"
//                       r="40"
//                       fill="transparent"
//                       stroke={riskColors[status as keyof typeof riskColors]}
//                       strokeWidth="20"
//                       strokeDasharray={dashArray}
//                       strokeDashoffset={dashOffset}
//                     />
//                   );
//                 });
//               })()}
//             </svg>
//             <div className="absolute inset-0 flex flex-col items-center justify-center">
//               <span className="font-headline-md text-on-surface">{uniqueDistricts.length}</span>
//               <span className="font-label-sm text-on-surface-variant">Districts</span>
//             </div>
//           </div>
//           <div className="mt-md grid grid-cols-2 gap-xs">
//             {["On Track", "Behind", "At Risk", "Critical"].map((status) => (
//               <div key={status} className="flex items-center gap-xs">
//                 <div
//                   className="w-3 h-3 rounded-full"
//                   style={{ backgroundColor: riskColors[status as keyof typeof riskColors] }}
//                 />
//                 <span className="font-label-sm text-on-surface-variant flex-1">{status}</span>
//                 <span className="font-label-sm font-medium text-on-surface">
//                   {riskCounts[status as keyof typeof riskCounts]}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-12 gap-[20px]">
//         {/* Top Performing Schools */}
//         <div className="col-span-8 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md overflow-x-auto">
//           <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Top Performing Schools</h2>
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="border-b border-outline-variant">
//                 <th className="py-sm font-label-md text-on-surface-variant font-medium">School</th>
//                 <th className="py-sm font-label-md text-on-surface-variant font-medium">District</th>
//                 <th className="py-sm font-label-md text-on-surface-variant font-medium">Block</th>
//                 <th className="py-sm font-label-md text-on-surface-variant font-medium">Attendance %</th>
//                 <th className="py-sm font-label-md text-on-surface-variant font-medium">Risk Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {review.schools.top.map((school) => (
//                 <tr key={school.schoolCode} className="border-b border-outline-variant last:border-0">
//                   <td className="py-sm font-body-md text-on-surface">{school.school}</td>
//                   <td className="py-sm font-body-md text-on-surface-variant">{school.district}</td>
//                   <td className="py-sm font-body-md text-on-surface-variant">{school.block}</td>
//                   <td className="py-sm font-body-md text-on-surface">
//                     <div className="flex items-center gap-sm">
//                       <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-primary"
//                           style={{ width: `${school.attendanceRate}%` }}
//                         />
//                       </div>
//                       <span>{school.attendanceRate}%</span>
//                     </div>
//                   </td>
//                   <td className="py-sm">
//                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm font-medium ${getRiskBadgeClasses(school.riskStatus)}`}>
//                       {school.riskStatus}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="col-span-4 flex flex-col gap-[20px]">
//           {/* Quick Actions */}
//           <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md">
//             <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Quick Actions</h2>
//             <div className="flex flex-col gap-sm">
//               <Link
//                 href="/reporting"
//                 className="flex items-center gap-sm p-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant text-on-surface font-body-md"
//               >
//                 <span className="material-symbols-outlined text-primary">analytics</span>
//                 View Grant Reporting
//               </Link>
//               <Link
//                 href="/assistant"
//                 className="flex items-center gap-sm p-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant text-on-surface font-body-md"
//               >
//                 <span className="material-symbols-outlined text-primary">chat_spark</span>
//                 Ask AI Assistant
//               </Link>
//             </div>
//           </div>

//           {/* Program Summary */}
//           <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex-1">
//             <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Program Summary</h2>
//             <ul className="flex flex-col gap-sm">
//               {review.summary.achievements.map((achievement, index) => (
//                 <li key={index} className="flex gap-sm font-body-md text-on-surface">
//                   <span className="material-symbols-outlined text-emerald-600 shrink-0">check_circle</span>
//                   <span>{achievement}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }






import Link from "next/link";
import { getProgramReview, getGrantOptions } from "@/lib/program-intelligence";

function riskBadge(status: string) {
  if (status === "On Track") return "bg-[#dcfce7] text-[#166534]";
  if (status === "Behind") return "bg-[#fef9c3] text-[#854d0e]";
  if (status === "At Risk") return "bg-[#ffedd5] text-[#9a3412]";
  return "bg-error-container text-on-error-container";
}

export default function Home() {
  const review = getProgramReview();
  const grants = getGrantOptions();
  const m = review.metrics;
  const movement = review.movement;

  const totalRiskSchools = Object.values(m.riskDistribution).reduce((a, b) => a + b, 0) || 1;
  const onTrackPct = Math.round((m.riskDistribution["On Track"] / totalRiskSchools) * 100);
  const monitorPct = Math.round(((m.riskDistribution["Behind"] + m.riskDistribution["At Risk"]) / totalRiskSchools) * 100);
  const criticalPct = Math.round((m.riskDistribution["Critical"] / totalRiskSchools) * 100);

  return (
    <main className="p-xl max-w-[1600px] w-full mx-auto grid grid-cols-12 gap-gutter">
      <div className="col-span-12 flex justify-between items-end mb-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            High-level metrics across all districts. Latest month: {review.latestMonth}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-md">
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Schools</span>
            <span className="material-symbols-outlined text-outline">school</span>
          </div>
          <div className="mt-lg flex items-baseline gap-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface">{m.totalSchools.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Avg. Attendance</span>
            <span className="material-symbols-outlined text-outline">show_chart</span>
          </div>
          <div className="mt-lg flex items-baseline gap-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface">{m.attendanceRate}%</span>
            {movement.length > 0 && (
              <span className={`font-label-sm text-label-sm flex items-center ${movement[2]?.delta >= 0 ? "text-primary" : "text-error"}`}>
                <span className="material-symbols-outlined text-[14px]">{movement[2]?.delta >= 0 ? "arrow_upward" : "arrow_downward"}</span>
                {Math.abs(movement[2]?.delta ?? 0)}%
              </span>
            )}
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Participating</span>
            <span className="material-symbols-outlined text-outline">trending_up</span>
          </div>
          <div className="mt-lg flex items-baseline gap-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface">{m.participatingSchools.toLocaleString()}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">schools</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Evidence Submitted</span>
            <span className="material-symbols-outlined text-outline">fact_check</span>
          </div>
          <div className="mt-lg flex items-baseline gap-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface">{m.evidenceSubmitted.toLocaleString()}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">schools</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Participation Rate</span>
            <span className="material-symbols-outlined text-outline">task_alt</span>
          </div>
          <div className="mt-lg flex items-baseline gap-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface">{m.participationRate}%</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md flex flex-col justify-between hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Grant Progress</span>
            <span className="material-symbols-outlined text-outline">account_balance</span>
          </div>
          <div className="mt-lg flex items-center gap-md w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">{grants.grants.length}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">active grants</span>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="col-span-8 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-lg mt-md flex flex-col">
        <div className="flex justify-between items-center mb-lg">
          <h3 className="font-headline-md text-headline-md text-on-surface">Monthly Implementation Trend</h3>
        </div>
        {movement.length > 0 ? (
          <div className="flex flex-col gap-md">
            {movement.map((mv) => (
              <div key={mv.metric} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-tertiary-fixed">
                <div>
                  <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{mv.metric}</div>
                  <div className="font-headline-md text-headline-md text-on-surface mt-xs">{mv.current}%</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">prev: {mv.previous}%</div>
                </div>
                <div className={`flex items-center gap-xs font-headline-md text-headline-md ${mv.delta >= 0 ? "text-[#166534]" : "text-error"}`}>
                  <span className="material-symbols-outlined">{mv.delta >= 0 ? "trending_up" : "trending_down"}</span>
                  {mv.delta > 0 ? "+" : ""}{mv.delta}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 w-full h-64 relative border-b border-l border-tertiary-fixed flex items-end pt-md pb-xs pl-xs">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
              <defs>
                <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,150 L100,140 L200,160 L300,110 L400,120 L500,80 L600,90 L700,50 L800,60 L900,20 L1000,30 L1000,200 L0,200 Z" fill="url(#chartGrad)" />
              <path d="M0,150 L100,140 L200,160 L300,110 L400,120 L500,80 L600,90 L700,50 L800,60 L900,20 L1000,30" fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            </svg>
          </div>
        )}
      </div>

      {/* Risk Distribution */}
      <div className="col-span-4 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-lg mt-md flex flex-col">
        <div className="flex justify-between items-center mb-lg">
          <h3 className="font-headline-md text-headline-md text-on-surface">Risk Distribution</h3>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" fill="transparent" r="16" stroke="#e9edff" strokeWidth="8" />
            <circle cx="16" cy="16" fill="transparent" r="16" stroke="#2563eb" strokeDasharray={`${onTrackPct} 100`} strokeDashoffset="0" strokeWidth="8" />
            <circle cx="16" cy="16" fill="transparent" r="16" stroke="#f59e0b" strokeDasharray={`${monitorPct} 100`} strokeDashoffset={`-${onTrackPct}`} strokeWidth="8" />
            <circle cx="16" cy="16" fill="transparent" r="16" stroke="#ba1a1a" strokeDasharray={`${criticalPct} 100`} strokeDashoffset={`-${onTrackPct + monitorPct}`} strokeWidth="8" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-headline-lg text-headline-lg text-on-surface">{(m.totalSchools / 1000).toFixed(1)}k</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Schools</span>
          </div>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-sm pt-md">
          <div className="flex items-center gap-xs font-label-md text-label-md text-on-surface"><div className="w-2 h-2 rounded-full bg-[#2563eb]"></div> On Track ({onTrackPct}%)</div>
          <div className="flex items-center gap-xs font-label-md text-label-md text-on-surface"><div className="w-2 h-2 rounded-full bg-error"></div> Critical ({criticalPct}%)</div>
          <div className="flex items-center gap-xs font-label-md text-label-md text-on-surface"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div> Monitor ({monitorPct}%)</div>
        </div>
      </div>

      {/* Top Schools */}
      <div className="col-span-8 bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-lg flex flex-col">
        <div className="flex justify-between items-center mb-md border-b border-tertiary-fixed pb-md">
          <h3 className="font-headline-md text-headline-md text-on-surface">Top Performing Schools</h3>
          <Link href="/analytics" className="text-primary font-label-md hover:underline">View All</Link>
        </div>
        <table className="w-full text-left font-body-md text-body-md">
          <thead>
            <tr className="text-on-surface-variant font-label-md text-label-md border-b border-tertiary-fixed">
              <th className="pb-sm font-medium">School</th>
              <th className="pb-sm font-medium">District</th>
              <th className="pb-sm font-medium">Attendance %</th>
              <th className="pb-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {review.schools.top.map((school) => (
              <tr key={school.schoolCode} className="border-b border-tertiary-fixed hover:bg-surface-container-low transition-colors">
                <td className="py-md flex items-center gap-sm">
                  <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary font-bold text-label-sm">
                    {school.school.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-on-surface font-medium">{school.school}</div>
                    <div className="text-on-surface-variant text-label-sm">{school.block}</div>
                  </div>
                </td>
                <td className="py-md text-on-surface-variant">{school.district}</td>
                <td className="py-md text-on-surface">{school.attendanceRate}%</td>
                <td className="py-md">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm ${riskBadge(school.riskStatus)}`}>
                    {school.riskStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions + Summary */}
      <div className="col-span-4 flex flex-col gap-gutter">
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-lg">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Quick Actions</h3>
          <div className="flex flex-col gap-sm">
            <Link href="/reporting" className="w-full flex items-center justify-between p-md bg-surface border border-outline-variant rounded-lg hover:border-primary-container hover:bg-surface-container-low transition-all text-left">
              <div className="flex items-center gap-md">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-semibold">Generate Grant Report</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Q3 Data ready</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant">arrow_forward</span>
            </Link>
            <Link href="/assistant" className="w-full flex items-center justify-between p-md bg-surface border border-outline-variant rounded-lg hover:border-primary-container hover:bg-surface-container-low transition-all text-left">
              <div className="flex items-center gap-md">
                <div className="w-8 h-8 rounded-full bg-surface-variant text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-semibold">Ask AI Assistant</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Analyze recent trends</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-lg flex-1">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Program Summary</h3>
          <div className="flex flex-col gap-md">
            {review.summary.achievements.map((a, i) => (
              <div key={i} className="flex items-start gap-md">
                <div className="w-6 h-6 rounded-full border-2 border-[#16a34a] flex items-center justify-center mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-[12px] text-[#16a34a]">check</span>
                </div>
                <div className="font-body-md text-body-md text-on-surface">{a}</div>
              </div>
            ))}
            {review.summary.risks.slice(0, 1).map((r, i) => (
              <div key={i} className="flex items-start gap-md">
                <div className="w-6 h-6 rounded-full border-2 border-error flex items-center justify-center mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-[12px] text-error">warning</span>
                </div>
                <div className="font-body-md text-body-md text-on-surface">{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

