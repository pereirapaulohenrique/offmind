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
  ChevronRight,
  ArrowRight,
  Check,
  Leaf,
  Sun,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistForm } from '@/components/marketing/WaitlistForm';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background bloom-surface">
      {/* Navigation — warm, rounded, friendly */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] warm-glass">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] group-hover:bg-[var(--accent-base)]/15 transition-colors duration-200">
              <OffMindLogo size={24} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
              OffMind
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-[var(--bg-hover)]">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="rounded-xl shadow-md tactile-press" style={{ background: 'var(--gradient-accent)', border: 'none' }}>
              <Link href="/signup">
                <Leaf className="mr-2 h-4 w-4" />
                Start Growing
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ================================================================
            HERO — Warm, story-driven, garden metaphor
        ================================================================ */}
        <section className="relative overflow-hidden">
          {/* Warm gradient mesh background */}
          <div className="gradient-mesh absolute inset-0" />

          {/* Organic blob decorative elements */}
          <div
            className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #c2410c, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #65a30d, transparent 70%)' }}
          />
          <div
            className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full opacity-[0.02]"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }}
          />

          <div className="relative container mx-auto px-4 py-28 sm:px-6 sm:py-40 lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              {/* Warm pill badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-5 py-2 text-sm font-medium text-[var(--accent-hover)]">
                <Sparkles className="h-4 w-4" />
                A calmer way to get things done
              </div>

              {/* Headline — emotional, warm, garden metaphor */}
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl title-glow" style={{ letterSpacing: '-0.03em', lineHeight: '1.08' }}>
                Your thoughts
                <br />
                deserve a{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #c2410c, #ea580c, #f59e0b)' }}
                >
                  garden.
                </span>
              </h1>

              {/* Subtitle — warm and encouraging */}
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]" style={{ fontSize: '1.125rem' }}>
                You have a beautiful, busy mind. OffMind gives every thought a place to land,
                grow, and bloom into action -- so you can finally breathe.
              </p>

              {/* CTAs */}
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="gap-2.5 rounded-xl px-8 shadow-lg tactile-press text-base font-semibold"
                  style={{ background: 'var(--gradient-accent)', border: 'none', boxShadow: '0 4px 20px rgba(194,65,12,0.25), 0 1px 3px rgba(194,65,12,0.15)' }}
                >
                  <Link href="/signup">
                    <Leaf className="h-4.5 w-4.5" />
                    Plant your first thought
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-[var(--border-default)] bg-[var(--bg-surface)]/50 text-base hover:bg-[var(--bg-hover)] tactile-press"
                >
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-[var(--text-muted)]">
                Free to start. No credit card. Just calm.
              </p>
            </div>

            {/* Product Preview — extra-rounded, warm shadows */}
            <div className="mx-auto mt-24 max-w-4xl">
              <div
                className="relative rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)]/80 p-2 bloom-warm"
                style={{ boxShadow: '0 8px 40px rgba(80,50,20,0.15), 0 2px 8px rgba(80,50,20,0.08), 0 0 0 1px rgba(196,145,100,0.06)' }}
              >
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden">
                  {/* Mock dashboard header */}
                  <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-3.5">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/50" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="ml-4 flex items-center gap-2.5">
                      <OffMindLogo size={20} />
                      <span className="text-xs font-medium text-[var(--text-muted)]">OffMind</span>
                    </div>
                  </div>

                  {/* Mock three-layer cards */}
                  <div className="p-7">
                    <div className="flex items-center gap-2 mb-5">
                      <Sun className="h-5 w-5 text-[var(--accent-hover)]" />
                      <p className="text-lg font-semibold text-foreground">Good morning, Paulo</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Capture card */}
                      <div className="rounded-2xl border border-[var(--layer-capture-border)] bg-[var(--layer-capture-bg)] p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-capture)]/15">
                            <Inbox className="h-4 w-4 text-[var(--layer-capture)]" />
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--layer-capture)]/80">Capture</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">5</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">items in inbox</p>
                      </div>

                      {/* Process card */}
                      <div className="rounded-2xl border border-[var(--layer-process-border)] bg-[var(--layer-process-bg)] p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-process)]/15">
                            <ArrowRightLeft className="h-4 w-4 text-[var(--layer-process)]" />
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--layer-process)]/80">Process</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">2</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">to organize</p>
                      </div>

                      {/* Commit card */}
                      <div className="rounded-2xl border border-[var(--layer-commit-border)] bg-[var(--layer-commit-bg)] p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-commit)]/15">
                            <CalendarCheck className="h-4 w-4 text-[var(--layer-commit)]" />
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--layer-commit)]/80">Commit</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">3</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            HOW IT WORKS — Garden metaphor: Plant, Nurture, Harvest
        ================================================================ */}
        <section id="how-it-works" className="border-y border-[var(--border-subtle)] bg-[var(--bg-inset)] py-28 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--sage-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--sage)]">
                <Leaf className="h-3.5 w-3.5" />
                How it works
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                From seed to harvest
              </h2>
              <p className="mt-5 text-lg text-[var(--text-secondary)]">
                Three simple steps, rooted in the proven GTD methodology. Let your ideas grow naturally.
              </p>
            </div>

            <div className="mx-auto mt-20 grid max-w-5xl gap-8 sm:grid-cols-3">
              <GardenStep
                number={1}
                icon={Inbox}
                title="Plant"
                subtitle="Capture"
                description="Drop every thought, idea, and task into your garden. No organizing, no thinking -- just plant it and let go."
                color="capture"
                emoji="seed"
              />
              <GardenStep
                number={2}
                icon={ArrowRightLeft}
                title="Nurture"
                subtitle="Process"
                description="AI helps you sort and tend each thought. Review suggestions, make quick decisions, watch clarity emerge."
                color="process"
                emoji="sprout"
              />
              <GardenStep
                number={3}
                icon={CalendarCheck}
                title="Harvest"
                subtitle="Commit"
                description="Pick what's ripe. Schedule only what matters today. Complete tasks with a satisfying sense of accomplishment."
                color="commit"
                emoji="bloom"
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURES — 2-column warm cards, generous padding
        ================================================================ */}
        <section className="py-28 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Tools that feel like home
              </h2>
              <p className="mt-5 text-lg text-[var(--text-secondary)]">
                Thoughtfully crafted features that reduce overwhelm, not add to it
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2">
              <FeatureCard
                icon={Sparkles}
                title="AI That Understands You"
                description="Smart categorization and scheduling suggestions that learn from your patterns. Like a thoughtful assistant who knows your garden."
                color="terracotta"
              />
              <FeatureCard
                icon={FolderOpen}
                title="Spaces for Every Season"
                description="Organize by life areas -- work, personal, health, creativity. Each space is its own little world."
                color="sage"
              />
              <FeatureCard
                icon={FileText}
                title="Rich Thinking Pages"
                description="Notion-like documents woven into your tasks. For when a thought needs room to breathe and grow."
                color="lavender"
              />
              <FeatureCard
                icon={Zap}
                title="Capture From Anywhere"
                description="Telegram bot, browser extension, desktop app, and mobile-first web. Two seconds from thought to planted."
                color="amber"
              />
              <FeatureCard
                icon={Shield}
                title="Your Garden, Your Privacy"
                description="Your thoughts are yours alone. No ads, no tracking, no selling your data. Self-hostable for complete control."
                color="sage"
              />
              <FeatureCard
                icon={Clock}
                title="Gentle Time Blocking"
                description="Turn processed items into committed time blocks. See your day, not your overwhelm."
                color="terracotta"
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            BUILT FOR OVERTHINKERS — Emotional, warm, encouraging
        ================================================================ */}
        <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-inset)] py-28 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--lavender-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--lavender)]">
                <Heart className="h-3.5 w-3.5" />
                Built with care
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                You&apos;re not disorganized.
                <br />
                <span className="text-[var(--text-secondary)]">You just think a lot.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]" style={{ fontSize: '1.125rem' }}>
                If you have 47 browser tabs open, three different note apps, and a constant
                low hum of anxiety about forgetting something important -- you&apos;re not broken.
                You just need a better garden for your thoughts.
              </p>

              {/* Three warm testimonial-style cards */}
              <div className="mt-12 grid gap-5 text-left sm:grid-cols-3">
                <div className="bloom-card p-6 inner-light">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--layer-capture-bg)] mb-4">
                    <Inbox className="h-5 w-5 text-[var(--layer-capture)]" />
                  </div>
                  <p className="text-[var(--text-primary)] font-semibold mb-2">Instant brain dump</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Capture from anywhere in under 2 seconds. Think it, plant it, release it. Your mind deserves the space.
                  </p>
                </div>
                <div className="bloom-card p-6 inner-light">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-subtle)] mb-4">
                    <Sparkles className="h-5 w-5 text-[var(--accent-base)]" />
                  </div>
                  <p className="text-[var(--text-primary)] font-semibold mb-2">AI tends the garden</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Stop spending mental energy on categorization. AI suggests where each thought belongs. You just approve.
                  </p>
                </div>
                <div className="bloom-card p-6 inner-light">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--layer-commit-bg)] mb-4">
                    <Sun className="h-5 w-5 text-[var(--layer-commit)]" />
                  </div>
                  <p className="text-[var(--text-primary)] font-semibold mb-2">Focus on today</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Only see what you committed to today. Everything else is safely growing in the background.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PRICING — Rounded, tactile cards, garden naming
        ================================================================ */}
        <section className="py-28 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Simple, honest pricing
              </h2>
              <p className="mt-5 text-lg text-[var(--text-secondary)]">
                Start with a free garden. Grow when you are ready.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
              {/* Free Garden */}
              <div className="bloom-card p-8 inner-light">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sage-subtle)]">
                    <Leaf className="h-5 w-5 text-[var(--sage)]" />
                  </div>
                  <h3 className="text-xl font-bold">Free Garden</h3>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">For planting your first seeds</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>$0</span>
                  <span className="text-[var(--text-muted)]">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <PricingFeature>Up to 100 items</PricingFeature>
                  <PricingFeature>3 spaces</PricingFeature>
                  <PricingFeature>Basic AI suggestions</PricingFeature>
                  <PricingFeature>Web capture</PricingFeature>
                </ul>
                <Button
                  asChild
                  className="mt-8 w-full rounded-xl tactile-press"
                  variant="outline"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  <Link href="/signup">Start Free</Link>
                </Button>
              </div>

              {/* Pro Garden */}
              <div className="relative gradient-border p-8 inner-light" style={{ boxShadow: 'var(--shadow-glow)' }}>
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 bloom-accent px-5 py-1.5 text-xs font-bold tracking-wide"
                  style={{ boxShadow: '0 4px 12px rgba(194,65,12,0.25)' }}
                >
                  MOST LOVED
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-subtle)]">
                    <Sun className="h-5 w-5 text-[var(--accent-hover)]" />
                  </div>
                  <h3 className="text-xl font-bold">Pro Garden</h3>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">For serious cultivators</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>$9</span>
                  <span className="text-[var(--text-muted)]">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <PricingFeature>Unlimited items</PricingFeature>
                  <PricingFeature>Unlimited spaces & projects</PricingFeature>
                  <PricingFeature>Advanced AI processing</PricingFeature>
                  <PricingFeature>Telegram & extension capture</PricingFeature>
                  <PricingFeature>API access</PricingFeature>
                  <PricingFeature>Priority support</PricingFeature>
                </ul>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 w-full rounded-xl tactile-press font-semibold"
                  style={{
                    background: 'var(--gradient-accent)',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(194,65,12,0.20)',
                  }}
                >
                  <Link href="/signup">
                    Start 14-Day Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            CTA + WAITLIST — Warm background, encouraging
        ================================================================ */}
        <section className="relative border-t border-[var(--border-subtle)] overflow-hidden">
          {/* Warm gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, var(--bg-inset) 0%, var(--bg-base) 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, #c2410c 0%, transparent 60%)',
            }}
          />

          <div className="relative container mx-auto px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--accent-hover)]">
                <Heart className="h-3.5 w-3.5" />
                Join the garden
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl title-glow" style={{ letterSpacing: '-0.02em' }}>
                Ready to clear your mind?
              </h2>
              <p className="mt-5 text-lg text-[var(--text-secondary)]">
                Join the waitlist for early access. We will send you a warm welcome
                when your garden is ready.
              </p>
              <WaitlistForm />
              <p className="mt-5 text-sm text-[var(--text-muted)]">
                Or{' '}
                <Link
                  href="/signup"
                  className="text-[var(--accent-hover)] hover:text-[var(--accent-base)] transition-colors underline underline-offset-4 decoration-[var(--accent-base)]/30"
                >
                  sign up now
                </Link>{' '}
                to start planting today.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — warm, friendly, minimal */}
      <footer className="border-t border-[var(--border-subtle)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-subtle)]">
                <OffMindLogo size={20} />
              </div>
              <span className="font-semibold tracking-tight text-foreground">OffMind</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Crafted with{' '}
              <Heart className="inline h-3.5 w-3.5 text-[var(--accent-base)] relative -top-px" />{' '}
              for beautiful, busy minds
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   Garden Step Component — Plant, Nurture, Harvest
============================================================================= */
function GardenStep({
  number,
  icon: Icon,
  title,
  subtitle,
  description,
  color,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  color: 'capture' | 'process' | 'commit';
  emoji: string;
}) {
  const colorMap = {
    capture: {
      bg: 'bg-[var(--layer-capture-bg)]',
      iconBg: 'bg-[var(--layer-capture)]/15',
      text: 'text-[var(--layer-capture)]',
      border: 'border-[var(--layer-capture-border)]',
      glow: 'glow-capture',
    },
    process: {
      bg: 'bg-[var(--layer-process-bg)]',
      iconBg: 'bg-[var(--layer-process)]/15',
      text: 'text-[var(--layer-process)]',
      border: 'border-[var(--layer-process-border)]',
      glow: 'glow-process',
    },
    commit: {
      bg: 'bg-[var(--layer-commit-bg)]',
      iconBg: 'bg-[var(--layer-commit)]/15',
      text: 'text-[var(--layer-commit)]',
      border: 'border-[var(--layer-commit-border)]',
      glow: 'glow-commit',
    },
  };

  const c = colorMap[color];

  return (
    <div className="flex flex-col items-center text-center group">
      {/* Large rounded icon container */}
      <div className="relative mb-8">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-3xl border-2 transition-all duration-300',
            c.bg,
            c.border,
            'group-hover:scale-105',
          )}
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <Icon className={cn('h-9 w-9', c.text)} />
        </div>
        {/* Step number badge */}
        <span
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-md"
          style={{
            background: 'var(--gradient-accent)',
            color: '#fef3e8',
            boxShadow: '0 2px 8px rgba(194,65,12,0.25)',
          }}
        >
          {number}
        </span>
      </div>

      {/* Title and subtitle */}
      <h3 className="text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{title}</h3>
      <span className={cn('mt-1 text-sm font-medium', c.text)}>{subtitle}</span>
      <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] max-w-xs">{description}</p>
    </div>
  );
}

/* =============================================================================
   Feature Card Component — 2-column warm cards
============================================================================= */
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'terracotta' | 'sage' | 'lavender' | 'amber';
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    terracotta: { bg: 'bg-[var(--accent-subtle)]', text: 'text-[var(--accent-hover)]' },
    sage: { bg: 'bg-[var(--sage-subtle)]', text: 'text-[var(--sage)]' },
    lavender: { bg: 'bg-[var(--lavender-subtle)]', text: 'text-[var(--lavender)]' },
    amber: { bg: 'bg-[var(--layer-process-bg)]', text: 'text-[var(--layer-process)]' },
  };

  const c = colorMap[color] || colorMap.terracotta;

  return (
    <div className="bloom-card p-8 inner-light card-hover">
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', c.bg)}>
        <Icon className={cn('h-6 w-6', c.text)} />
      </div>
      <h3 className="mt-5 text-lg font-bold" style={{ letterSpacing: '-0.01em' }}>{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

/* =============================================================================
   Pricing Feature Component
============================================================================= */
function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--layer-commit-bg)]">
        <Check className="h-3.5 w-3.5 text-[var(--layer-commit)]" />
      </div>
      <span className="text-sm text-[var(--text-primary)]">{children}</span>
    </li>
  );
}
