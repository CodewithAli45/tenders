"use client";

import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

interface RichContentProps {
  html?: unknown;
  emptyLabel?: string;
  className?: string;
}

const isRichHtml = (value: string) => /<\/?(p|ul|ol|li|strong|em|u|s|h[1-6]|table|blockquote|span)\b[^>]*>/i.test(value);

export function RichContent({ html, emptyLabel = "Not specified.", className = "" }: RichContentProps) {
  const raw = typeof html === "string" ? html : "";
  const content = useMemo(() => (raw ? DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } }) : ""), [raw]);

  if (!content || content === "<p></p>") {
    return <p className="text-sm italic text-muted-foreground">{emptyLabel}</p>;
  }

  if (!isRichHtml(raw)) {
    return <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${className}`}>{raw}</p>;
  }

  return <div className={`rich-text-surface text-sm ${className}`} dangerouslySetInnerHTML={{ __html: content }} />;
}
