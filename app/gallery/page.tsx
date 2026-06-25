import { getEvidence, getGrantOptions } from "@/lib/program-intelligence";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function clean(v: string | string[] | undefined) {
  const val = Array.isArray(v) ? v[0] : v;
  return val && val !== "all" ? val : undefined;
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

export default async function GalleryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const grantId = clean(sp.grantId);
  const month = clean(sp.month);
  const type = clean(sp.type);

  const allEvidence = getEvidence();
  const options = getGrantOptions();

  // Build the Type options from the actual data values so the filter always
  // matches what is stored (e.g. "image", "news_clipping").
  const evidenceTypes = Array.from(new Set(allEvidence.map(ev => ev.recordType))).sort();

  const filtered = allEvidence.filter(ev =>
    (!grantId || ev.grantId === grantId) &&
    (!month || ev.reportingMonth === month) &&
    (!type || ev.recordType === type)
  );

  const typeCounts = evidenceTypes.map(t => ({
    type: t,
    label: prettyType(t),
    count: filtered.filter(ev => ev.recordType === t).length,
  }));

  return (
    <main className="p-xl max-w-[1600px] w-full mx-auto">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Evidence Gallery</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Browse and filter evidence assets linked to grants and school activities.
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md items-end shadow-sm">
        <div className="flex flex-col gap-xs flex-1 min-w-[160px]">
          <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Grant</label>
          <select name="grantId" defaultValue={grantId ?? "all"}
            className="h-10 px-sm rounded border border-outline-variant bg-transparent text-body-md font-body-md focus:border-primary outline-none">
            <option value="all">All Grants</option>
            {options.grants.map(g => <option key={g.grantId} value={g.grantId}>{g.grantName}</option>)}
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
            {evidenceTypes.map(t => <option key={t} value={t}>{prettyType(t)}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-sm">
          <button type="submit" className="h-10 px-md bg-primary-container text-on-primary-container rounded font-label-md hover:bg-primary hover:text-white transition-colors">
            Apply
          </button>
          <a href="/gallery" className="h-10 px-md flex items-center rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-md border border-outline-variant">
            Reset
          </a>
        </div>
      </form>

      {/* Stats chips */}
      <div className="flex gap-sm mb-lg flex-wrap">
        <span className="inline-flex items-center px-md py-xs rounded-full bg-surface-container text-on-surface font-label-md border border-outline-variant">
          Total Assets: {filtered.length}
        </span>
        {typeCounts.map(tc => (
          <span key={tc.type} className={`inline-flex items-center px-md py-xs rounded-full font-label-md ${typeBadge(tc.type)}`}>
            {tc.label}: {tc.count}
          </span>
        ))}
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
                    {prettyType(ev.recordType)}
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
