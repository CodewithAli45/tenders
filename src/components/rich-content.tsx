"use client";

import React, { useEffect, useMemo, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

interface RichContentProps {
  html?: unknown;
  emptyLabel?: string;
  className?: string;
}

const isRichHtml = (value: string) => /<\/?(p|ul|ol|li|strong|em|u|s|h[1-6]|table|blockquote|span)\b[^>]*>/i.test(value);

export function RichContent({ html, emptyLabel = "Not specified.", className = "" }: RichContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const raw = typeof html === "string" ? html : "";
  const content = useMemo(() => (raw ? DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } }) : ""), [raw]);
  const richHtml = isRichHtml(raw);

  useEffect(() => {
    if (!contentRef.current) return;
    renderMathInElement(contentRef.current, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }, [content, raw, richHtml]);

  if (!content || content === "<p></p>") {
    return <p className="text-sm italic text-muted-foreground">{emptyLabel}</p>;
  }

  if (!richHtml) {
    return <div ref={contentRef} className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${className}`}>{raw}</div>;
  }

  return <div ref={contentRef} className={`rich-text-surface text-sm ${className}`} dangerouslySetInnerHTML={{ __html: content }} />;
}
