"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-espresso-200 bg-white px-2.5 py-1 text-xs font-semibold text-espresso-700 hover:bg-latte transition-colors shadow-xs"
      title="Salin Password"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-700">Tersalin!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-espresso-500" />
          <span>Salin</span>
        </>
      )}
    </button>
  );
}
