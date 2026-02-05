import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        {/* Logo */}
        <div className="text-5xl">🧠</div>

        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            MindBase
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            The calm productivity system for overthinkers. Empty your mind, let AI help you organize, commit to what matters.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
            <div className="text-2xl">📥</div>
            <h3 className="font-semibold text-foreground">Capture</h3>
            <p className="text-sm text-muted-foreground">
              Zero friction brain dump
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
            <div className="text-2xl">🤖</div>
            <h3 className="font-semibold text-foreground">Process</h3>
            <p className="text-sm text-muted-foreground">
              AI-assisted organization
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-6">
            <div className="text-2xl">📅</div>
            <h3 className="font-semibold text-foreground">Commit</h3>
            <p className="text-sm text-muted-foreground">
              Schedule what matters
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-sm text-muted-foreground">
        <p>Built with ❤️ by Paulo</p>
      </footer>
    </div>
  );
}
