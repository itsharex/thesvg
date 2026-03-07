"use client";

import { memo, useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { IconEntry } from "@/lib/icons";

interface IconCardProps {
  icon: IconEntry;
  onSelect: (icon: IconEntry) => void;
}

export const IconCard = memo(function IconCard({
  icon,
  onSelect,
}: IconCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const res = await fetch(icon.variants.default);
        const svg = await res.text();
        await navigator.clipboard.writeText(svg);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        await navigator.clipboard.writeText(
          `https://thesvg.org${icon.variants.default}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    },
    [icon.variants.default]
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(icon)}
      className="group relative flex flex-col items-center gap-2.5 rounded-xl border border-transparent bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Icon preview - mid-tone bg that contrasts with both light and dark SVGs */}
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-200/80 p-2.5 transition-transform duration-200 group-hover:scale-110 dark:bg-neutral-800">
        <img
          src={icon.variants.default}
          alt={icon.title}
          className="h-full w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      <span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
        {icon.title}
      </span>

      {/* Copy button */}
      <div
        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-muted/80 opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
        onClick={handleCopy}
        role="button"
        tabIndex={-1}
        aria-label={`Copy ${icon.title} SVG`}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    </button>
  );
});
