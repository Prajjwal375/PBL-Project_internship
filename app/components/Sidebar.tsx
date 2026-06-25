"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/analytics", icon: "analytics", label: "School Analytics" },
  { href: "/review", icon: "summarize", label: "Review Summary" },
  { href: "/assistant", icon: "smart_toy", label: "AI Assistant" },
  { href: "/reporting", icon: "description", label: "Grant Reporting" },
  { href: "/gallery", icon: "collections", label: "Evidence Gallery" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-screen flex flex-col p-md bg-surface border-r border-outline-variant w-64 z-20">
      <div className="flex items-center gap-sm mb-xl px-sm">
        <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
          P
        </div>
        <div>
          <h1 className="text-headline-md font-headline-md font-bold text-primary">PBL Intelligence</h1>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Data Insights Platform</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-xs">
        {navItems.map((item) => {
          const isActive = item.href !== "#" && (
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          );
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors font-label-md text-label-md ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "fill" : ""}`}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
