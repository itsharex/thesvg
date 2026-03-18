/**
 * Import AWS Architecture Icons into thesvg icons.json.
 *
 * Reads from the official AWS icon package directory and:
 *   1. Parses Architecture Service, Resource, Category, and Group icons
 *   2. Generates slugs (aws-{name}) and maps categories
 *   3. Copies SVGs to public/icons/{slug}/
 *   4. Merges into icons.json with collection: "aws"
 *
 * Usage: npx tsx scripts/import-aws-icons.ts [path-to-aws-icons]
 *
 * Default path: ../../aws-icons (sibling to thesvg in monorepo)
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
  variants: Record<string, string>;
  license: string;
  url?: string;
  dateAdded: string;
  collection: string;
  collectionVersion: string;
  collectionMeta?: {
    type?: string;
    parent?: string;
  };
}

// ── Config ─────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..");
const ICONS_JSON = path.join(ROOT, "src/data/icons.json");
const PUBLIC_ICONS = path.join(ROOT, "public/icons");
const TODAY = new Date().toISOString().slice(0, 10);

const AWS_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(ROOT, "../../aws-icons");

// AWS category hex colors (from their SVG backgrounds)
const CATEGORY_COLORS: Record<string, string> = {
  "Analytics": "8C4FFF",
  "Application-Integration": "E7157B",
  "Artificial-Intelligence": "01A88D",
  "Blockchain": "D45B07",
  "Business-Applications": "C7131F",
  "Cloud-Financial-Management": "8C4FFF",
  "Compute": "ED7100",
  "Containers": "ED7100",
  "Customer-Enablement": "E7157B",
  "Databases": "527FFF",
  "Developer-Tools": "C7131F",
  "End-User-Computing": "01A88D",
  "Front-End-Web-Mobile": "C7131F",
  "Games": "8C4FFF",
  "General-Icons": "232F3E",
  "Internet-of-Things": "01A88D",
  "Management-Tools": "E7157B",
  "Media-Services": "ED7100",
  "Migration-Modernization": "01A88D",
  "Networking-Content-Delivery": "8C4FFF",
  "Quantum-Technologies": "ED7100",
  "Satellite": "527FFF",
  "Security-Identity": "DD344C",
  "Storage": "3F8624",
};

// Friendly category names
const CATEGORY_MAP: Record<string, string> = {
  "Analytics": "Analytics",
  "Application-Integration": "Integration",
  "Artificial-Intelligence": "AI",
  "Blockchain": "Blockchain",
  "Business-Applications": "Business",
  "Cloud-Financial-Management": "Cost Management",
  "Compute": "Compute",
  "Containers": "Containers",
  "Customer-Enablement": "Customer Enablement",
  "Databases": "Database",
  "Developer-Tools": "Developer Tools",
  "End-User-Computing": "End User Computing",
  "Front-End-Web-Mobile": "Frontend",
  "Games": "Gaming",
  "General-Icons": "General",
  "Internet-of-Things": "IoT",
  "Management-Tools": "Management",
  "Media-Services": "Media",
  "Migration-Modernization": "Migration",
  "Networking-Content-Delivery": "Networking",
  "Quantum-Technologies": "Quantum",
  "Satellite": "Satellite",
  "Security-Identity": "Security",
  "Storage": "Storage",
};

// ── Helpers ─────────────────────────────────────────────────────────────

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function copyFile(src: string, dest: string): void {
  fs.copyFileSync(src, dest);
}

function detectVersion(awsPath: string): string {
  // Extract version from directory names like Architecture-Service-Icons_01302026
  const entries = fs.readdirSync(awsPath);
  for (const entry of entries) {
    const match = entry.match(/_(\d{8})$/);
    if (match) {
      const dateStr = match[1]; // e.g., 01302026 = MMDDYYYY
      const month = dateStr.slice(0, 2);
      const year = dateStr.slice(4, 8);
      // Map month to quarter
      const monthNum = parseInt(month, 10);
      const quarter = monthNum <= 3 ? "Q1" : monthNum <= 6 ? "Q2" : monthNum <= 9 ? "Q3" : "Q4";
      return `${year}-${quarter}`;
    }
  }
  return `${new Date().getFullYear()}-Q1`;
}

function extractServiceName(filename: string): string {
  // Arch_AWS-Lambda_48.svg -> AWS-Lambda
  // Arch_Amazon-EC2_48.svg -> Amazon-EC2
  const match = filename.match(/^Arch_(.+?)_\d+\.svg$/);
  return match ? match[1] : filename.replace(/\.svg$/, "");
}

function extractResourceInfo(filename: string): { service: string; resource: string } | null {
  // Res_Amazon-EC2_Instance_48.svg -> { service: "Amazon-EC2", resource: "Instance" }
  // Res_AWS-Lambda_Lambda-Function_48.svg -> { service: "AWS-Lambda", resource: "Lambda-Function" }
  const match = filename.match(/^Res_(.+?)_(.+?)_48\.svg$/);
  if (!match) return null;
  return { service: match[1], resource: match[2] };
}

function extractCategoryName(filename: string): string {
  // Arch-Category_Compute_48.svg -> Compute
  const match = filename.match(/^Arch-Category_(.+?)_\d+\.svg$/);
  return match ? match[1] : filename.replace(/\.svg$/, "");
}

function friendlyName(rawName: string): string {
  // AWS-Lambda -> AWS Lambda
  // Amazon-EC2 -> Amazon EC2
  // Amazon-Simple-Storage-Service -> Amazon Simple Storage Service
  return rawName.replace(/-/g, " ");
}

// ── Import Functions ────────────────────────────────────────────────────

function importServiceIcons(awsPath: string, version: string): IconEntry[] {
  const iconMap = new Map<string, IconEntry>();
  const serviceDir = fs.readdirSync(awsPath).find((d) => d.startsWith("Architecture-Service-Icons"));
  if (!serviceDir) {
    console.log("  No Architecture-Service-Icons directory found");
    return [];
  }

  const basePath = path.join(awsPath, serviceDir);
  const categories = fs.readdirSync(basePath).filter((d) =>
    d.startsWith("Arch_") && fs.statSync(path.join(basePath, d)).isDirectory()
  );

  for (const catDir of categories) {
    const rawCategory = catDir.replace("Arch_", "");
    const category = CATEGORY_MAP[rawCategory] || friendlyName(rawCategory);
    const hex = CATEGORY_COLORS[rawCategory] || "232F3E";

    // Find unique service names from 48px directory (our default)
    const sizePath48 = path.join(basePath, catDir, "48");
    if (!fs.existsSync(sizePath48)) continue;

    const svgFiles = fs.readdirSync(sizePath48).filter((f) => f.endsWith(".svg"));

    for (const svgFile of svgFiles) {
      const serviceName = extractServiceName(svgFile);
      const slug = `aws-${slugify(serviceName)}`;

      // If slug already exists, merge categories instead of duplicating
      const existing = iconMap.get(slug);
      if (existing) {
        if (!existing.categories.includes(category)) {
          existing.categories.push(category);
        }
        continue;
      }

      const iconDir = path.join(PUBLIC_ICONS, slug);
      ensureDir(iconDir);

      const variants: Record<string, string> = {};

      // Copy 48px as default
      copyFile(path.join(sizePath48, svgFile), path.join(iconDir, "default.svg"));
      variants["default"] = `/icons/${slug}/default.svg`;

      // Copy other sizes
      for (const size of ["16", "32", "64"]) {
        const sizeFile = svgFile.replace("_48.svg", `_${size}.svg`);
        const sizePath = path.join(basePath, catDir, size, sizeFile);
        if (fs.existsSync(sizePath)) {
          copyFile(sizePath, path.join(iconDir, `${size}.svg`));
          variants[size] = `/icons/${slug}/${size}.svg`;
        }
      }

      iconMap.set(slug, {
        slug,
        title: friendlyName(serviceName),
        aliases: [],
        hex,
        categories: [category],
        variants,
        license: "CC-BY-ND-2.0",
        url: `https://aws.amazon.com/${slugify(serviceName.replace(/^(AWS|Amazon)-?/, ""))}/`,
        dateAdded: TODAY,
        collection: "aws",
        collectionVersion: version,
        collectionMeta: { type: "service" },
      });
    }
  }

  return [...iconMap.values()];
}

function importResourceIcons(awsPath: string, version: string, serviceMap: Map<string, string>): IconEntry[] {
  const icons: IconEntry[] = [];
  const resDir = fs.readdirSync(awsPath).find((d) => d.startsWith("Resource-Icons"));
  if (!resDir) {
    console.log("  No Resource-Icons directory found");
    return icons;
  }

  const basePath = path.join(awsPath, resDir);
  const categories = fs.readdirSync(basePath).filter((d) =>
    d.startsWith("Res_") && fs.statSync(path.join(basePath, d)).isDirectory()
  );

  for (const catDir of categories) {
    const rawCategory = catDir.replace("Res_", "");
    const category = CATEGORY_MAP[rawCategory] || friendlyName(rawCategory);
    const hex = CATEGORY_COLORS[rawCategory] || "232F3E";

    const svgFiles = fs.readdirSync(path.join(basePath, catDir)).filter((f) => f.endsWith(".svg"));

    for (const svgFile of svgFiles) {
      const info = extractResourceInfo(svgFile);
      if (!info) continue;

      const slug = `aws-res-${slugify(info.service)}-${slugify(info.resource)}`;
      const iconDir = path.join(PUBLIC_ICONS, slug);
      ensureDir(iconDir);

      copyFile(path.join(basePath, catDir, svgFile), path.join(iconDir, "default.svg"));

      const parentSlug = `aws-${slugify(info.service)}`;

      icons.push({
        slug,
        title: `${friendlyName(info.service)} ${friendlyName(info.resource)}`,
        aliases: [friendlyName(info.resource)],
        hex,
        categories: [category],
        variants: {
          default: `/icons/${slug}/default.svg`,
        },
        license: "CC-BY-ND-2.0",
        dateAdded: TODAY,
        collection: "aws",
        collectionVersion: version,
        collectionMeta: {
          type: "resource",
          parent: serviceMap.has(parentSlug) ? parentSlug : undefined,
        },
      });
    }
  }

  return icons;
}

function importCategoryIcons(awsPath: string, version: string): IconEntry[] {
  const icons: IconEntry[] = [];
  const catIconDir = fs.readdirSync(awsPath).find((d) => d.startsWith("Category-Icons"));
  if (!catIconDir) {
    console.log("  No Category-Icons directory found");
    return icons;
  }

  const basePath = path.join(awsPath, catIconDir);
  const sizePath48 = path.join(basePath, "Arch-Category_48");
  if (!fs.existsSync(sizePath48)) return icons;

  const svgFiles = fs.readdirSync(sizePath48).filter((f) => f.endsWith(".svg"));

  for (const svgFile of svgFiles) {
    const catName = extractCategoryName(svgFile);
    const slug = `aws-cat-${slugify(catName)}`;
    const hex = CATEGORY_COLORS[catName] || "232F3E";
    const category = CATEGORY_MAP[catName] || friendlyName(catName);
    const iconDir = path.join(PUBLIC_ICONS, slug);
    ensureDir(iconDir);

    const variants: Record<string, string> = {};

    // Copy 48px as default
    copyFile(path.join(sizePath48, svgFile), path.join(iconDir, "default.svg"));
    variants["default"] = `/icons/${slug}/default.svg`;

    // Copy other sizes
    for (const size of ["16", "32", "64"]) {
      const sizeFile = svgFile.replace("_48.svg", `_${size}.svg`);
      const sizeDirPath = path.join(basePath, `Arch-Category_${size}`, sizeFile);
      if (fs.existsSync(sizeDirPath)) {
        copyFile(sizeDirPath, path.join(iconDir, `${size}.svg`));
        variants[size] = `/icons/${slug}/${size}.svg`;
      }
    }

    icons.push({
      slug,
      title: `AWS ${friendlyName(catName)}`,
      aliases: [category],
      hex,
      categories: [category],
      variants,
      license: "CC-BY-ND-2.0",
      dateAdded: TODAY,
      collection: "aws",
      collectionVersion: version,
      collectionMeta: { type: "category" },
    });
  }

  return icons;
}

function importGroupIcons(awsPath: string, version: string): IconEntry[] {
  const icons: IconEntry[] = [];
  const groupDir = fs.readdirSync(awsPath).find((d) => d.startsWith("Architecture-Group-Icons"));
  if (!groupDir) {
    console.log("  No Architecture-Group-Icons directory found");
    return icons;
  }

  const basePath = path.join(awsPath, groupDir);
  const svgFiles = fs.readdirSync(basePath).filter((f) => f.endsWith(".svg") && !f.includes("_Dark"));

  for (const svgFile of svgFiles) {
    const rawName = svgFile.replace(/_32\.svg$/, "");
    const slug = `aws-group-${slugify(rawName)}`;
    const iconDir = path.join(PUBLIC_ICONS, slug);
    ensureDir(iconDir);

    const variants: Record<string, string> = {};

    // Copy default
    copyFile(path.join(basePath, svgFile), path.join(iconDir, "default.svg"));
    variants["default"] = `/icons/${slug}/default.svg`;

    // Check for dark variant
    const darkFile = svgFile.replace("_32.svg", "_32_Dark.svg");
    if (fs.existsSync(path.join(basePath, darkFile))) {
      copyFile(path.join(basePath, darkFile), path.join(iconDir, "dark.svg"));
      variants["dark"] = `/icons/${slug}/dark.svg`;
    }

    icons.push({
      slug,
      title: friendlyName(rawName),
      aliases: [],
      hex: "232F3E",
      categories: ["Architecture"],
      variants,
      license: "CC-BY-ND-2.0",
      dateAdded: TODAY,
      collection: "aws",
      collectionVersion: version,
      collectionMeta: { type: "group" },
    });
  }

  return icons;
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(AWS_PATH)) {
    console.error(`AWS icons directory not found: ${AWS_PATH}`);
    console.error("Usage: npx tsx scripts/import-aws-icons.ts [path-to-aws-icons]");
    process.exit(1);
  }

  console.log(`AWS icons source: ${AWS_PATH}`);
  const version = detectVersion(AWS_PATH);
  console.log(`Detected version: ${version}`);

  // Import each icon type
  console.log("\nImporting service icons...");
  const serviceIcons = importServiceIcons(AWS_PATH, version);
  console.log(`  ${serviceIcons.length} service icons`);

  // Build service slug map for resource parent linking
  const serviceMap = new Map<string, string>();
  for (const icon of serviceIcons) {
    serviceMap.set(icon.slug, icon.title);
  }

  console.log("Importing resource icons...");
  const resourceIcons = importResourceIcons(AWS_PATH, version, serviceMap);
  console.log(`  ${resourceIcons.length} resource icons`);

  console.log("Importing category icons...");
  const categoryIcons = importCategoryIcons(AWS_PATH, version);
  console.log(`  ${categoryIcons.length} category icons`);

  console.log("Importing group icons...");
  const groupIcons = importGroupIcons(AWS_PATH, version);
  console.log(`  ${groupIcons.length} group icons`);

  const allAwsIcons = [...serviceIcons, ...resourceIcons, ...categoryIcons, ...groupIcons];
  console.log(`\nTotal AWS icons: ${allAwsIcons.length}`);

  // Check for slug collisions
  const slugSet = new Set<string>();
  let collisions = 0;
  for (const icon of allAwsIcons) {
    if (slugSet.has(icon.slug)) {
      console.log(`  COLLISION: ${icon.slug} (${icon.title})`);
      collisions++;
    }
    slugSet.add(icon.slug);
  }
  if (collisions > 0) {
    console.log(`  ${collisions} slug collisions found!`);
  }

  // Load existing icons.json and merge
  console.log("\nLoading existing icons.json...");
  const existing: IconEntry[] = JSON.parse(fs.readFileSync(ICONS_JSON, "utf-8"));
  const nonAws = existing.filter((i) => i.collection !== "aws");
  console.log(`  Existing non-AWS icons: ${nonAws.length}`);
  console.log(`  Removing old AWS icons: ${existing.length - nonAws.length}`);

  // Merge and sort
  const merged = [...nonAws, ...allAwsIcons];
  merged.sort((a, b) => a.slug.localeCompare(b.slug));

  console.log(`  Final total: ${merged.length} icons`);

  fs.writeFileSync(ICONS_JSON, JSON.stringify(merged, null, 2) + "\n");
  console.log("\nWrote updated icons.json");

  // Summary
  console.log("\n── Summary ──");
  console.log(`  Brand icons:    ${nonAws.length}`);
  console.log(`  AWS service:    ${serviceIcons.length}`);
  console.log(`  AWS resource:   ${resourceIcons.length}`);
  console.log(`  AWS category:   ${categoryIcons.length}`);
  console.log(`  AWS group:      ${groupIcons.length}`);
  console.log(`  AWS total:      ${allAwsIcons.length}`);
  console.log(`  Grand total:    ${merged.length}`);
  console.log(`  Version:        ${version}`);
}

main();
