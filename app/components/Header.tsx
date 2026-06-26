"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/review": "Review Summary",
  "/assistant": "AI Assistant",
  "/reporting": "Grant Reporting",
  "/gallery": "Evidence Gallery",
};

export default function Header() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "PBL Intelligence";

  return (
    <header className="fixed left-64 right-0 top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-4 px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Mantra4Change</p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
            CSV-backed
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            Deterministic metrics
          </span>
          <Link
            href="/reporting"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Open report
          </Link>
        </div>
      </div>
    </header>
  );
}
