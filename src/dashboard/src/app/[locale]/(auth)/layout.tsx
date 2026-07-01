import { Header } from '@/features/layout/components/header';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-8 pt-4 sm:px-4 sm:pt-5">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center pt-4">{children}</main>
    </div>
  );
}
