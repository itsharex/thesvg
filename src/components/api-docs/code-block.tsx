import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  children: string;
  label?: string;
  language?: string;
}

export async function CodeBlock({ children, label, language = "text" }: CodeBlockProps) {
  // Map friendly names to shiki language IDs
  const langMap: Record<string, string> = {
    bash: "bash",
    shell: "bash",
    typescript: "typescript",
    ts: "typescript",
    javascript: "javascript",
    js: "javascript",
    tsx: "tsx",
    jsx: "jsx",
    json: "json",
    html: "html",
    xml: "xml",
    url: "text",
    text: "text",
  };

  const shikiLang = langMap[language] || "text";

  let html: string;
  try {
    html = await codeToHtml(children.trim(), {
      lang: shikiLang,
      theme: "github-dark-default",
    });
  } catch {
    // Fallback to plain text
    html = `<pre><code>${children.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/40 dark:border-white/[0.08]">
      {(label || language) && (
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d1117] px-4 py-2">
          <div className="flex items-center gap-2">
            {language && language !== "text" && (
              <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] font-medium text-blue-300">
                {language}
              </span>
            )}
            {label && (
              <span className="text-[11px] font-medium text-zinc-400">{label}</span>
            )}
          </div>
          <CopyButton text={children} />
        </div>
      )}
      <div
        className="[&_pre]:!m-0 [&_pre]:overflow-x-auto [&_pre]:!rounded-none [&_pre]:px-4 [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {!label && !language && (
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={children} />
        </div>
      )}
    </div>
  );
}
