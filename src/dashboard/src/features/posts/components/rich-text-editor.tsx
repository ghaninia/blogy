'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  Link as LinkIcon,
  Heading2,
} from 'lucide-react';
import { Skeleton } from '@gh/ui';
import { cn } from '@/shared/lib/utils';

const lowlight = createLowlight(common);

export interface RichTextEditorHandle {
  insertImage: (url: string, alt?: string) => void;
}

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageRequest?: () => void;
  variant?: 'default' | 'compact';
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    { content = '', onChange, placeholder = 'Start writing...', onImageRequest, variant = 'default' },
    ref,
  ) {
    const isCompact = variant === 'compact';
    const skipSync = useRef(false);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const extensions = useMemo(
      () => [
        StarterKit.configure({
          codeBlock: false,
          heading: isCompact ? false : undefined,
        }),
        Underline,
        Image.configure({ inline: false }),
        Link.configure({ openOnClick: false }),
        Placeholder.configure({ placeholder }),
        ...(isCompact ? [] : [CodeBlockLowlight.configure({ lowlight })]),
      ],
      [isCompact, placeholder],
    );

    const editor = useEditor(
      {
        immediatelyRender: false,
        extensions,
        content,
        onUpdate: ({ editor: e }) => {
          skipSync.current = true;
          onChangeRef.current(e.getHTML());
        },
        editorProps: {
          attributes: {
            class: cn(
              'prose prose-sm max-w-none px-4 py-3 focus:outline-none dark:prose-invert',
              isCompact ? 'min-h-[120px]' : 'min-h-[200px] sm:prose',
            ),
          },
        },
      },
      [extensions],
    );

    useEffect(() => {
      if (!editor || skipSync.current) {
        skipSync.current = false;
        return;
      }
      const current = editor.getHTML();
      if (current !== content) {
        editor.commands.setContent(content, false);
      }
    }, [content, editor]);

    useImperativeHandle(ref, () => ({
      insertImage: (url: string, alt = '') => {
        editor?.chain().focus().setImage({ src: url, alt }).run();
      },
    }));

    const addLink = () => {
      const url = window.prompt('URL');
      if (url) {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    };

    if (!editor) {
      return <Skeleton className={cn('w-full rounded-lg', isCompact ? 'h-[160px]' : 'h-[280px]')} />;
    }

    const ToolbarButton = ({
      onClick,
      active,
      children,
    }: {
      onClick: () => void;
      active?: boolean;
      children: React.ReactNode;
    }) => (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'rounded p-1.5 hover:bg-accent',
          active && 'bg-primary/20 text-primary',
        )}
      >
        {children}
      </button>
    );

    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted/50 p-2">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          {!isCompact ? (
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
          ) : null}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          {!isCompact ? (
            <>
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
                <Code className="h-4 w-4" />
              </ToolbarButton>
            </>
          ) : null}
          <ToolbarButton onClick={addLink} active={editor.isActive('link')}>
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {onImageRequest && !isCompact ? (
            <ToolbarButton onClick={onImageRequest}>
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          ) : null}
        </div>
        <EditorContent editor={editor} />
      </div>
    );
  },
);
