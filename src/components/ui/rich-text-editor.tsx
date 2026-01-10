"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Highlight } from "@tiptap/extension-highlight";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Highlighter,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const highlightColors = [
  { name: "Yellow", color: "#fef08a" },
  { name: "Green", color: "#bbf7d0" },
  { name: "Blue", color: "#bfdbfe" },
  { name: "Pink", color: "#fbcfe8" },
  { name: "Orange", color: "#fed7aa" },
];

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Add a note about this partner...",
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2",
      },
    },
  });

  // Update content when it changes externally (e.g., form reset)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`rounded-md border border-[var(--border)] bg-[var(--background)] ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-2 py-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[var(--muted)] transition-colors ${
            editor.isActive("bold")
              ? "bg-[var(--muted)] text-slate-900"
              : "text-[var(--muted-foreground)]"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[var(--muted)] transition-colors ${
            editor.isActive("italic")
              ? "bg-[var(--muted)] text-slate-900"
              : "text-[var(--muted-foreground)]"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[var(--muted)] transition-colors ${
            editor.isActive("bulletList")
              ? "bg-[var(--muted)] text-slate-900"
              : "text-[var(--muted-foreground)]"
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[var(--muted)] transition-colors ${
            editor.isActive("orderedList")
              ? "bg-[var(--muted)] text-slate-900"
              : "text-[var(--muted-foreground)]"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Highlight Colors */}
        <div className="relative group">
          <button
            type="button"
            className={`p-1.5 rounded hover:bg-[var(--muted)] transition-colors flex items-center gap-1 ${
              editor.isActive("highlight")
                ? "bg-[var(--muted)] text-slate-900"
                : "text-[var(--muted-foreground)]"
            }`}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </button>
          <div className="absolute top-full left-0 mt-1 p-1.5 bg-white border border-[var(--border)] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex gap-1">
            {highlightColors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: color.color })
                    .run()
                }
                className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.color }}
                title={color.name}
              />
            ))}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="w-5 h-5 rounded border border-gray-200 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center text-xs text-gray-500"
              title="Remove Highlight"
            >
              x
            </button>
          </div>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)] disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)] disabled:opacity-30"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:min-h-[100px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--muted-foreground)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  );
}

// Component to render rich text content (for displaying notes)
interface RichTextContentProps {
  content: string;
  className?: string;
}

export function RichTextContent({
  content,
  className = "",
}: RichTextContentProps) {
  // Check if content is HTML or plain text
  const isHtml = content.startsWith("<") && content.includes(">");

  if (!isHtml) {
    // Plain text - render as paragraph
    return (
      <p className={`text-[var(--muted-foreground)] ${className}`}>{content}</p>
    );
  }

  // HTML content - render safely
  return (
    <div
      className={`prose prose-sm max-w-none text-[var(--muted-foreground)] [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:text-[var(--foreground)] ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
