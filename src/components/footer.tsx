import { Github, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-foreground">
            thesvg
          </Link>
          <span>The Open SVG Brand Library</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/submit"
            className="hover:text-foreground"
          >
            Submit an icon
          </Link>
          <a
            href="https://github.com/glincker/thesvg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
