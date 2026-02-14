'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  ChevronDown,
  Wand2,
  Sparkle,
  FileText,
  ListTree,
  Expand,
} from 'lucide-react';

interface TiptapEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  onEditorReady?: (editor: any) => void;
}

type AIAction = 'continue' | 'improve' | 'summarize' | 'outline' | 'expand';

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  className,
  onEditorReady,
}: TiptapEditorProps) {
  const [aiLoading, setAiLoading] = useState<AIAction | null>(null);
  const onEditorReadyRef = useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          'tiptap-content max-w-none focus:outline-none min-h-[200px]',
          className
        ),
      },
    },
  });

  // Expose editor instance to parent
  useEffect(() => {
    if (editor && onEditorReadyRef.current) {
      onEditorReadyRef.current(editor);
    }
  }, [editor]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleAIAction = useCallback(async (action: AIAction) => {
    if (!editor) return;

    // Get the current content as plain text
    const text = editor.getText();
    if (!text.trim()) {
      toast.error('No content to process');
      return;
    }

    setAiLoading(action);

    try {
      const response = await fetch('/api/ai/enhance-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, action }),
      });

      if (!response.ok) throw new Error('Failed to enhance writing');

      const data = await response.json();

      if (data.result) {
        if (action === 'continue') {
          // Append to existing content
          editor.chain().focus().insertContent(' ' + data.result).run();
          toast.success('Content continued');
        } else if (action === 'improve') {
          // Replace all content with improved version
          editor.chain().focus().clearContent().insertContent(data.result).run();
          toast.success('Content improved');
        } else {
          // For summarize, outline, expand - insert at end with separator
          editor
            .chain()
            .focus()
            .insertContent(`\n\n---\n\n**${action.charAt(0).toUpperCase() + action.slice(1)}:**\n\n${data.result}`)
            .run();
          toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} generated`);
        }
      }
    } catch (error) {
      toast.error('AI enhancement failed');
    } finally {
      setAiLoading(null);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {/* Editor toolbar */}
      {editable && (
        <div className="mb-2 flex flex-wrap gap-1 border-b pb-2">
          {/* Text formatting */}
          <Button
            size="sm"
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <span className="font-bold">B</span>
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <span className="italic">I</span>
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="h-8 w-8 p-0"
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('code') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleCode().run()}
            className="h-8 w-8 p-0"
            title="Inline code"
          >
            <span className="font-mono text-xs">{`</>`}</span>
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className="h-8 w-8 p-0"
            title="Highlight"
          >
            <span className="bg-yellow-300 px-1 text-black">H</span>
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('link') ? 'secondary' : 'ghost'}
            onClick={setLink}
            className="h-8 w-8 p-0"
            title="Link"
          >
            🔗
          </Button>

          <span className="mx-1 border-l" />

          {/* Headings */}
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>

          <span className="mx-1 border-l" />

          {/* Lists */}
          <Button
            size="sm"
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('taskList') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            ☑ Task
          </Button>

          <span className="mx-1 border-l" />

          {/* Blocks */}
          <Button
            size="sm"
            variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            Quote
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            Code
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            ─
          </Button>

          <span className="mx-1 border-l" />

          {/* History */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            Undo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            Redo
          </Button>

          <span className="mx-1 border-l" />

          {/* AI Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                disabled={aiLoading !== null}
                className="gap-1"
              >
                {aiLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 text-primary" />
                )}
                AI
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleAIAction('continue')}
                disabled={aiLoading !== null}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Continue Writing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAIAction('improve')}
                disabled={aiLoading !== null}
              >
                <Sparkle className="mr-2 h-4 w-4" />
                Improve Clarity
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAIAction('summarize')}
                disabled={aiLoading !== null}
              >
                <FileText className="mr-2 h-4 w-4" />
                Summarize
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAIAction('outline')}
                disabled={aiLoading !== null}
              >
                <ListTree className="mr-2 h-4 w-4" />
                Generate Outline
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAIAction('expand')}
                disabled={aiLoading !== null}
              >
                <Expand className="mr-2 h-4 w-4" />
                Expand Ideas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
