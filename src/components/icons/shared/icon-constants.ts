import type { CopyFormat } from "@/lib/copy-formats";

export const VARIANT_LABELS: Record<string, string> = {
  default: "Default",
  mono: "Mono",
  light: "Light",
  dark: "Dark",
  wordmark: "Wordmark",
  wordmarkLight: "WM Light",
  wordmarkDark: "WM Dark",
};

export const FORMAT_BUTTONS: {
  value: CopyFormat;
  label: string;
}[] = [
  { value: "svg", label: "SVG" },
  { value: "jsx", label: "JSX" },
  { value: "vue", label: "Vue" },
  { value: "cdn", label: "CDN" },
  { value: "data-uri", label: "URI" },
];

export const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

export function variantToFilename(variant: string): string {
  return variant.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function getJsDelivrUrl(slug: string, variant: string): string {
  const filename = variantToFilename(variant);
  return `${CDN_BASE}/${slug}/${filename}.svg`;
}
