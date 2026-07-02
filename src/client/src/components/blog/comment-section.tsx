'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { api, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { useRecaptcha } from '@/components/auth/recaptcha-provider';
import { fetchPostComments, type CommentItem } from '@/lib/comments';
import { cn, formatDate } from '@/lib/utils';

function CommentBody({
  comment,
  locale,
  onReply,
}: {
  comment: CommentItem;
  locale: string;
  onReply?: (id: string) => void;
}) {
  const t = useTranslations('comments');
  const name = comment.user.displayName || comment.user.username;
  const isFa = locale === 'fa';

  return (
    <article className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn('text-sm font-medium', isFa && 'font-fa')}>{name}</p>
        <time dateTime={comment.createdAt} className="shrink-0 text-xs text-muted-foreground">
          {formatDate(comment.createdAt, locale)}
        </time>
      </div>
      <p className={cn('text-sm leading-relaxed text-muted-foreground', isFa && 'font-fa')}>
        {comment.content}
      </p>
      {onReply ? (
        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className={cn('text-xs text-foreground/70 hover:text-foreground', isFa && 'font-fa')}
        >
          {t('reply')}
        </button>
      ) : null}
      {comment.replies && comment.replies.length > 0 ? (
        <div className="mt-3 space-y-4 border-s border-border ps-4">
          {comment.replies.map((reply) => (
            <CommentBody key={reply.id} comment={reply} locale={locale} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
}: {
  postId: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const t = useTranslations('comments');
  const locale = useLocale();
  const { getToken } = useRecaptcha();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isFa = locale === 'fa';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    try {
      const recaptchaToken = await getToken('comment');
      await api.post(`/api/comments/post/${postId}`, {
        content: trimmed,
        parentId,
        recaptchaToken,
      });
      setContent('');
      setPending(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      {pending ? (
        <p className={cn('rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground', isFa && 'font-fa')}>
          {t('pending')}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('placeholder')}
        rows={3}
        maxLength={2000}
        className={cn(
          'w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-ring transition-shadow focus:ring-2',
          isFa && 'font-fa',
        )}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity disabled:opacity-50"
        >
          {loading ? t('submitting') : t('submit')}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            {t('cancel')}
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function CommentSection({
  postId,
  commentsEnabled,
  locale,
  returnUrl,
}: {
  postId: string;
  commentsEnabled: boolean;
  locale: string;
  returnUrl: string;
}) {
  const t = useTranslations('comments');
  const { user, isLoading: authLoading } = useAuthStore();
  const isFa = locale === 'fa';
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (!commentsEnabled) {
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchPostComments(postId);
    setComments(data);
    setLoading(false);
  }, [commentsEnabled, postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  if (!commentsEnabled) return null;

  const loginHref = `/${locale}/login?returnUrl=${encodeURIComponent(returnUrl)}`;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className={cn('mb-6 text-sm font-medium', isFa && 'font-fa')}>{t('title')}</h2>

      {authLoading ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : user ? (
        <div className="mb-8">
          <CommentForm
            postId={postId}
            parentId={replyTo ?? undefined}
            onSuccess={() => {
              setReplyTo(null);
              void loadComments();
            }}
            onCancel={replyTo ? () => setReplyTo(null) : undefined}
          />
        </div>
      ) : (
        <p className={cn('mb-8 text-sm text-muted-foreground', isFa && 'font-fa')}>
          {t('loginToComment')}{' '}
          <Link href={loginHref} className="text-foreground underline-offset-4 hover:underline">
            {t('login')}
          </Link>
          {' · '}
          <Link href={`/${locale}/register`} className="text-foreground underline-offset-4 hover:underline">
            {t('register')}
          </Link>
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : comments.length === 0 ? (
        <p className={cn('text-sm text-muted-foreground', isFa && 'font-fa')}>{t('empty')}</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentBody
              key={comment.id}
              comment={comment}
              locale={locale}
              onReply={user ? setReplyTo : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
