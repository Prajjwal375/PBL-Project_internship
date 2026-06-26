"use client";

import { useState, useEffect } from "react";

type GrantNarrativeProps = {
  /** Deterministic narrative from the server — always shown immediately. */
  initialNarrative: string;
  sourceFacts: string[];
  grantId: string;
  month: string;
};

export default function GrantNarrative({ initialNarrative, sourceFacts, grantId, month }: GrantNarrativeProps) {
  const [narrative, setNarrative] = useState(initialNarrative);
  const [source, setSource] = useState<"deterministic" | "ai">("deterministic");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/grant-narrative", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grantId, month }),
    })
      .then((res) => res.json())
      .then((data: { narrative?: string; source?: "deterministic" | "ai" }) => {
        if (cancelled) return;
        if (data.narrative) {
          setNarrative(data.narrative);
          setSource(data.source ?? "deterministic");
        }
      })
      .catch(() => {
        // Silently keep the deterministic version — no error state.
      });

    return () => {
      cancelled = true;
    };
  }, [grantId, month]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
      <div>
        <div className="flex items-center gap-sm mb-sm">
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Grant Narrative</div>
          <span
            className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full text-label-sm font-label-sm ${
              source === "ai"
                ? "bg-[#dcfce7] text-[#166634]"
                : "bg-surface-container text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">
              {source === "ai" ? "auto_awesome" : "calculate"}
            </span>
            {source === "ai" ? "AI-generated" : "Deterministic summary"}
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface leading-relaxed">{narrative}</p>
      </div>
      <div>
        <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Source Facts</div>
        <div className="flex flex-col gap-xs">
          {sourceFacts.map((fact, i) => (
            <div key={i} className="flex items-start gap-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant mt-1.5 shrink-0" />
              <span className="font-label-sm text-label-sm text-on-surface-variant italic">{fact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
