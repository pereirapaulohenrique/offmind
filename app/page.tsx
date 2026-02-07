import Link from 'next/link';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  Sparkles,
  FolderOpen,
  FileText,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistForm } from '@/components/marketing/WaitlistForm';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { cn } from '@/lib/utils';

export default function ZenFlowLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation - Floating glass morphism */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--border-subtle)]">
        <nav className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <OffMindLogo size={32} variant="full" />
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="default">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="default">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section - Massive typography, breathing space */}
        <section className="relative overflow-hidden">
          <div className="gradient-mesh-animated absolute inset-0" />
          <div className="texture-noise absolute inset-0 opacity-40" />

          <div className="relative container mx-auto px-6 py-36 lg:px-8 lg:py-48">
            <div className="mx-auto max-w-3xl text-center">
              {/* Main headline */}
              <h1
                className="animate-zen-float-up stagger-1 text-[var(--text-display)] font-bold text-foreground mb-8"
                style={{ letterSpacing: 'var(--tracking-tighter)' }}
              >
                Get it off your mind.
              </h1>

              {/* Gradient subtitle */}
              <p
                className="animate-zen-float-up stagger-2 text-3xl font-semibold bg-gradient-to-r from-[#38d9c2] via-[#38a8d4] to-[#818cf8] bg-clip-text text-transparent mb-6"
                style={{ letterSpacing: 'var(--tracking-tight)' }}
              >
                Capture. Process. Commit.
              </p>

              {/* Body text */}
              <p className="animate-zen-float-up stagger-3 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-12">
                The calm productivity system for overthinkers. Zero-friction capture, AI-powered organization, focused commitment.
              </p>

              {/* CTAs */}
              <div className="animate-zen-float-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                <Button asChild size="lg" className="gap-2 px-8 zen-glow">
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>

              {/* Product preview - floating zen-card with perspective */}
              <div
                className="animate-zen-float-up stagger-5 mx-auto max-w-4xl"
                style={{
                  transform: 'perspective(2000px) rotateX(3deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="zen-card card-hover p-1 bg-[var(--bg-elevated)]">
                  <div className="rounded-lg bg-[var(--bg-base)] overflow-hidden border border-[var(--border-subtle)]">
                    {/* Mock header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500/40" />
                        <div className="h-3 w-3 rounded-full bg-amber-500/40" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <OffMindLogo size={20} />
                        <span className="text-sm font-medium text-[var(--text-secondary)]">OffMind</span>
                      </div>
                    </div>

                    {/* Three layer stats */}
                    <div className="p-8">
                      <p className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Your three layers</p>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Capture */}
                        <div className="zen-card p-6 bg-[var(--layer-capture-bg)] border border-[var(--layer-capture-border)] inner-light">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-capture)]/20">
                              <Inbox className="h-4 w-4 text-[var(--layer-capture)]" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--layer-capture)]">Capture</span>
                          </div>
                          <p className="text-3xl font-bold text-[var(--text-primary)] mb-2">12</p>
                          <p className="text-xs text-[var(--text-muted)]">items waiting</p>
                        </div>

                        {/* Process */}
                        <div className="zen-card p-6 bg-[var(--layer-process-bg)] border border-[var(--layer-process-border)] inner-light">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-process)]/20">
                              <ArrowRightLeft className="h-4 w-4 text-[var(--layer-process)]" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--layer-process)]">Process</span>
                          </div>
                          <p className="text-3xl font-bold text-[var(--text-primary)] mb-2">4</p>
                          <p className="text-xs text-[var(--text-muted)]">to organize</p>
                        </div>

                        {/* Commit */}
                        <div className="zen-card p-6 bg-[var(--layer-commit-bg)] border border-[var(--layer-commit-border)] inner-light">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-commit)]/20">
                              <CalendarCheck className="h-4 w-4 text-[var(--layer-commit)]" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--layer-commit)]">Commit</span>
                          </div>
                          <p className="text-3xl font-bold text-[var(--text-primary)] mb-2">6</p>
                          <p className="text-xs text-[var(--text-muted)]">today</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Three layers, one clear mind */}
        <section id="how-it-works" className="relative py-36 bg-[var(--bg-inset)]">
          <div className="dot-grid absolute inset-0 opacity-30" />

          <div className="relative container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-24">
              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
                Three layers, one clear mind
              </h2>
              <p className="text-lg text-[var(--text-secondary)]">
                A proven workflow that turns chaos into clarity
              </p>
            </div>

            {/* Three steps with flow line */}
            <div className="relative mx-auto max-w-5xl">
              {/* Flowing gradient line */}
              <div className="flow-line absolute top-20 left-[16.666%] right-[16.666%] h-1 hidden lg:block" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                {/* Step 1: Capture */}
                <div className="zen-card card-hover p-8 text-center bg-[var(--bg-surface)] inner-light">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--layer-capture-bg)] border-2 border-[var(--layer-capture-border)] shadow-lg shadow-[var(--layer-capture)]/20 mb-6">
                    <Inbox className="h-10 w-10 text-[var(--layer-capture)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Capture</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Brain dump everything. Web, mobile, Telegram, browser extension. Zero friction, all platforms.
                  </p>
                </div>

                {/* Step 2: Process */}
                <div className="zen-card card-hover p-8 text-center bg-[var(--bg-surface)] inner-light">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--layer-process-bg)] border-2 border-[var(--layer-process-border)] shadow-lg shadow-[var(--layer-process)]/20 mb-6">
                    <ArrowRightLeft className="h-10 w-10 text-[var(--layer-process)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Process</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    AI organizes for you. Review and refine with a few clicks. No more decision fatigue.
                  </p>
                </div>

                {/* Step 3: Commit */}
                <div className="zen-card card-hover p-8 text-center bg-[var(--bg-surface)] inner-light">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--layer-commit-bg)] border-2 border-[var(--layer-commit-border)] shadow-lg shadow-[var(--layer-commit)]/20 mb-6">
                    <CalendarCheck className="h-10 w-10 text-[var(--layer-commit)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Commit</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Focus on what matters. See only today's priorities. Everything else is safely stored away.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Superpowers for calm productivity */}
        <section className="py-36">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
                Superpowers for calm productivity
              </h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Everything you need to stay organized without feeling overwhelmed
              </p>
            </div>

            {/* 2x3 feature grid */}
            <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Processing */}
              <div className="zen-card card-hover p-8 bg-[var(--bg-surface)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-subtle)] mb-5">
                  <Sparkles className="h-6 w-6 text-[var(--accent-base)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">AI Processing</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Smart suggestions for where each item belongs based on your patterns and preferences.
                </p>
              </div>

              {/* Spaces & Projects */}
              <div className="zen-card card-hover p-8 bg-[var(--bg-surface)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-5">
                  <FolderOpen className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Spaces & Projects</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Organize by life areas. Work, personal, health - all in separate, focused contexts.
                </p>
              </div>

              {/* Rich Pages */}
              <div className="zen-card card-hover p-8 bg-[var(--bg-surface)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 mb-5">
                  <FileText className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Rich Pages</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Notion-like documents for deeper thinking, linked to your tasks and projects.
                </p>
              </div>

              {/* Quick Capture */}
              <div className="zen-card card-hover p-8 bg-[var(--bg-surface)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 mb-5">
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Quick Capture</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Capture from anywhere: Telegram bot, browser extension, mobile web, desktop app.
                </p>
              </div>

              {/* Privacy First */}
              <div className="zen-card card-hover p-8 bg-[var(--bg-surface)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 mb-5">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Privacy First</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Your data stays yours. Self-hostable option available. No ads, no tracking, ever.
                </p>
              </div>

              {/* Time Blocking */}
              <div className="zen-card card-hover p-8 bg-[var(--bg-surface)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 mb-5">
                  <Clock className="h-6 w-6 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Time Blocking</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Turn processed items into scheduled commitments. Google Calendar integration included.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built for Overthinkers Section */}
        <section className="relative py-36 overflow-hidden">
          <div className="gradient-mesh absolute inset-0" />
          <div className="dot-grid absolute inset-0 opacity-20" />

          <div className="relative container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
                Built for the busy mind
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                If you have 47 browser tabs open, 3 different note apps, and constant anxiety about forgetting something important—OffMind gives you a single place to dump everything and lets AI do the heavy lifting of organizing it all.
              </p>
            </div>

            {/* Three small cards */}
            <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="zen-card p-6 bg-[var(--bg-surface)] inner-light">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--layer-capture-bg)] border border-[var(--layer-capture-border)] mb-4">
                  <Inbox className="h-5 w-5 text-[var(--layer-capture)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Instant brain dump</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Capture from anywhere in under 2 seconds. Think it, capture it, forget it.
                </p>
              </div>

              <div className="zen-card p-6 bg-[var(--bg-surface)] inner-light">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] mb-4">
                  <Sparkles className="h-5 w-5 text-[var(--accent-base)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">AI organizes for you</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Stop spending mental energy on categorization. AI suggests, you approve.
                </p>
              </div>

              <div className="zen-card p-6 bg-[var(--bg-surface)] inner-light">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--layer-commit-bg)] border border-[var(--layer-commit-border)] mb-4">
                  <CalendarCheck className="h-5 w-5 text-[var(--layer-commit)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Focus on today</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Only see what you've committed to. Everything else is safely stored away.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-36">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
                Start free, grow with us
              </h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Choose the plan that works for you. Upgrade anytime.
              </p>
            </div>

            {/* Two pricing cards */}
            <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="zen-card p-10 bg-[var(--bg-surface)]">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Free</h3>
                <p className="text-sm text-[var(--text-muted)] mb-8">For getting started</p>

                <div className="mb-10">
                  <span className="text-5xl font-bold text-[var(--text-primary)]">$0</span>
                  <span className="text-lg text-[var(--text-secondary)]">/month</span>
                </div>

                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Up to 100 items</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">3 spaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Basic AI suggestions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Web capture</span>
                  </li>
                </ul>

                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/signup">Start Free</Link>
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="relative zen-card p-10 bg-[var(--bg-surface)] gradient-border zen-glow">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#38d9c2] to-[#818cf8] text-xs font-bold text-white shadow-lg">
                  Most Popular
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Pro</h3>
                <p className="text-sm text-[var(--text-muted)] mb-8">For serious productivity</p>

                <div className="mb-10">
                  <span className="text-5xl font-bold text-[var(--text-primary)]">$9</span>
                  <span className="text-lg text-[var(--text-secondary)]">/month</span>
                </div>

                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Unlimited items</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Unlimited spaces & projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Advanced AI processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Telegram & extension capture</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">API access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[var(--text-secondary)]">Priority support</span>
                  </li>
                </ul>

                <Button asChild className="w-full zen-glow" size="lg">
                  <Link href="/signup">Start 14-Day Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-36 overflow-hidden">
          <div className="gradient-mesh-animated absolute inset-0" />
          <div className="texture-noise absolute inset-0 opacity-30" />

          <div className="relative container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="title-glow text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
                Ready to clear your mind?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-12">
                Join thousands of overthinkers who found their calm with OffMind.
              </p>

              <WaitlistForm />

              <p className="mt-8 text-sm text-[var(--text-muted)]">
                Or{' '}
                <Link href="/signup" className="text-[var(--accent-base)] hover:underline font-medium">
                  sign up now
                </Link>{' '}
                to start using OffMind today.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Minimal and clean */}
      <footer className="border-t border-[var(--border-subtle)] py-12 bg-[var(--bg-base)]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <OffMindLogo size={32} variant="full" />
            </Link>
            <p className="text-sm text-[var(--text-muted)]">
              Built with care for clarity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
