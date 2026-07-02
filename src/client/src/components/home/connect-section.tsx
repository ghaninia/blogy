import { FadeIn } from '@/components/motion/text-effect';
import { Magnetic } from '@/components/motion/magnetic';
import { ExternalLinkIcon } from '@/components/icons/external-link-icon';

const SOCIAL = [
  { key: 'github', label: 'GitHub', hrefKey: 'github' as const },
  { key: 'twitter', label: 'Twitter', hrefKey: 'twitter' as const },
  { key: 'linkedin', label: 'LinkedIn', hrefKey: 'linkedin' as const },
  { key: 'instagram', label: 'Instagram', hrefKey: 'instagram' as const },
];

export function ConnectSection({
  title,
  emailPrompt,
  email,
  links,
}: {
  title: string;
  emailPrompt: string;
  email: string;
  links: { github?: string; twitter?: string; linkedin?: string; instagram?: string };
  locale: string;
}) {
  const visible = SOCIAL.filter((s) => links[s.hrefKey]);

  return (
    <FadeIn className="py-10">
      <h2 className="mb-4 text-sm font-medium text-foreground">{title}</h2>
      {email ? (
        <p className="mb-4 text-sm text-muted-foreground">
          {emailPrompt}{' '}
          <a href={`mailto:${email}`} className="text-foreground underline-offset-4 hover:underline">
            {email}
          </a>
        </p>
      ) : null}
      {visible.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visible.map((social) => (
            <Magnetic key={social.key}>
              <a
                href={links[social.hrefKey]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                {social.label}
                <ExternalLinkIcon className="h-3 w-3 shrink-0" />
              </a>
            </Magnetic>
          ))}
        </div>
      ) : null}
    </FadeIn>
  );
}
