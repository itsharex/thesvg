export type CopyFormat = "svg" | "jsx" | "vue" | "cdn" | "data-uri";

function svgToJsx(svg: string): string {
  return svg
    .replace(/class=/g, "className=")
    .replace(/clip-path=/g, "clipPath=")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/fill-opacity=/g, "fillOpacity=")
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=")
    .replace(/stop-color=/g, "stopColor=")
    .replace(/stop-opacity=/g, "stopOpacity=")
    .replace(/gradient-units=/g, "gradientUnits=")
    .replace(/gradient-transform=/g, "gradientTransform=")
    .replace(/xmlns="[^"]*"\s?/g, "");
}

function svgToVue(svg: string): string {
  // Vue templates use kebab-case (same as SVG), just wrap in template
  return `<template>\n  ${svg}\n</template>`;
}

function getCdnUrl(slug: string, variant: string): string {
  return `https://thesvg.org/icons/${slug}/${variant}.svg`;
}

function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
}

export function formatSvg(
  svgContent: string,
  format: CopyFormat,
  slug: string,
  variant: string
): string {
  switch (format) {
    case "svg":
      return svgContent;
    case "jsx":
      return svgToJsx(svgContent);
    case "vue":
      return svgToVue(svgContent);
    case "cdn":
      return getCdnUrl(slug, variant);
    case "data-uri":
      return svgToDataUri(svgContent);
    default:
      return svgContent;
  }
}
