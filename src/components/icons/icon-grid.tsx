"use client";

import { useCallback, useMemo, useState } from "react";
import type { IconEntry } from "@/lib/icons";
import { IconCard } from "./icon-card";
import { IconDetail } from "./icon-detail";

interface IconGridProps {
  icons: IconEntry[];
}

const INITIAL_COUNT = 120;
const LOAD_MORE_COUNT = 120;

export function IconGrid({ icons }: IconGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [selectedIcon, setSelectedIcon] = useState<IconEntry | null>(null);

  const visibleIcons = useMemo(
    () => icons.slice(0, visibleCount),
    [icons, visibleCount]
  );

  const hasMore = visibleCount < icons.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, icons.length));
  }, [icons.length]);

  const handleSelect = useCallback((icon: IconEntry) => {
    setSelectedIcon(icon);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIcon(null);
  }, []);

  if (icons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">No icons found</p>
        <p className="text-sm">Try a different search term or category</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {visibleIcons.map((icon) => (
          <IconCard key={icon.slug} icon={icon} onSelect={handleSelect} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Load more ({icons.length - visibleCount} remaining)
          </button>
        </div>
      )}

      <IconDetail icon={selectedIcon} onClose={handleClose} />
    </>
  );
}
