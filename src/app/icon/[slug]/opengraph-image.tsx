import { ImageResponse } from "next/og";
import { getAllIcons, getIconBySlug } from "@/lib/icons";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export function generateStaticParams() {
  return getAllIcons().map((icon) => ({ slug: icon.slug }));
}

const CDN_BASE = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const icon = getIconBySlug(slug);

  if (!icon) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#0a0a0a",
            color: "#fafafa",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Icon not found
        </div>
      ),
      size
    );
  }

  const variantCount = Object.values(icon.variants).filter(Boolean).length;
  const iconUrl = `${CDN_BASE}/${slug}/default.svg`;
  const brandColor = icon.hex && icon.hex !== "000000" ? `#${icon.hex}` : "#3b82f6";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          padding: 60,
          position: "relative",
        }}
      >
        {/* Subtle gradient glow from brand color */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at 30% 50%, ${brandColor}15 0%, transparent 60%)`,
          }}
        />

        {/* Left side: icon info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: 20,
            zIndex: 1,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.1,
            }}
          >
            {icon.title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <span>SVG Icon</span>
            <span style={{ color: "#52525b" }}>|</span>
            <span>{variantCount} variant{variantCount !== 1 ? "s" : ""}</span>
            {icon.categories[0] && (
              <>
                <span style={{ color: "#52525b" }}>|</span>
                <span>{icon.categories[0]}</span>
              </>
            )}
          </div>

          {/* Brand color swatch */}
          {icon.hex && icon.hex !== "000000" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: brandColor,
                }}
              />
              <span style={{ fontSize: 18, color: "#71717a", fontFamily: "monospace" }}>
                #{icon.hex}
              </span>
            </div>
          )}

          {/* thesvg branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 20,
              fontSize: 20,
              color: "#52525b",
            }}
          >
            thesvg.org
          </div>
        </div>

        {/* Right side: icon preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 360,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 280,
              height: 280,
              borderRadius: 32,
              background: "#18181b",
              border: "1px solid #27272a",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconUrl}
              alt={icon.title}
              width={180}
              height={180}
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
