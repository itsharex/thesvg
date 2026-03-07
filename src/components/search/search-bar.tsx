"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.includes("Mac"));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        onChange("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onChange]);

  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search 3,800+ brand icons..."
        className="h-12 w-full rounded-xl border border-border bg-card pr-24 pl-11 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-ring focus:shadow-lg focus:shadow-black/5 focus:ring-1 focus:ring-ring dark:focus:shadow-black/20"
        aria-label="Search icons"
      />
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <kbd className="hidden rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          {isMac ? "\u2318K" : "Ctrl+K"}
        </kbd>
      </div>
    </div>
  );
}
