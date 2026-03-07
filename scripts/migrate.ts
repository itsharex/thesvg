/**
 * Migration script: merges simple-icons, svgl, and lobe-icons into unified format.
 *
 * Usage: npx tsx scripts/migrate.ts
 *
 * Inputs (sibling repos in askverdict monorepo):
 *   - simple-icons/data/simple-icons.json + icons/*.svg
 *   - svgl/src/data/svgs.ts + static/library/*.svg
 *   - lobe-icons/src/toc.ts + src/{Id}/components/*.tsx
 *
 * Outputs:
 *   - src/data/icons.json
 *   - public/icons/{slug}/*.svg
 */

import * as fs from "fs";
import * as path from "path";

// ── Types ──────────────────────────────────────────────────────────────

interface IconEntry {
  slug: string;
  title: string;
  aliases: string[];
  hex: string;
  categories: string[];
  variants: {
    default: string;
    light?: string;
    dark?: string;
    mono?: string;
    wordmark?: string;
    wordmarkLight?: string;
    wordmarkDark?: string;
  };
  license: string;
  url?: string;
  guidelines?: string;
}

// ── Config ─────────────────────────────────────────────────────────────

const ASKVERDICT_ROOT = path.resolve(__dirname, "../../askverdict-app/askverdict");
const SIMPLE_ICONS_DIR = path.join(ASKVERDICT_ROOT, "simple-icons");
const SVGL_DIR = path.join(ASKVERDICT_ROOT, "svgl");
const LOBE_ICONS_DIR = path.join(ASKVERDICT_ROOT, "lobe-icons");

const OUT_DIR = path.resolve(__dirname, "..");
const ICONS_OUT = path.join(OUT_DIR, "public/icons");
const DATA_OUT = path.join(OUT_DIR, "src/data/icons.json");

// ── Helpers ────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\./g, "dot")
    .replace(/&/g, "and")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copySvg(src: string, destDir: string, filename: string): boolean {
  if (!fs.existsSync(src)) return false;
  ensureDir(destDir);
  fs.copyFileSync(src, path.join(destDir, filename));
  return true;
}

/**
 * Create a colorized version of a mono SVG by injecting fill color.
 * simple-icons SVGs have no fill attribute, so they render as black.
 * We add fill="#{hex}" to the <svg> element to colorize them.
 */
function createColorizedSvg(src: string, destDir: string, filename: string, hex: string): boolean {
  if (!fs.existsSync(src)) return false;
  ensureDir(destDir);
  let svg = fs.readFileSync(src, "utf-8");
  // Add fill attribute to the <svg> tag
  if (!svg.includes('fill="') || svg.includes('fill="currentColor"')) {
    svg = svg.replace('<svg ', `<svg fill="#${hex}" `);
    svg = svg.replace('fill="currentColor"', `fill="#${hex}"`);
  }
  fs.writeFileSync(path.join(destDir, filename), svg);
  return true;
}

// ── Parse simple-icons ─────────────────────────────────────────────────

function parseSimpleIcons(icons: Map<string, IconEntry>): void {
  const dataPath = path.join(SIMPLE_ICONS_DIR, "data/simple-icons.json");
  if (!fs.existsSync(dataPath)) {
    console.warn("[simple-icons] data file not found, skipping");
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as Array<{
    title: string;
    hex: string;
    source: string;
    guidelines?: string;
    license?: { type: string };
    aliases?: {
      aka?: string[];
      old?: string[];
      loc?: Record<string, string>;
    };
  }>;

  let copied = 0;
  for (const entry of data) {
    const slug = slugify(entry.title);
    const svgPath = path.join(SIMPLE_ICONS_DIR, "icons", `${slug}.svg`);

    // Try exact slug match, then scan for similar filenames
    let svgFile = svgPath;
    if (!fs.existsSync(svgFile)) {
      // simple-icons uses its own slug algorithm, try finding the file
      const altSlug = entry.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/^dot/, "dot");
      svgFile = path.join(SIMPLE_ICONS_DIR, "icons", `${altSlug}.svg`);
    }

    const destDir = path.join(ICONS_OUT, slug);
    const hasSvg = copySvg(svgFile, destDir, "mono.svg");
    // Create a colorized default variant using the brand hex color
    const hasColorized = createColorizedSvg(svgFile, destDir, "default.svg", entry.hex);

    const aliases: string[] = [];
    if (entry.aliases?.aka) aliases.push(...entry.aliases.aka);
    if (entry.aliases?.old) aliases.push(...entry.aliases.old);
    if (entry.aliases?.loc) aliases.push(...Object.values(entry.aliases.loc));

    const existing = icons.get(slug);
    if (existing) {
      // Merge: add mono variant, update hex/aliases
      if (hasSvg) existing.variants.mono = `/icons/${slug}/mono.svg`;
      if (!existing.hex || existing.hex === "000000") existing.hex = entry.hex;
      existing.aliases = [...new Set([...existing.aliases, ...aliases])];
      if (entry.guidelines && !existing.guidelines) existing.guidelines = entry.guidelines;
      existing.license = "CC0-1.0";
    } else {
      const icon: IconEntry = {
        slug,
        title: entry.title,
        aliases,
        hex: entry.hex,
        categories: [],
        variants: {
          default: hasColorized ? `/icons/${slug}/default.svg` : (hasSvg ? `/icons/${slug}/mono.svg` : ""),
          mono: hasSvg ? `/icons/${slug}/mono.svg` : undefined,
        },
        license: entry.license?.type || "CC0-1.0",
        url: entry.source,
        guidelines: entry.guidelines,
      };
      if (icon.variants.default) {
        icons.set(slug, icon);
        copied++;
      }
    }
  }

  console.log(`[simple-icons] Processed ${data.length} entries, ${copied} new icons`);
}

// ── Parse svgl ─────────────────────────────────────────────────────────

function parseSvgl(icons: Map<string, IconEntry>): void {
  const dataPath = path.join(SVGL_DIR, "src/data/svgs.ts");
  if (!fs.existsSync(dataPath)) {
    console.warn("[svgl] data file not found, skipping");
    return;
  }

  // Parse the TypeScript file as text (extract the array)
  let raw = fs.readFileSync(dataPath, "utf-8");

  // Remove the import and export, extract just the array
  raw = raw.replace(/import.*?;\n/g, "");
  raw = raw.replace(/export const svgs:\s*iSVG\[\]\s*=\s*/, "");
  // Remove trailing semicolons
  raw = raw.replace(/;\s*$/, "");

  // Convert TS object syntax to JSON-parseable format
  // Handle unquoted keys
  raw = raw.replace(/(\s)(\w+)(\s*:)/g, '$1"$2"$3');
  // Handle single quotes to double quotes
  raw = raw.replace(/'/g, '"');
  // Handle trailing commas
  raw = raw.replace(/,(\s*[}\]])/g, "$1");

  let data: Array<{
    title: string;
    category: string | string[];
    route: string | { light: string; dark: string };
    wordmark?: string | { light: string; dark: string };
    url: string;
    brandUrl?: string;
  }>;

  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("[svgl] Failed to parse svgs.ts, trying line-by-line extraction");
    data = parseSvglManual(dataPath);
  }

  let copied = 0;
  const svglStatic = path.join(SVGL_DIR, "static");

  for (const entry of data) {
    const slug = slugify(entry.title);
    const destDir = path.join(ICONS_OUT, slug);
    const categories = Array.isArray(entry.category) ? entry.category : [entry.category];

    // Copy SVG files based on route type
    let hasDefault = false;

    if (typeof entry.route === "string") {
      // Single variant
      const src = path.join(svglStatic, entry.route.replace(/^\//, ""));
      hasDefault = copySvg(src, destDir, "default.svg");
    } else if (entry.route && typeof entry.route === "object") {
      // Light/dark variants
      const lightSrc = path.join(svglStatic, entry.route.light.replace(/^\//, ""));
      const darkSrc = path.join(svglStatic, entry.route.dark.replace(/^\//, ""));
      copySvg(lightSrc, destDir, "light.svg");
      copySvg(darkSrc, destDir, "dark.svg");
      // Use dark as default (we're dark-theme-first)
      hasDefault = copySvg(darkSrc, destDir, "default.svg");
      if (!hasDefault) hasDefault = copySvg(lightSrc, destDir, "default.svg");
    }

    // Copy wordmark variants
    if (entry.wordmark) {
      if (typeof entry.wordmark === "string") {
        const src = path.join(svglStatic, entry.wordmark.replace(/^\//, ""));
        copySvg(src, destDir, "wordmark.svg");
      } else {
        const lightSrc = path.join(svglStatic, entry.wordmark.light.replace(/^\//, ""));
        const darkSrc = path.join(svglStatic, entry.wordmark.dark.replace(/^\//, ""));
        copySvg(lightSrc, destDir, "wordmark-light.svg");
        copySvg(darkSrc, destDir, "wordmark-dark.svg");
        copySvg(darkSrc, destDir, "wordmark.svg");
      }
    }

    const existing = icons.get(slug);
    if (existing) {
      // Merge: add color variants, categories
      if (hasDefault && !existing.variants.default.includes("default")) {
        existing.variants.default = `/icons/${slug}/default.svg`;
      }
      if (fs.existsSync(path.join(destDir, "light.svg")))
        existing.variants.light = `/icons/${slug}/light.svg`;
      if (fs.existsSync(path.join(destDir, "dark.svg")))
        existing.variants.dark = `/icons/${slug}/dark.svg`;
      if (fs.existsSync(path.join(destDir, "wordmark.svg")))
        existing.variants.wordmark = `/icons/${slug}/wordmark.svg`;
      if (fs.existsSync(path.join(destDir, "wordmark-light.svg")))
        existing.variants.wordmarkLight = `/icons/${slug}/wordmark-light.svg`;
      if (fs.existsSync(path.join(destDir, "wordmark-dark.svg")))
        existing.variants.wordmarkDark = `/icons/${slug}/wordmark-dark.svg`;

      existing.categories = [...new Set([...existing.categories, ...categories])];
      if (entry.url) existing.url = entry.url;
      if (entry.brandUrl) existing.guidelines = entry.brandUrl;
    } else if (hasDefault) {
      const variants: IconEntry["variants"] = {
        default: `/icons/${slug}/default.svg`,
      };
      if (fs.existsSync(path.join(destDir, "light.svg")))
        variants.light = `/icons/${slug}/light.svg`;
      if (fs.existsSync(path.join(destDir, "dark.svg")))
        variants.dark = `/icons/${slug}/dark.svg`;
      if (fs.existsSync(path.join(destDir, "wordmark.svg")))
        variants.wordmark = `/icons/${slug}/wordmark.svg`;
      if (fs.existsSync(path.join(destDir, "wordmark-light.svg")))
        variants.wordmarkLight = `/icons/${slug}/wordmark-light.svg`;
      if (fs.existsSync(path.join(destDir, "wordmark-dark.svg")))
        variants.wordmarkDark = `/icons/${slug}/wordmark-dark.svg`;

      icons.set(slug, {
        slug,
        title: entry.title,
        aliases: [],
        hex: "000000",
        categories,
        variants,
        license: "MIT",
        url: entry.url,
        guidelines: entry.brandUrl,
      });
      copied++;
    }
  }

  console.log(`[svgl] Processed ${data.length} entries, ${copied} new icons`);
}

/**
 * Manual parser for svgl svgs.ts when JSON.parse fails.
 * Extracts entries using regex-based parsing.
 */
function parseSvglManual(filePath: string): Array<{
  title: string;
  category: string | string[];
  route: string | { light: string; dark: string };
  wordmark?: string | { light: string; dark: string };
  url: string;
  brandUrl?: string;
}> {
  const content = fs.readFileSync(filePath, "utf-8");
  const results: Array<{
    title: string;
    category: string | string[];
    route: string | { light: string; dark: string };
    wordmark?: string | { light: string; dark: string };
    url: string;
    brandUrl?: string;
  }> = [];

  // Split by top-level object boundaries
  const objectPattern = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match;

  // Find the array start
  const arrayStart = content.indexOf("[");
  const arrayContent = content.slice(arrayStart);

  // Match each object in the array
  while ((match = objectPattern.exec(arrayContent)) !== null) {
    const block = match[1];

    // Extract title
    const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
    if (!titleMatch) continue;

    // Extract URL
    const urlMatch = block.match(/url:\s*["']([^"']+)["']/);

    // Extract brandUrl
    const brandUrlMatch = block.match(/brandUrl:\s*\n?\s*["']([^"']+)["']/);

    // Extract category
    let category: string | string[];
    const catArrayMatch = block.match(/category:\s*\[([^\]]+)\]/);
    if (catArrayMatch) {
      category = catArrayMatch[1]
        .split(",")
        .map((s) => s.trim().replace(/["']/g, ""))
        .filter(Boolean);
    } else {
      const catSingle = block.match(/category:\s*["']([^"']+)["']/);
      category = catSingle ? catSingle[1] : "Other";
    }

    // Extract route
    let route: string | { light: string; dark: string };
    const routeObjMatch = block.match(
      /route:\s*\{[^}]*light:\s*["']([^"']+)["'][^}]*dark:\s*["']([^"']+)["'][^}]*\}/
    );
    if (routeObjMatch) {
      route = { light: routeObjMatch[1], dark: routeObjMatch[2] };
    } else {
      const routeStrMatch = block.match(/route:\s*["']([^"']+)["']/);
      route = routeStrMatch ? routeStrMatch[1] : "";
    }

    // Extract wordmark
    let wordmark: string | { light: string; dark: string } | undefined;
    const wmObjMatch = block.match(
      /wordmark:\s*\{[^}]*light:\s*["']([^"']+)["'][^}]*dark:\s*["']([^"']+)["'][^}]*\}/
    );
    if (wmObjMatch) {
      wordmark = { light: wmObjMatch[1], dark: wmObjMatch[2] };
    } else {
      const wmStrMatch = block.match(/wordmark:\s*["']([^"']+)["']/);
      if (wmStrMatch) wordmark = wmStrMatch[1];
    }

    if (titleMatch[1] && (typeof route === "string" ? route : route.light)) {
      results.push({
        title: titleMatch[1],
        category,
        route,
        wordmark,
        url: urlMatch ? urlMatch[1] : "",
        brandUrl: brandUrlMatch ? brandUrlMatch[1] : undefined,
      });
    }
  }

  return results;
}

// ── Parse lobe-icons ───────────────────────────────────────────────────

function parseLobeIcons(icons: Map<string, IconEntry>): void {
  const tocPath = path.join(LOBE_ICONS_DIR, "src/toc.ts");
  if (!fs.existsSync(tocPath)) {
    console.warn("[lobe-icons] toc.ts not found, skipping");
    return;
  }

  // Parse toc.ts - it's valid JSON inside the array brackets
  let raw = fs.readFileSync(tocPath, "utf-8");
  // Find "= [" pattern which starts the actual array
  const markerMatch = raw.match(/=\s*\[/);
  if (!markerMatch || markerMatch.index === undefined) {
    console.error("[lobe-icons] Could not find array in toc.ts");
    return;
  }
  const arrayStart = raw.indexOf("[", markerMatch.index);
  const arrayEnd = raw.lastIndexOf("]");
  raw = raw.slice(arrayStart, arrayEnd + 1);
  // Remove any trailing commas before ] or }
  raw = raw.replace(/,\s*([}\]])/g, "$1");

  let toc: Array<{
    id: string;
    title: string;
    fullTitle: string;
    color: string;
    colorGradient?: string;
    group: string;
    desc: string;
    param: {
      hasColor: boolean;
      hasBrand: boolean;
    };
  }>;

  try {
    toc = JSON.parse(raw);
  } catch (e) {
    console.error("[lobe-icons] Failed to parse toc.ts:", (e as Error).message);
    return;
  }

  let copied = 0;
  const groupToCategory: Record<string, string> = {
    model: "AI",
    provider: "AI",
    application: "Software",
  };

  for (const entry of toc) {
    const slug = slugify(entry.fullTitle || entry.title);
    const destDir = path.join(ICONS_OUT, slug);
    const componentDir = path.join(LOBE_ICONS_DIR, "src", entry.id, "components");

    if (!fs.existsSync(componentDir)) continue;

    // Extract SVG from Color.tsx or Mono.tsx
    let hasSvg = false;

    // Try Color.tsx first
    const colorTsx = path.join(componentDir, "Color.tsx");
    if (fs.existsSync(colorTsx)) {
      const svg = extractSvgFromTsx(colorTsx, entry.fullTitle || entry.title);
      if (svg) {
        ensureDir(destDir);
        fs.writeFileSync(path.join(destDir, "color.svg"), svg);
        hasSvg = true;
      }
    }

    // Try Mono.tsx
    const monoTsx = path.join(componentDir, "Mono.tsx");
    if (fs.existsSync(monoTsx)) {
      const svg = extractSvgFromTsx(monoTsx, entry.fullTitle || entry.title);
      if (svg) {
        ensureDir(destDir);
        fs.writeFileSync(path.join(destDir, "mono-lobe.svg"), svg);
        if (!hasSvg) hasSvg = true;
      }
    }

    if (!hasSvg) continue;

    const hex = entry.color.replace("#", "");
    const category = groupToCategory[entry.group] || "Software";

    const existing = icons.get(slug);
    if (existing) {
      // Merge: if we got a color variant and existing only has mono, upgrade default
      if (fs.existsSync(path.join(destDir, "color.svg"))) {
        if (existing.variants.default.includes("mono")) {
          existing.variants.default = `/icons/${slug}/color.svg`;
        }
      }
      if (!existing.hex || existing.hex === "000000") existing.hex = hex;
      if (!existing.categories.length) existing.categories.push(category);
    } else {
      const defaultFile = fs.existsSync(path.join(destDir, "color.svg"))
        ? "color.svg"
        : "mono-lobe.svg";
      icons.set(slug, {
        slug,
        title: entry.fullTitle || entry.title,
        aliases: [],
        hex,
        categories: [category],
        variants: {
          default: `/icons/${slug}/${defaultFile}`,
        },
        license: "MIT",
        url: entry.desc.startsWith("http") ? entry.desc : undefined,
      });
      copied++;
    }
  }

  console.log(`[lobe-icons] Processed ${toc.length} entries, ${copied} new icons`);
}

/**
 * Extract SVG markup from a lobe-icons TSX component file.
 */
function extractSvgFromTsx(filePath: string, title: string): string | null {
  const content = fs.readFileSync(filePath, "utf-8");

  // Check for external path imports (like paths.ts)
  const pathsImport = content.match(/import\s*\{?\s*PATHS\s*\}?\s*from\s*['"]\.\/paths['"]/);
  let pathsData: Record<string, string> = {};

  if (pathsImport) {
    const pathsFile = path.join(path.dirname(filePath), "paths.ts");
    if (fs.existsSync(pathsFile)) {
      const pathsContent = fs.readFileSync(pathsFile, "utf-8");
      const pathMatches = pathsContent.matchAll(/(\w+):\s*['"]([^'"]+)['"]/g);
      for (const m of pathMatches) {
        pathsData[m[1]] = m[2];
      }
    }
  }

  // Extract all <path> elements
  const pathElements: string[] = [];
  const pathPattern = /<path\s+([^>]*?)\/?\s*>/g;
  let match;

  while ((match = pathPattern.exec(content)) !== null) {
    let attrs = match[1];

    // Replace PATHS.xxx references with actual values
    attrs = attrs.replace(/\{PATHS\.(\w+)\}/g, (_, key) => {
      return `"${pathsData[key] || ""}"`;
    });

    // Clean up JSX-specific attribute syntax
    attrs = attrs.replace(/\{["']([^"']+)["']\}/g, '"$1"');
    // Handle numeric JSX expressions
    attrs = attrs.replace(/\{(\d+(?:\.\d+)?)\}/g, '"$1"');
    // Convert camelCase to kebab-case for SVG attributes
    attrs = attrs.replace(/fillRule/g, "fill-rule");
    attrs = attrs.replace(/clipRule/g, "clip-rule");
    attrs = attrs.replace(/fillOpacity/g, "fill-opacity");
    attrs = attrs.replace(/strokeWidth/g, "stroke-width");
    attrs = attrs.replace(/strokeLinecap/g, "stroke-linecap");
    attrs = attrs.replace(/strokeLinejoin/g, "stroke-linejoin");
    attrs = attrs.replace(/clipPath/g, "clip-path");
    attrs = attrs.replace(/stopColor/g, "stop-color");
    attrs = attrs.replace(/stopOpacity/g, "stop-opacity");
    attrs = attrs.replace(/gradientUnits/g, "gradient-units");
    attrs = attrs.replace(/gradientTransform/g, "gradient-transform");

    // Remove currentColor references for standalone SVG
    // Keep fill values as-is

    pathElements.push(`  <path ${attrs.trim()} />`);
  }

  // Also extract <circle>, <rect>, <g>, <defs>, <linearGradient>, etc.
  const otherElements: string[] = [];
  const elementPatterns = [
    /<circle\s+([^>]*?)\/?\s*>/g,
    /<rect\s+([^>]*?)\/?\s*>/g,
    /<ellipse\s+([^>]*?)\/?\s*>/g,
    /<polygon\s+([^>]*?)\/?\s*>/g,
  ];

  for (const pattern of elementPatterns) {
    while ((match = pattern.exec(content)) !== null) {
      let attrs = match[1];
      attrs = attrs.replace(/\{["']([^"']+)["']\}/g, '"$1"');
      const tag = pattern.source.match(/<(\w+)/)?.[1] || "path";
      otherElements.push(`  <${tag} ${attrs.trim()} />`);
    }
  }

  if (pathElements.length === 0 && otherElements.length === 0) return null;

  // Check viewBox
  const viewBoxMatch = content.match(/viewBox=["']([^"']+)["']/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

  // Check for fill on svg element
  const svgFillMatch = content.match(/<svg[^>]*fill=["']([^"']+)["']/);
  const svgFill = svgFillMatch ? ` fill="${svgFillMatch[1]}"` : "";

  const svgFillRule = content.match(/<svg[^>]*fillRule=["']([^"']+)["']/);
  const fillRule = svgFillRule ? ` fill-rule="${svgFillRule[1]}"` : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${svgFill}${fillRule}>`,
    `  <title>${title}</title>`,
    ...pathElements,
    ...otherElements,
    "</svg>",
  ].join("\n");
}

// ── Main ───────────────────────────────────────────────────────────────

function main(): void {
  console.log("Starting migration...\n");

  const icons = new Map<string, IconEntry>();

  // Order matters: simple-icons first (most entries), then svgl (adds color), then lobe
  parseSimpleIcons(icons);
  parseSvgl(icons);
  parseLobeIcons(icons);

  // Clean up: remove entries with empty default variant
  for (const [slug, icon] of icons) {
    if (!icon.variants.default) {
      icons.delete(slug);
    }
  }

  // Sort by title
  const sorted = [...icons.values()].sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  // Write icons.json
  ensureDir(path.dirname(DATA_OUT));
  fs.writeFileSync(DATA_OUT, JSON.stringify(sorted, null, 2));

  // Stats
  const withCategories = sorted.filter((i) => i.categories.length > 0).length;
  const withMultipleVariants = sorted.filter(
    (i) => Object.keys(i.variants).filter((k) => i.variants[k as keyof typeof i.variants]).length > 1
  ).length;
  const categories = [...new Set(sorted.flatMap((i) => i.categories))].sort();

  console.log(`\n--- Migration Complete ---`);
  console.log(`Total icons: ${sorted.length}`);
  console.log(`With categories: ${withCategories}`);
  console.log(`With multiple variants: ${withMultipleVariants}`);
  console.log(`Categories (${categories.length}): ${categories.join(", ")}`);
}

main();
