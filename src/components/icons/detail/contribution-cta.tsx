"use client";

import { GitPullRequest, AlertCircle } from "lucide-react";

const REPO = "glincker/thesvg";

interface ContributionCtaProps {
  slug: string;
  title: string;
  hasMultipleVariants: boolean;
}

function buildIssueUrl(slug: string, title: string, type: "variant" | "icon"): string {
  const isVariant = type === "variant";
  const issueTitle = isVariant
    ? `[Icon Update] Add variant for ${title}`
    : `[Icon Request] ${title}`;
  const body = isVariant
    ? `## Variant Request

**Icon**: ${title} (\`${slug}\`)
**Page**: https://thesvg.org/icon/${slug}

### Which variant is missing?
<!-- e.g. mono, light, dark, wordmark -->

### SVG source
<!-- Paste SVG code or link to official brand assets -->`
    : `## Icon Request

**Brand name**: ${title}

### Brand website
<!-- Link to official website -->

### SVG source
<!-- Paste SVG code or link to official brand assets -->

### Category
<!-- e.g. AI, Software, Social, etc. -->`;

  const params = new URLSearchParams({
    title: issueTitle,
    body,
    labels: isVariant ? "icon-update" : "icon-request",
  });
  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}

function buildPrUrl(slug: string, title: string, type: "variant" | "icon"): string {
  const isVariant = type === "variant";
  const prTitle = isVariant
    ? `feat: add variant for ${slug}`
    : `feat: add ${slug} icon`;
  const body = isVariant
    ? `## Add variant for ${title}

**Icon**: [\`${slug}\`](https://thesvg.org/icon/${slug})

### Changes
- Added \`public/icons/${slug}/{variant}.svg\`
- Updated \`src/data/icons.json\` with new variant path

### Checklist
- [ ] SVG has \`viewBox\` attribute
- [ ] File is under 50KB
- [ ] No embedded scripts or raster images
- [ ] Official brand asset (not fan-made)`
    : `## Add ${title} icon

### Changes
- Added \`public/icons/${slug}/default.svg\`
- Added entry to \`src/data/icons.json\`

### Checklist
- [ ] SVG has \`viewBox\` attribute
- [ ] File is under 50KB
- [ ] No embedded scripts or raster images
- [ ] Official brand asset (not fan-made)
- [ ] Ran \`pnpm validate\``;

  const params = new URLSearchParams({
    title: prTitle,
    body,
    quick_pull: "1",
  });
  return `https://github.com/${REPO}/compare/main...main?${params.toString()}`;
}

export function ContributionCta({ slug, title, hasMultipleVariants }: ContributionCtaProps) {
  const type = hasMultipleVariants ? "variant" : "icon";
  const label = hasMultipleVariants ? "Missing a variant?" : "Have a better version?";
  const issueUrl = buildIssueUrl(slug, title, type);
  const prUrl = buildPrUrl(slug, title, type);

  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-4">
      <p className="mb-2.5 text-xs font-semibold text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <AlertCircle className="h-3 w-3" />
          Request via Issue
        </a>
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <GitPullRequest className="h-3 w-3" />
          Submit a PR
        </a>
      </div>
    </div>
  );
}
