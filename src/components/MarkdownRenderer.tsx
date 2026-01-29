/**
 * MarkdownRenderer - Heavy markdown rendering component
 *
 * This module is lazy-loaded to keep the initial bundle small.
 * It contains react-markdown + remark-gfm + rehype-highlight + rehype-sanitize
 * (~336 kB unminified) which is only needed once messages are displayed.
 */

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { ReactNode, isValidElement, memo, useMemo } from "react";
import { cn } from "../lib/utils";
import { ImageRenderer } from "./ImageRenderer";
import { CodeBlock } from "./CodeBlock";

// Import highlight.js theme for syntax highlighting (GitHub Dark theme)
import "highlight.js/styles/github-dark.css";

// PERF: Memoize plugins to prevent re-creation on every render
const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeSanitize, rehypeHighlight];

// Type definitions for ReactMarkdown components
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

interface LinkProps {
  href?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

interface ImageProps {
  src?: string;
  alt?: string;
  [key: string]: unknown;
}

interface TableProps {
  children?: ReactNode;
  [key: string]: unknown;
}

/**
 * Recursively extracts plain text from React children.
 * Handles strings, numbers, arrays, and React elements (e.g., syntax-highlighted spans).
 */
function extractTextFromChildren(children: ReactNode): string {
  if (children == null) return "";
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (isValidElement(children)) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}

interface MarkdownRendererProps {
  content: string;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  copiedCode,
  onCopyCode,
}: MarkdownRendererProps) {
  // PERF: Memoize components object to prevent re-creation
  const components = useMemo(
    () =>
      ({
        code({ inline, className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || "");
          const code = extractTextFromChildren(children).replace(/\n$/, "");

          if (!inline && match) {
            return (
              <CodeBlock
                code={code}
                language={match[1]}
                className={cn(className, "text-sm")}
                copiedCode={copiedCode}
                onCopyCode={onCopyCode}
              >
                {children}
              </CodeBlock>
            );
          }

          // Inline code without language - check if it looks like a code block
          if (!inline && code.includes("\n")) {
            return (
              <CodeBlock
                code={code}
                language="text"
                className="text-sm"
                copiedCode={copiedCode}
                onCopyCode={onCopyCode}
              >
                {children}
              </CodeBlock>
            );
          }

          // Inline code - styled to be distinct from links
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-muted/70 text-[0.9em] font-mono font-medium before:content-none after:content-none border border-border/50"
              {...props}
            >
              {children}
            </code>
          );
        },
        a({ href, children, ...props }: LinkProps) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        img({ src, alt }: ImageProps) {
          if (!src) return null;
          return (
            <ImageRenderer src={src} alt={alt || "Image"} className="my-2" />
          );
        },
        table({ children, ...props }: TableProps) {
          return (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
              <table className="w-full" {...props}>
                {children}
              </table>
            </div>
          );
        },
      }) as Partial<Components>,
    [copiedCode, onCopyCode],
  );

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
      )}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";
