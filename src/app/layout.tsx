import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "thesvg - The Open SVG Brand Library",
  description:
    "4,600+ brand SVGs in one place. Search, preview, copy. No gatekeeping - every brand deserves a place.",
  keywords: [
    "svg",
    "brand icons",
    "logo",
    "svg library",
    "open source",
    "brand assets",
  ],
  openGraph: {
    title: "thesvg - The Open SVG Brand Library",
    description:
      "4,600+ brand SVGs in one place. Search, preview, copy. No gatekeeping.",
    url: "https://thesvg.org",
    siteName: "thesvg",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "thesvg - The Open SVG Brand Library",
    description:
      "4,600+ brand SVGs in one place. Search, preview, copy. No gatekeeping.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="thesvg-theme"
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
