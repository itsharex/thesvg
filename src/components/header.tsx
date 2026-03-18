"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Github, Menu, Moon, Plus, Search, Shapes, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useSearchStore } from "@/lib/stores/search-store";
import { getAllIcons, type IconEntry } from "@/lib/icons";
import { searchIcons } from "@/lib/search";
import { cn } from "@/lib/utils";

/** Inline AWS logo - text inherits currentColor, arrow stays orange */
function AwsLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" className={className}>
      <path d="M6.763 11.212c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.39-.384-.59-.894-.59-1.533 0-.678.24-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.4 2.4 0 01-.28.104.488.488 0 01-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 01.224-.167 4.577 4.577 0 011.005-.36 4.84 4.84 0 011.246-.151c.95 0 1.644.216 2.091.647.44.43.662 1.085.662 1.963v2.586h.016zm-3.24 1.214c.263 0 .534-.048.822-.144a1.78 1.78 0 00.758-.51 1.27 1.27 0 00.272-.512c.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 00-.735-.136 6.02 6.02 0 00-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 6.726a1.398 1.398 0 01-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 01.32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 01.311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 01-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 01-.303.08h-.687c-.15 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32L12.32 7.747l-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08l-.686.001zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 01-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.32.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 00.415-.758.777.777 0 00-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 01-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .36.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 01.24.2.43.43 0 01.071.263v.375c0 .168-.064.256-.184.256a.83.83 0 01-.303-.096 3.652 3.652 0 00-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.16.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926a2.157 2.157 0 01-.583.703c-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z" />
      <path d="M.378 15.475c3.384 1.963 7.56 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.44-.2.814.287.383.607-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351zm23.531-.2c.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151l.175-.439c.343-.88.802-2.198.52-2.555-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399z" fill="#F90" />
    </svg>
  );
}

function SubmitButton() {
  return (
    <Link href="/submit" className="group/submit relative">
      <span className="relative inline-flex h-7 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-3 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 hover:from-orange-400 hover:to-orange-500 hover:shadow-[0_2px_8px_rgba(249,115,22,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-[0.97] active:shadow-[0_0px_1px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)]">
        <Plus className="h-3 w-3" />
        <span className="hidden sm:inline">Submit</span>
      </span>
    </Link>
  );
}

const ICONS_CACHE: { current: IconEntry[] | null } = { current: null };
function getCachedIcons(): IconEntry[] {
  if (!ICONS_CACHE.current) {
    ICONS_CACHE.current = getAllIcons();
  }
  return ICONS_CACHE.current;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const activeCollection = searchParams.get("collection") || null;

  const isHome = pathname === "/";

  useEffect(() => {
    setIsMac(navigator.userAgent.includes("Mac"));
  }, []);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const icons = getCachedIcons();
    return searchIcons(icons, query).slice(0, 6);
  }, [query]);

  const showDropdown = focused && query.trim().length >= 2 && suggestions.length > 0;

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIdx(-1);
  }, [suggestions]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setFocused(false);
        if (isHome) setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isHome, setQuery]);

  const navigateToIcon = useCallback(
    (slug: string) => {
      setFocused(false);
      inputRef.current?.blur();
      router.push(`/icon/${slug}`);
    },
    [router]
  );

  function handleSearchChange(value: string) {
    setQuery(value);
    if (!isHome) {
      router.push(`/?q=${encodeURIComponent(value)}`);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (showDropdown && selectedIdx >= 0 && selectedIdx < suggestions.length) {
      navigateToIcon(suggestions[selectedIdx].slug);
      return;
    }
    setFocused(false);
    if (!isHome && query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    }
  }

  function handleKeyNav(e: React.KeyboardEvent) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full px-2 pt-2 pb-0 sm:px-3 sm:pt-2.5">
      <div className="mx-auto max-w-[1800px] rounded-2xl border border-black/[0.06] bg-background/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-black/60 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="flex h-12 items-center gap-3 px-2.5 sm:px-4">
          {/* Left: menu + logo */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <Link href="/" className="group/logo flex items-center gap-1.5">
              <img
                src="/logo-transparent.svg"
                alt="theSVG"
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg transition-transform duration-200 group-hover/logo:scale-105"
              />
              <span className="hidden text-[15px] font-bold tracking-tight text-foreground sm:inline">
                the<span className="text-orange-500">SVG</span>
              </span>
            </Link>
          </div>

          {/* Collection switcher */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Icon collections">
            <Link
              href="/"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                !activeCollection
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={!activeCollection ? "page" : undefined}
            >
              <Shapes className="h-3 w-3" />
              Brands
            </Link>
            <Link
              href="/?collection=aws"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                activeCollection === "aws"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={activeCollection === "aws" ? "page" : undefined}
            >
              <AwsLogo className="h-4 w-4" />
              AWS
            </Link>
            <span
              className="inline-flex cursor-default items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground/30"
              title="Coming soon"
              aria-disabled="true"
            >
              GCP
            </span>
            <span
              className="inline-flex cursor-default items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground/30"
              title="Coming soon"
              aria-disabled="true"
            >
              Azure
            </span>
          </nav>

          {/* Center: search with dropdown */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyNav}
                placeholder="Search icons..."
                className="h-9 w-full rounded-xl border border-border/40 bg-muted/30 pr-16 pl-9 text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-border/60 focus:bg-background focus:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] focus:ring-1 focus:ring-ring/20 dark:border-white/[0.06] dark:bg-white/[0.03] dark:focus:border-white/[0.1] dark:focus:bg-white/[0.05] dark:focus:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]"
                aria-label="Search icons"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls="header-search-listbox"
                aria-autocomplete="list"
              />
              <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setFocused(false); }}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <kbd className="hidden rounded border border-border/40 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50 sm:inline-block dark:border-white/[0.06]">
                  {isMac ? "\u2318K" : "^K"}
                </kbd>
              </div>
            </div>

            {/* Search dropdown - positioned relative to form for full-width on mobile */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                id="header-search-listbox"
                className="absolute top-full right-0 left-0 z-50 mx-auto mt-1.5 max-w-xl overflow-hidden rounded-xl border border-border/40 bg-background/95 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.1] dark:bg-[rgba(10,10,10,0.95)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.6)]"
                role="listbox"
              >
                <div className="px-2 py-1.5">
                  <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                    Suggestions
                  </p>
                  {suggestions.map((icon, i) => (
                    <button
                      key={icon.slug}
                      type="button"
                      role="option"
                      aria-selected={i === selectedIdx}
                      onMouseEnter={() => setSelectedIdx(i)}
                      onClick={() => navigateToIcon(icon.slug)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors sm:gap-3 ${
                        i === selectedIdx
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <img
                        src={icon.variants.default}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{icon.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {icon.categories[0] || icon.slug}
                        </p>
                      </div>
                      <span className="hidden shrink-0 text-[10px] text-muted-foreground/50 sm:inline">
                        {icon.slug}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="hidden border-t border-border/30 px-3 py-1.5 sm:block dark:border-white/[0.04]">
                  <p className="text-[10px] text-muted-foreground/50">
                    <kbd className="rounded border border-border/30 px-1 font-mono dark:border-white/[0.06]">&uarr;&darr;</kbd>{" "}
                    navigate{" "}
                    <kbd className="rounded border border-border/30 px-1 font-mono dark:border-white/[0.06]">&crarr;</kbd>{" "}
                    select{" "}
                    <kbd className="rounded border border-border/30 px-1 font-mono dark:border-white/[0.06]">esc</kbd>{" "}
                    close
                  </p>
                </div>
              </div>
            )}
          </form>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/extensions"
              className="hidden items-center rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
            >
              Extensions
            </Link>

            <SubmitButton />

            <div className="ml-0.5 flex items-center">
              <a
                href="https://www.npmjs.com/package/thesvg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="npm"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
              >
                <img
                  src="/icons/npm/default.svg"
                  alt="npm"
                  width={15}
                  height={15}
                  className="h-[15px] w-[15px]"
                />
              </a>
              <a
                href="https://github.com/GLINCKER/thesvg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-3.5 w-3.5 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-3.5 w-3.5 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
