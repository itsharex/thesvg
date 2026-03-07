<p align="center">
  <h1 align="center">thesvg</h1>
  <p align="center">The Open SVG Brand Library</p>
</p>

<p align="center">
  <a href="https://thesvg.org">Website</a> -
  <a href="#api">API</a> -
  <a href="#submit-an-icon">Submit an Icon</a>
</p>

---

**3,800+ brand SVGs** in one place. Search, preview, copy. Free, open-source, community-driven.

No gatekeeping - every brand deserves a place.

## Features

- **3,800+ brand icons** with multiple variants (color, mono, light, dark, wordmark)
- **Instant search** with fuzzy matching (Cmd+K / Ctrl+K)
- **One-click copy** as SVG, JSX, Vue, CDN URL, or Data URI
- **REST API** for programmatic access
- **SSG detail pages** for every icon with SEO metadata
- **Dark/light theme** support
- **Gradient SVG support** - not just flat colors

## Quick Start

```bash
git clone https://github.com/glincker/thesvg.git
cd thesvg
pnpm install
pnpm dev
```

Open http://localhost:3000 to browse icons.

## API

All endpoints return JSON.

### Search icons

```
GET /api/icons?q=github&category=Devtool&limit=10&offset=0
```

Returns `{ total, offset, limit, icons: [...] }`

### Get single icon

```
GET /api/icons/github
```

Returns full icon entry with all variants and metadata.

### List categories

```
GET /api/categories
```

Returns `{ categories: [{ name, count }] }`

### CDN URLs

Every icon is available via direct URL:

```
https://thesvg.org/icons/{slug}/default.svg
https://thesvg.org/icons/{slug}/mono.svg
https://thesvg.org/icons/{slug}/light.svg
https://thesvg.org/icons/{slug}/dark.svg
```

## Icon Variants

| Variant | Description |
|---------|-------------|
| `default` | Primary variant (always present) |
| `mono` | Monochrome single-color |
| `light` | Optimized for light backgrounds |
| `dark` | Optimized for dark backgrounds |
| `wordmark` | Text logo variant |
| `wordmarkLight` | Wordmark for light backgrounds |
| `wordmarkDark` | Wordmark for dark backgrounds |

## Submit an Icon

Every brand deserves a place. No gatekeeping.

1. Fork this repo
2. Add SVG files to `public/icons/{slug}/` (at minimum `default.svg`)
3. Add an entry to `src/data/icons.json`
4. Run `pnpm build` to validate
5. Open a pull request

### SVG requirements

- Valid SVG/XML markup
- Under 10KB file size
- No embedded scripts or external references
- `viewBox` attribute present
- Gradients and multi-color SVGs welcome
- You have the right to redistribute the icon

## Tech Stack

- [Next.js 15](https://nextjs.org) - App Router with SSG
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Fuse.js](https://fusejs.io) - Client-side fuzzy search
- [Vercel](https://vercel.com) - Hosting

## License

MIT
