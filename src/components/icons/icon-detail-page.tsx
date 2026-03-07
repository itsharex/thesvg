"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { IconEntry } from "@/lib/icons";
import type { CopyFormat } from "@/lib/copy-formats";
import { formatSvg } from "@/lib/copy-formats";

interface IconDetailPageProps {
  icon: IconEntry;
}

const VARIANT_LABELS: Record<string, string> = {
  default: "Default",
  mono: "Mono",
  light: "Light",
  dark: "Dark",
  wordmark: "Wordmark",
  wordmarkLight: "Wordmark Light",
  wordmarkDark: "Wordmark Dark",
};

const FORMAT_OPTIONS: { value: CopyFormat; label: string }[] = [
  { value: "svg", label: "Raw SVG" },
  { value: "jsx", label: "JSX" },
  { value: "vue", label: "Vue" },
  { value: "cdn", label: "CDN URL" },
  { value: "data-uri", label: "Data URI" },
];

export function IconDetailPage({ icon }: IconDetailPageProps) {
  const [activeVariant, setActiveVariant] = useState("default");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState("");

  const variants = Object.entries(icon.variants).filter(
    ([, v]) => v !== undefined && v !== ""
  );

  useEffect(() => {
    const variantPath =
      icon.variants[activeVariant as keyof typeof icon.variants] ||
      icon.variants.default;
    if (!variantPath) return;

    fetch(variantPath)
      .then((r) => r.text())
      .then(setSvgContent)
      .catch(() => setSvgContent(""));
  }, [icon, activeVariant]);

  const handleCopy = useCallback(
    async (format: CopyFormat) => {
      if (!svgContent) return;
      const text = formatSvg(svgContent, format, icon.slug, activeVariant);
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 1500);
    },
    [svgContent, icon.slug, activeVariant]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all icons
      </Link>

      {/* Preview */}
      <div className="mb-8 flex items-center justify-center rounded-2xl border border-border bg-[repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-16">
        <img
          src={
            icon.variants[activeVariant as keyof typeof icon.variants] ||
            icon.variants.default
          }
          alt={icon.title}
          className="h-32 w-32 object-contain"
        />
      </div>

      {/* Info */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{icon.title}</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {icon.slug}
            </p>
          </div>
          {icon.hex && icon.hex !== "000000" && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <div
                className="h-6 w-6 rounded-md"
                style={{ backgroundColor: `#${icon.hex}` }}
              />
              <span className="font-mono text-sm">#{icon.hex}</span>
            </div>
          )}
        </div>

        {/* Categories */}
        {icon.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {icon.categories.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>
        )}

        {/* Aliases */}
        {icon.aliases.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              Also known as
            </h3>
            <p className="text-sm">{icon.aliases.join(", ")}</p>
          </div>
        )}

        {/* Variants */}
        {variants.length > 1 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Variants
            </h3>
            <Tabs value={activeVariant} onValueChange={setActiveVariant}>
              <TabsList>
                {variants.map(([key]) => (
                  <TabsTrigger key={key} value={key}>
                    {VARIANT_LABELS[key] || key}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Copy */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Copy as
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {FORMAT_OPTIONS.map((fmt) => (
              <Button
                key={fmt.value}
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => handleCopy(fmt.value)}
              >
                {copiedFormat === fmt.value ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                {fmt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* SVG Preview */}
        {svgContent && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              SVG Code
            </h3>
            <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-muted/50 p-4 text-xs">
              <code>{svgContent}</code>
            </pre>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-4 border-t border-border pt-4">
          {icon.url && (
            <a
              href={icon.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Website
            </a>
          )}
          {icon.guidelines && (
            <a
              href={icon.guidelines}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Brand Guidelines
            </a>
          )}
          <span className="text-sm text-muted-foreground">
            License: {icon.license}
          </span>
        </div>
      </div>
    </div>
  );
}
