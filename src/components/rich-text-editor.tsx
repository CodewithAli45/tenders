"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, List, ListOrdered, Quote,
  Undo2, Redo2, Eraser, Pilcrow, Table2, Heading2, Rows3, Columns3,
  TableCellsMerge, TableCellsSplit, Trash2, Minus,
} from "lucide-react";

const COLORS = [
  { label: "Default", value: null },
  { label: "Primary", value: "#b86b35" },
  { label: "Accent", value: "#2e7d52" },
  { label: "Danger", value: "#c54a4a" },
  { label: "Warning", value: "#c48719" },
  { label: "Muted", value: "#687078" },
];

const toolButtonClass = "h-7 w-7 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";
const toolActiveClass = "bg-primary/15 text-primary";

function ToolbarButton({ active, disabled, onClick, title, children }: { active?: boolean; disabled?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`${toolButtonClass} ${active ? toolActiveClass : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

function ColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = (editor.getAttributes("textStyle").color as string | undefined) ?? "";

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const applyColor = (value: string | null) => {
    if (value) editor.chain().focus().setColor(value).run();
    else editor.chain().focus().unsetColor().run();
    setOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        title="Text colour"
        aria-label="Text colour"
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative h-7 w-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${current || open ? toolActiveClass : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}
      >
        <Pilcrow className="h-3.5 w-3.5" />
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-3.5 rounded-full" style={{ backgroundColor: current || "currentColor" }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-1 flex gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
          {COLORS.map((color) => (
            <button
              key={color.label}
              type="button"
              title={color.label}
              aria-label={color.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyColor(color.value)}
              className={`h-5 w-5 rounded-md border transition-transform hover:scale-110 cursor-pointer ${current === color.value ? "ring-2 ring-primary ring-offset-1 ring-offset-popover" : "border-border"} ${color.value ? "" : "text-[9px] font-bold text-muted-foreground flex items-center justify-center"}`}
              style={color.value ? { backgroundColor: color.value } : undefined}
            >
              {!color.value && "/"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TableControls({ editor }: { editor: Editor }) {
  const inTable = editor.isActive("table");
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <ToolbarButton title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Table2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      {inTable && (
        <>
          <ToolbarButton title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}><Minus className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton title="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}><Trash2 className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton title="Merge cells" onClick={() => editor.chain().focus().mergeCells().run()}><TableCellsMerge className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton title="Split cell" onClick={() => editor.chain().focus().splitCell().run()}><TableCellsSplit className="h-3.5 w-3.5" /></ToolbarButton>
        </>
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40">
      <ToolbarButton title="Heading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>
      <Divider />
      <ColorPicker editor={editor} />
      <TableControls editor={editor} />
      <Divider />
      <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

interface RichTextEditorProps {
  name: string;
  value?: unknown;
  onChange: (name: string, html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({ name, value, onChange, placeholder, minHeight = 140 }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [3] } }),
      Underline,
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: typeof value === "string" && value ? value : "",
    onUpdate: ({ editor: instance }) => onChange(name, instance.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const next = typeof value === "string" ? value : "";
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="rounded-xl border border-border bg-black/2 dark:bg-white/2 animate-pulse" style={{ height: minHeight + 44 }} />;
  }

  return (
    <div className="relative rounded-xl border border-border bg-black/2 dark:bg-white/2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <Toolbar editor={editor} />
      <div className="rich-text-surface px-3 py-2.5 text-sm focus:outline-none">
        <EditorContent editor={editor} style={{ minHeight }} />
      </div>
    </div>
  );
}
