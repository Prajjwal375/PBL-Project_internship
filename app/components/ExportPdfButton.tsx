"use client";

import { useState } from "react";

type ExportPdfButtonProps = {
  title: string;
  subtitle?: string;
  body: string;
  fileName: string;
  label?: string;
};

/**
 * Generates a real downloadable PDF from plain text using jsPDF.
 * Text-based (not a screenshot), so it is reliable and does not depend
 * on the page's CSS or colors. Uppercase lines are treated as section
 * headings and "- " lines as bullets.
 */
export default function ExportPdfButton({ title, subtitle, body, fileName, label = "Download PDF" }: ExportPdfButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const marginX = 48;
      const marginTop = 56;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - marginX * 2;
      let y = marginTop;

      const addLines = (text: string, fontStyle: "normal" | "bold", fontSize: number, gap: number) => {
        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(fontSize);
        const wrapped = doc.splitTextToSize(text, maxWidth) as string[];
        for (const line of wrapped) {
          if (y > pageHeight - marginTop) {
            doc.addPage();
            y = marginTop;
          }
          doc.text(line, marginX, y);
          y += gap;
        }
      };

      // Title
      addLines(title, "bold", 16, 22);
      if (subtitle) {
        doc.setTextColor(90);
        addLines(subtitle, "normal", 11, 16);
        doc.setTextColor(0);
      }
      y += 8;

      // Body
      const isHeading = (line: string) => /^[A-Z][A-Z0-9 \-—()/&]+$/.test(line.trim()) && line.trim().length > 2;

      for (const raw of body.split("\n")) {
        const line = raw.replace(/\s+$/, "");
        if (line.trim().length === 0) {
          y += 8;
          continue;
        }
        if (isHeading(line)) {
          y += 6;
          addLines(line, "bold", 12, 16);
        } else {
          addLines(line, "normal", 10, 14);
        }
      }

      doc.save(fileName);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      className="h-10 px-md bg-surface-container-lowest border border-outline-variant rounded-md text-on-surface font-label-md hover:bg-surface-container-low flex items-center gap-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
      {busy ? "Preparing…" : label}
    </button>
  );
}
