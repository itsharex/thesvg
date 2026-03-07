import { notFound } from "next/navigation";
import { getAllIcons, getIconBySlug } from "@/lib/icons";
import { IconDetailPage } from "@/components/icons/icon-detail-page";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const icons = getAllIcons();
  return icons.map((icon) => ({ slug: icon.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const icon = getIconBySlug(slug);
  if (!icon) return {};

  return {
    title: `${icon.title} SVG - thesvg`,
    description: `Download ${icon.title} SVG icon. Available in ${Object.values(icon.variants).filter(Boolean).length} variants. Free, open-source.`,
    openGraph: {
      title: `${icon.title} SVG - thesvg`,
      description: `Download ${icon.title} SVG icon for free.`,
      url: `https://thesvg.org/icon/${slug}`,
    },
  };
}

export default async function IconPage({ params }: PageProps) {
  const { slug } = await params;
  const icon = getIconBySlug(slug);
  if (!icon) notFound();

  return <IconDetailPage icon={icon} />;
}
