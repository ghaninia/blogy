import assert from 'node:assert/strict';
import test from 'node:test';
import { CampaignService } from './application/campaign.service.js';
import {
  createNewsletterCampaignSchema,
  createSubscriberSchema,
  publicSubscribeSchema,
} from '../../types/schemas/newsletter.js';
import { bulkPostActionSchema, createPostSchema } from '../../types/schemas/post.js';
import { mediaQuerySchema } from '../../types/schemas/media.js';
import { changePasswordSchema, updateProfileSchema } from '../../types/schemas/auth.js';
import { sanitizeRichText } from '../../shared/security/sanitize.js';

test('subscriber emails are trimmed and normalized to lowercase', () => {
  const subscriber = createSubscriberSchema.parse({ email: '  Writer@Example.COM ' });
  assert.equal(subscriber.email, 'writer@example.com');
  assert.equal(subscriber.status, 'ACTIVE');
});

test('public newsletter subscriptions require consent and normalize email addresses', () => {
  assert.equal(
    publicSubscribeSchema.parse({ email: ' Writer@Example.com ', consent: true }).email,
    'writer@example.com',
  );
  assert.equal(publicSubscribeSchema.safeParse({ email: 'writer@example.com' }).success, false);
  assert.equal(
    publicSubscribeSchema.safeParse({ email: 'writer@example.com', consent: false }).success,
    false,
  );
});

test('post schema accepts structured Tiptap documents and limits their size', () => {
  const document = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A structured document' }] }],
  };
  assert.equal(
    createPostSchema.safeParse({ slug: 'structured-content', contentEnJson: document }).success,
    true,
  );
  assert.equal(
    createPostSchema.safeParse({
      slug: 'oversized-content',
      contentEnJson: { type: 'doc', text: 'x'.repeat(500_001) },
    }).success,
    false,
  );
});

test('post SEO accepts canonical HTTP(S) URLs and rejects unsafe schemes', () => {
  assert.equal(
    createPostSchema.safeParse({ slug: 'seo-post', canonicalUrl: 'https://example.com/article' })
      .success,
    true,
  );
  assert.equal(
    createPostSchema.safeParse({ slug: 'unsafe-seo', canonicalUrl: 'javascript:alert(1)' }).success,
    false,
  );
  assert.equal(
    createPostSchema.safeParse({ slug: 'relative-seo', canonicalUrl: '/blog/article' }).success,
    false,
  );
});

test('rich text sanitizer preserves tables and trusted video embeds only', () => {
  const safeContent = sanitizeRichText(
    '<table><tbody><tr><td>Cell</td></tr></tbody></table><iframe src="https://www.youtube.com/embed/abc1234" title="Video"></iframe>',
  );
  assert.match(safeContent ?? '', /<table>/);
  assert.match(safeContent ?? '', /youtube\.com\/embed\/abc1234/);
  assert.match(safeContent ?? '', /title="Video"/);

  const unsafeContent = sanitizeRichText('<iframe src="https://evil.example/embed/1"></iframe>');
  assert.doesNotMatch(unsafeContent ?? '', /evil\.example/);
});

test('campaign validation rejects a scheduled campaign without a future date', () => {
  const service = new CampaignService();
  const input = createNewsletterCampaignSchema.parse({
    title: 'Monthly note',
    subject: 'What I learned this month',
    content: '<p>A short update.</p>',
    status: 'SCHEDULED',
  });

  assert.throws(() => service.create(input), { code: 'SCHEDULE_DATE_REQUIRED' });
});

test('campaign schema rejects blank titles and subjects', () => {
  const result = createNewsletterCampaignSchema.safeParse({
    title: '  ',
    subject: '',
    content: '<p>Draft</p>',
  });

  assert.equal(result.success, false);
});

test('bulk post actions reject duplicate IDs and accept unique selections', () => {
  const firstId = 'a1bb8c2e-6b9f-4b2f-8bc4-8e08f72fe074';
  const secondId = 'b2cc9d3f-7c0a-4c30-9cd5-9f19a83af185';
  assert.equal(
    bulkPostActionSchema.safeParse({ ids: [firstId, firstId], action: 'ARCHIVE' }).success,
    false,
  );
  assert.equal(
    bulkPostActionSchema.safeParse({ ids: [firstId, secondId], action: 'ARCHIVE' }).success,
    true,
  );
});

test('media filters parse date bounds and reject invalid dates', () => {
  const parsed = mediaQuerySchema.parse({ createdAfter: '2026-10-01T00:00:00.000Z' });
  assert.equal(parsed.createdAfter?.toISOString(), '2026-10-01T00:00:00.000Z');
  assert.equal(mediaQuerySchema.safeParse({ createdAfter: 'not-a-date' }).success, false);
});

test('password changes require a strong password and profile links must be valid URLs', () => {
  assert.equal(
    changePasswordSchema.safeParse({ currentPassword: 'old', newPassword: 'weak' }).success,
    false,
  );
  assert.equal(updateProfileSchema.safeParse({ website: 'not a url' }).success, false);
  assert.equal(
    updateProfileSchema.safeParse({ website: 'https://example.com', githubUrl: '' }).success,
    true,
  );
});
