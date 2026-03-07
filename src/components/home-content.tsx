"use client";

import { useMemo, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { IconEntry } from "@/lib/icons";
import { searchIcons } from "@/lib/search";
import { SearchBar } from "@/components/search/search-bar";
import { CategoryPills } from "@/components/filters/category-pills";
import { IconGrid } from "@/components/icons/icon-grid";

interface HomeContentProps {
  icons: IconEntry[];
  categories: string[];
  count: number;
}

export function HomeContent({ icons, categories, count }: HomeContentProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = icons;

    if (selectedCategory) {
      result = result.filter((icon) =>
        icon.categories.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    if (query.trim()) {
      result = searchIcons(result, query);
    }

    return result;
  }, [icons, query, selectedCategory]);

  const handleCategorySelect = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          {count.toLocaleString()} icons and counting
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          The Open SVG
          <br />
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Brand Library
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-lg text-base text-muted-foreground sm:text-lg">
          Search, preview, and copy brand SVGs. Free, open-source, and
          community-driven. No gatekeeping.
        </p>

        <div className="mx-auto max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            totalCount={count}
            filteredCount={filtered.length}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryPills
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Results bar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length === count
            ? `${count.toLocaleString()} icons`
            : `${filtered.length.toLocaleString()} of ${count.toLocaleString()} icons`}
        </p>
        <Link
          href="/submit"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Submit an icon
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Grid */}
      <IconGrid icons={filtered} />
    </div>
  );
}
