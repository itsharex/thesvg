"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IconEntry } from "@/lib/icons";
import type { CopyFormat } from "@/lib/copy-formats";
import { formatSvg } from "@/lib/copy-formats";

interface IconDetailProps {
  icon: IconEntry | null;
  onClose: () => void;
}

const VARIANT_LABELS: Record<string, string> = {
  default: "Default",
  mono: "Mono",
  light: "Light",
  dark: "Dark",
  wordmark: "Wordmark",
  wordmarkLight: "WM Light",
  wordmarkDark: "WM Dark",
};

const FORMAT_OPTIONS: { value: CopyFormat; label: string }[] = [
  { value: "svg", label: "SVG" },
  { value: "jsx", label: "JSX" },
  { value: "vue", label: "Vue" },
  { value: "cdn", label: "CDN" },
  { value: "data-uri", label: "URI" },
];

export function IconDetail({ icon, onClose }: IconDetailProps) {
  const [activeVariant, setActiveVariant] = useState("default");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  const variants = icon
    ? Object.entries(icon.variants).filter(
        ([, v]) => v !== undefined && v !== ""
      )
    : [];

  useEffect(() => {
    if (!icon) return;
    const variantPath =
      icon.variants[activeVariant as keyof typeof icon.variants] ||
      icon.variants.default;
    if (!variantPath) return;

    fetch(variantPath)
      .then((r) => r.text())
      .then(setSvgContent)
      .catch(() => setSvgContent(""));
  }, [icon, activeVariant]);

  useEffect(() => {
    setActiveVariant("default");
  }, [icon?.slug]);

  const handleCopy = useCallback(
    async (format: CopyFormat) => {
      if (!icon || !svgContent) return;
      const variantKey =
        activeVariant === "default" ? "default" : activeVariant;
      const text = formatSvg(svgContent, format, icon.slug, variantKey);
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 1500);
    },
    [icon, svgContent, activeVariant]
  );

  if (!icon) return null;

  const currentPath =
    icon.variants[activeVariant as keyof typeof icon.variants] ||
    icon.variants.default;

  return (
    <Dialog open={!!icon} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl border-border/50 p-0 shadow-2xl">
        <DialogTitle className="sr-only">{icon.title}</DialogTitle>

        {/* Preview area */}
        <div className="relative flex items-center justify-center bg-muted/30 p-10">
          <img
            src={currentPath}
            alt={icon.title}
            className="h-20 w-20 object-contain"
          />

          {/* Brand color dot */}
          {icon.hex && icon.hex !== "000000" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-background/80 px-2 py-1 backdrop-blur-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: `#${icon.hex}` }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                #{icon.hex}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          {/* Title */}
          <div>
            <h2 className="text-lg font-semibold">{icon.title}</h2>
            <p className="font-mono text-xs text-muted-foreground">
              {icon.slug}
            </p>
          </div>

          {/* Categories */}
          {icon.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {icon.categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="rounded-md text-[10px]"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Variant tabs */}
          {variants.length > 1 && (
            <Tabs value={activeVariant} onValueChange={setActiveVariant}>
              <TabsList className="h-8 w-full justify-start gap-1 bg-muted/50">
                {variants.map(([key]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="h-6 rounded-md px-2 text-[10px]"
                  >
                    {VARIANT_LABELS[key] || key}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Copy buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.value}
                type="button"
                className="flex h-8 items-center justify-center gap-1 rounded-lg border border-border bg-card text-[11px] font-medium transition-colors hover:bg-accent"
                onClick={() => handleCopy(fmt.value)}
              >
                {copiedFormat === fmt.value ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Links */}
          {(icon.url || icon.guidelines) && (
            <div className="flex gap-3 border-t border-border pt-3 text-xs">
              {icon.url && (
                <a
                  href={icon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  Website
                </a>
              )}
              {icon.guidelines && (
                <a
                  href={icon.guidelines}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  Guidelines
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
