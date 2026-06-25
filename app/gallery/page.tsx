// import { getEvidence, getGrantOptions } from "@/lib/program-intelligence";
// import Link from "next/link";

// export default async function EvidenceGallery(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
//   const searchParams = await props.searchParams;
  
//   const grantId = searchParams.grantId || "";
//   const month = searchParams.month || "";
//   const type = searchParams.type || "";

//   const allEvidence = getEvidence();
//   const options = getGrantOptions();

//   // Filter evidence based on search params
//   const filteredEvidence = allEvidence.filter((item) => {
//     if (grantId && item.grantId !== grantId) return false;
//     if (month && item.reportingMonth !== month) return false;
//     if (type && item.recordType !== type) return false;
//     return true;
//   });

//   const totalCount = filteredEvidence.length;
//   const imageCount = filteredEvidence.filter((item) => item.recordType === "Image").length;
//   const newsCount = filteredEvidence.filter((item) => item.recordType === "News Clip").length;
//   const recognitionCount = filteredEvidence.filter((item) => item.recordType === "Recognition").length;

//   const getRecordTypeBadgeClasses = (recordType: string) => {
//     switch (recordType) {
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
//       <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-lg gap-md">
//         <div>
//           <h1 className="font-headline-lg text-headline-lg text-on-surface">Evidence Gallery</h1>
//           <p className="font-body-md text-body-md text-on-surface-variant">
//             Browse and filter visual evidence collected across programs.
//           </p>
//         </div>

//         {/* Stat Chips */}
//         <div className="flex gap-sm flex-wrap">
//           <div className="bg-surface-container-low border border-outline-variant rounded-full px-sm py-1 font-label-md text-on-surface flex items-center gap-1">
//             <span className="font-medium">Total:</span> {totalCount}
//           </div>
//           <div className="bg-blue-50 border border-blue-200 rounded-full px-sm py-1 font-label-md text-blue-700 flex items-center gap-1">
//             <span className="font-medium">Images:</span> {imageCount}
//           </div>
//           <div className="bg-purple-50 border border-purple-200 rounded-full px-sm py-1 font-label-md text-purple-700 flex items-center gap-1">
//             <span className="font-medium">News Clips:</span> {newsCount}
//           </div>
//           <div className="bg-emerald-50 border border-emerald-200 rounded-full px-sm py-1 font-label-md text-emerald-700 flex items-center gap-1">
//             <span className="font-medium">Recognition:</span> {recognitionCount}
//           </div>
//         </div>
//       </div>

//       {/* FILTER BAR */}
//       <div className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg p-md mb-[20px]">
//         <form method="GET" className="flex flex-wrap items-end gap-md">
//           <div className="flex flex-col gap-xs flex-1 min-w-[200px]">
//             <label className="font-label-sm text-on-surface-variant">Grant</label>
//             <select
//               name="grantId"
//               defaultValue={grantId}
//               onChange={(e) => e.target.form?.submit()}
//               className="bg-surface-container-low border border-outline-variant rounded p-sm font-body-md text-on-surface focus:outline-none focus:border-primary"
//             >
//               <option value="">All Grants</option>
//               {options.grants.map((g) => (
//                 <option key={g.grantId} value={g.grantId}>
//                   {g.grantName}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col gap-xs flex-1 min-w-[150px]">
//             <label className="font-label-sm text-on-surface-variant">Month</label>
//             <select
//               name="month"
//               defaultValue={month}
//               onChange={(e) => e.target.form?.submit()}
//               className="bg-surface-container-low border border-outline-variant rounded p-sm font-body-md text-on-surface focus:outline-none focus:border-primary"
//             >
//               <option value="">All Months</option>
//               {options.months.map((m) => (
//                 <option key={m} value={m}>{m}</option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col gap-xs flex-1 min-w-[150px]">
//             <label className="font-label-sm text-on-surface-variant">Type</label>
//             <select
//               name="type"
//               defaultValue={type}
//               onChange={(e) => e.target.form?.submit()}
//               className="bg-surface-container-low border border-outline-variant rounded p-sm font-body-md text-on-surface focus:outline-none focus:border-primary"
//             >
//               <option value="">All Types</option>
//               <option value="Image">Image</option>
//               <option value="News Clip">News Clip</option>
//               <option value="Recognition">Recognition</option>
//             </select>
//           </div>

//           <Link
//             href="/gallery"
//             className="h-[38px] px-md flex items-center bg-surface-container-high hover:bg-surface-container border border-outline-variant rounded font-body-md text-on-surface transition-colors"
//           >
//             Reset Filters
//           </Link>
//         </form>
//       </div>

//       {/* GALLERY GRID */}
//       {filteredEvidence.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-[100px] bg-surface-container-lowest border border-tertiary-fixed rounded-lg text-center">
//           <span className="material-symbols-outlined text-[48px] text-outline mb-sm">photo_library</span>
//           <h2 className="font-headline-md text-on-surface mb-xs">No evidence found</h2>
//           <p className="font-body-md text-on-surface-variant max-w-md">
//             Try adjusting your filters or resetting them to see all available evidence.
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[20px]">
//           {filteredEvidence.map((ev) => (
//             <div
//               key={ev.recordId}
//               className="bg-surface-container-lowest border border-tertiary-fixed rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow"
//             >
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={ev.publicPath}
//                 alt={ev.title}
//                 className="w-full h-48 object-cover bg-surface-container"
//               />
//               <div className="p-md flex flex-col gap-sm flex-1">
//                 <div className="font-headline-md text-on-surface font-bold line-clamp-1" title={ev.title}>
//                   {ev.title}
//                 </div>
                
//                 <div className="flex items-center gap-xs flex-wrap">
//                   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
//                     {ev.district}
//                   </span>
//                   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium ${getRecordTypeBadgeClasses(ev.recordType)}`}>
//                     {ev.recordType}
//                   </span>
//                 </div>
                
//                 <div className="flex items-center gap-xs font-label-sm text-on-surface-variant mt-1">
//                   <span>{ev.grantId}</span>
//                   <span>•</span>
//                   <span>{ev.reportingMonth}</span>
//                 </div>
                
//                 <p className="font-body-md text-on-surface-variant line-clamp-2 mt-xs text-sm">
//                   {ev.summary}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </main>
//   );
// }






import { getEvidence, getGrantOptions } from "@/lib/program-intelligence";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function clean(v: string | string[] | undefined) {
  const val = Array.isArray(v) ? v[0] : v;
  return val && val !== "all" ? val : undefined;
}

function typeBadge(type: string) {
  if (type === "Image") return "bg-[#dbeafe] text-[#1e40af]";
  if (type === "News Clip") return "bg-[#f3e8ff] text-[#6b21a8]";
  return "bg-[#dcfce7] text-[#166534]";
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const grantId = clean(sp.grantId);
  const month = clean(sp.month);
  const type = clean(sp.type);

  const allEvidence = getEvidence();
  const options = getGrantOptions();

  const filtered = allEvidence.filter(ev =>
    (!grantId || ev.grantId === grantId) &&
    (!month || ev.reportingMonth === month) &&
    (!type || ev.recordType === type)
  );

  const imageCount = filtered.filter(e => e.recordType === "Image").length;
  const newsCount = filtered.filter(e => e.recordType === "News Clip").length;
  const recognitionCount = filtered.filter(e => e.recordType === "Recognition").length;

  return (
    <main className="p-xl max-w-[1600px] w-full mx-auto">
      <div className="flex justify-between items-start mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Evidence Gallery</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Browse and filter evidence assets linked to grants and school activities.</p>
        </div>
        <button className="h-10 px-md bg-primary-container text-on-primary-container rounded-md font-label-md hover:bg-primary hover:text-white flex items-center gap-xs transition-colors">
          <span className="material-symbols-outlined text-[18px]">upload</span> Upload Evidence
        </button>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md items-end shadow-sm">
        <div className="flex flex-col gap-xs flex-1 min-w-[160px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Grant</label>
          <select name="grantId" defaultValue={grantId ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Grants</option>
            {options.grants.map(g => <option key={g.grantId} value={g.grantId}>{g.grantId}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[160px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Month</label>
          <select name="month" defaultValue={month ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Months</option>
            {options.months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs flex-1 min-w-[160px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Type</label>
          <select name="type" defaultValue={type ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Types</option>
            <option value="Image">Image</option>
            <option value="News Clip">News Clip</option>
            <option value="Recognition">Recognition</option>
          </select>
        </div>
        <div className="flex items-end gap-sm">
          <button type="submit" className="h-10 px-md bg-primary-container text-on-primary-container rounded font-label-md hover:bg-primary hover:text-white transition-colors">Apply</button>
          <a href="/gallery" className="h-10 px-md flex items-center rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-md border border-outline-variant">Reset</a>
        </div>
      </form>

      {/* Stats chips */}
      <div className="flex gap-sm mb-lg">
        <span className="inline-flex items-center px-md py-xs rounded-full bg-surface-container text-on-surface font-label-md border border-outline-variant">Total Assets: {filtered.length}</span>
        <span className="inline-flex items-center px-md py-xs rounded-full bg-[#dbeafe] text-[#1e40af] font-label-md">Images: {imageCount}</span>
        <span className="inline-flex items-center px-md py-xs rounded-full bg-[#f3e8ff] text-[#6b21a8] font-label-md">News Clips: {newsCount}</span>
        <span className="inline-flex items-center px-md py-xs rounded-full bg-[#dcfce7] text-[#166534] font-label-md">Recognition: {recognitionCount}</span>
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest border border-tertiary-fixed rounded-xl">
          <span className="material-symbols-outlined text-[48px] text-outline mb-md">collections</span>
          <h3 className="font-headline-md text-headline-md text-on-surface">No evidence found</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Try adjusting your filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filtered.map((ev) => (
            <div key={ev.recordId} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-[0_4px_12px_-2px_rgb(0,0,0,0.1)] transition-shadow cursor-pointer group">
              <div className="h-48 bg-surface-container relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ev.publicPath} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-sm right-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm font-semibold uppercase tracking-wide ${typeBadge(ev.recordType)}`}>
                    {ev.recordType}
                  </span>
                </div>
              </div>
              <div className="p-md">
                <div className="font-label-md text-label-md text-on-surface font-semibold mb-xs">{ev.title}</div>
                <div className="flex items-center gap-xs mb-xs flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-sm">{ev.district}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">#{ev.grantId}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">• {ev.reportingMonth}</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant line-clamp-2">{ev.summary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
