"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export default function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="h-10 px-md bg-primary-container text-on-primary-container rounded-md font-label-md hover:bg-primary hover:text-white flex items-center gap-xs transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">{copied ? "check" : "content_copy"}</span>
      {copied ? "Copied" : label}
    </button>
  );
}
