import { Container } from '@/components/layout/container';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteFooter({ name, year }: { name: string; year: number }) {
  return (
    <footer className="mt-24 border-t border-border/60 py-8">
      <Container className="flex items-center justify-between text-sm text-muted-foreground">
        <span>© {year} {name}.</span>
        <ThemeToggle />
      </Container>
    </footer>
  );
}
