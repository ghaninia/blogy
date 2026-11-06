'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent, Node, mergeAttributes } from '@tiptap/react';
import type { JSONContent } from '@tiptap/react';
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
  Video,
  Table2,
  Rows3,
  Trash2,
  Link as LinkIcon,
  Heading2,
  Heading1,
  Heading3,
  Minus,
  Maximize2,
  Minimize2,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import { Skeleton } from '@gh/ui';
import { cn } from '@/shared/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

const lowlight = createLowlight(common);

const TableNode = Node.create({
  name: 'table',
  group: 'block',
  content: 'tableRow+',
  isolating: true,
  parseHTML: () => [{ tag: 'table' }],
  renderHTML: ({ HTMLAttributes }) => [
    'table',
    mergeAttributes(HTMLAttributes, { class: 'post-content-table' }),
    ['tbody', 0],
  ],
});

const TableRowNode = Node.create({
  name: 'tableRow',
  content: '(tableHeader | tableCell)+',
  parseHTML: () => [{ tag: 'tr' }],
  renderHTML: ({ HTMLAttributes }) => ['tr', mergeAttributes(HTMLAttributes), 0],
});

const TableHeaderNode = Node.create({
  name: 'tableHeader',
  content: 'block+',
  isolating: true,
  parseHTML: () => [{ tag: 'th' }],
  renderHTML: ({ HTMLAttributes }) => ['th', mergeAttributes(HTMLAttributes, { scope: 'col' }), 0],
});

const TableCellNode = Node.create({
  name: 'tableCell',
  content: 'block+',
  isolating: true,
  parseHTML: () => [{ tag: 'td' }],
  renderHTML: ({ HTMLAttributes }) => ['td', mergeAttributes(HTMLAttributes), 0],
});

const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes: () => ({ src: { default: null }, title: { default: null } }),
  parseHTML: () => [{ tag: 'iframe[src]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'iframe',
    mergeAttributes(HTMLAttributes, {
      class: 'post-video-embed',
      width: '100%',
      height: '420',
      frameborder: '0',
      allowfullscreen: 'true',
      loading: 'lazy',
      title: HTMLAttributes.title || 'Embedded video',
    }),
  ],
});

export interface RichTextEditorHandle {
  insertImage: (url: string, alt?: string) => void;
}

export function getVideoEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    if (url.protocol !== 'https:') return null;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    if (hostname === 'youtu.be' || hostname === 'youtube.com') {
      const match =
        hostname === 'youtu.be'
          ? url.pathname.match(/^\/([\w-]{6,})/)
          : url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/);
      const id =
        hostname === 'youtube.com' && url.pathname === '/watch'
          ? url.searchParams.get('v')
          : match?.[1];
      return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (hostname === 'vimeo.com' || hostname === 'player.vimeo.com') {
      const id = url.pathname.match(/\/(?:video\/)?(\d{5,})(?:\/|$)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string, json: JSONContent) => void;
  contentJson?: JSONContent | null;
  placeholder?: string;
  onImageRequest?: () => void;
  variant?: 'default' | 'compact';
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
      content = '',
      contentJson,
      onChange,
      placeholder = 'Start writing...',
      onImageRequest,
      variant = 'default',
    },
    ref,
  ) {
    const isCompact = variant === 'compact';
    const [focusMode, setFocusMode] = useState(false);
    const locale = useLocale();
    const t = useTranslations('dashboard.editor');
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
        ...(isCompact
          ? []
          : [TableNode, TableRowNode, TableHeaderNode, TableCellNode, VideoEmbedNode]),
        ...(isCompact ? [] : [CodeBlockLowlight.configure({ lowlight })]),
      ],
      [isCompact, placeholder],
    );

    const editor = useEditor(
      {
        immediatelyRender: false,
        extensions,
        content: contentJson ?? content,
        onUpdate: ({ editor: e }) => {
          skipSync.current = true;
          onChangeRef.current(e.getHTML(), e.getJSON());
        },
        editorProps: {
          attributes: {
            dir: locale === 'fa' ? 'rtl' : 'ltr',
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
      if (
        contentJson
          ? JSON.stringify(editor.getJSON()) !== JSON.stringify(contentJson)
          : current !== content
      ) {
        editor.commands.setContent(contentJson ?? content, false);
      }
    }, [content, contentJson, editor]);

    useImperativeHandle(ref, () => ({
      insertImage: (url: string, alt = '') => {
        editor?.chain().focus().setImage({ src: url, alt }).run();
      },
    }));

    if (!editor) {
      return (
        <Skeleton className={cn('w-full rounded-lg', isCompact ? 'h-[160px]' : 'h-[280px]')} />
      );
    }

    const addLink = () => {
      const url = window.prompt('URL');
      if (url) {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    };

    const insertTable = () => {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'table',
          content: Array.from({ length: 3 }, (_, row) => ({
            type: 'tableRow',
            content: Array.from({ length: 3 }, () => ({
              type: row === 0 ? 'tableHeader' : 'tableCell',
              content: [{ type: 'paragraph' }],
            })),
          })),
        })
        .run();
    };

    const addTableRow = () => {
      const { $from } = editor.state.selection;
      let rowDepth = -1;
      for (let depth = $from.depth; depth > 0; depth -= 1) {
        if ($from.node(depth).type.name === 'tableRow') {
          rowDepth = depth;
          break;
        }
      }
      if (rowDepth < 1) return;

      const row = $from.node(rowDepth);
      const cellType = editor.schema.nodes.tableCell;
      const paragraph = editor.schema.nodes.paragraph.create();
      const newRow = editor.schema.nodes.tableRow.create(
        null,
        Array.from({ length: row.childCount }, () => cellType.create(null, paragraph)),
      );
      const positionAfterRow = $from.before(rowDepth) + row.nodeSize;
      editor.view.dispatch(editor.state.tr.insert(positionAfterRow, newRow));
      editor.view.focus();
    };

    const deleteTableRow = () => {
      const { $from } = editor.state.selection;
      let rowDepth = -1;
      for (let depth = $from.depth; depth > 0; depth -= 1) {
        if ($from.node(depth).type.name === 'tableRow') {
          rowDepth = depth;
          break;
        }
      }
      if (rowDepth < 2) return;
      const table = $from.node(rowDepth - 1);
      const removeWholeTable = table.childCount === 1;
      const depth = removeWholeTable ? rowDepth - 1 : rowDepth;
      const node = removeWholeTable ? table : $from.node(rowDepth);
      const position = $from.before(depth);
      editor.view.dispatch(editor.state.tr.delete(position, position + node.nodeSize));
      editor.view.focus();
    };

    const addVideo = () => {
      const rawUrl = window.prompt(t('videoUrl'));
      if (!rawUrl) return;
      const embedUrl = getVideoEmbedUrl(rawUrl);
      if (!embedUrl) {
        window.alert(t('videoUrlError'));
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent({ type: 'videoEmbed', attrs: { src: embedUrl } })
        .run();
    };

    const ToolbarButton = ({
      onClick,
      active,
      disabled,
      label,
      children,
    }: {
      onClick: () => void;
      active?: boolean;
      disabled?: boolean;
      label: string;
      children: React.ReactNode;
    }) => (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        title={label}
        aria-pressed={active}
        className={cn(
          'rounded p-1.5 hover:bg-accent disabled:pointer-events-none disabled:opacity-40',
          active && 'bg-primary/20 text-primary',
        )}
      >
        {children}
      </button>
    );

    return (
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-card elevated-sm',
          focusMode && 'fixed inset-3 z-[80] flex flex-col shadow-xl sm:inset-8',
        )}
        onKeyDownCapture={(event) => {
          if (event.key === 'Escape' && focusMode) setFocusMode(false);
          if (
            (event.metaKey || event.ctrlKey) &&
            event.shiftKey &&
            event.key.toLowerCase() === 'f'
          ) {
            event.preventDefault();
            setFocusMode((value) => !value);
          }
        }}
      >
        <div
          className="flex flex-wrap gap-1 border-b border-border bg-muted/50 p-2"
          role="toolbar"
          aria-label={t('toolbar')}
        >
          <ToolbarButton
            label={t('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label={t('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          {!isCompact ? (
            <>
              <ToolbarButton
                label={t('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive('strike')}
              >
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('heading1')}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
              >
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('heading2')}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('heading3')}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>
            </>
          ) : null}
          <ToolbarButton
            label={t('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          {!isCompact ? (
            <>
              <ToolbarButton
                label={t('orderedList')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('quote')}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('codeBlock')}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive('codeBlock')}
              >
                <Code className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('separator')}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              >
                <Minus className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label={t('insertTable')} onClick={insertTable}>
                <Table2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('addTableRow')}
                onClick={addTableRow}
                disabled={!editor.isActive('table')}
              >
                <Rows3 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t('deleteTableRow')}
                onClick={deleteTableRow}
                disabled={!editor.isActive('table')}
              >
                <Trash2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label={t('video')} onClick={addVideo}>
                <Video className="h-4 w-4" />
              </ToolbarButton>
            </>
          ) : null}
          <ToolbarButton label={t('link')} onClick={addLink} active={editor.isActive('link')}>
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {onImageRequest && !isCompact ? (
            <ToolbarButton label={t('image')} onClick={onImageRequest}>
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          ) : null}
          {!isCompact ? (
            <>
              <span
                className="mx-1 hidden h-6 w-px self-center bg-border sm:block"
                aria-hidden="true"
              />
              <ToolbarButton label={t('undo')} onClick={() => editor.chain().focus().undo().run()}>
                <Undo2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label={t('redo')} onClick={() => editor.chain().focus().redo().run()}>
                <Redo2 className="h-4 w-4" />
              </ToolbarButton>
              <span
                className="mx-1 hidden h-6 w-px self-center bg-border sm:block"
                aria-hidden="true"
              />
              <ToolbarButton
                label={focusMode ? t('exitFocusMode') : t('focusMode')}
                onClick={() => setFocusMode((value) => !value)}
                active={focusMode}
              >
                {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </ToolbarButton>
            </>
          ) : null}
        </div>
        <EditorContent
          editor={editor}
          className={
            focusMode ? 'min-h-0 flex-1 overflow-y-auto [&_.ProseMirror]:min-h-[70vh]' : undefined
          }
        />
      </div>
    );
  },
);
