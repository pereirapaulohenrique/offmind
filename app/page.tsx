import Link from 'next/link';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  Sparkles,
  FolderOpen,
  FileText,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistForm } from '@/components/marketing/WaitlistForm';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <OffMindLogo size={32} variant="full" />
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="shadow-sm">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section - With gradient mesh background */}
        <section className="relative overflow-hidden">
          <div className="gradient-mesh absolute inset-0" />
          <div className="relative container mx-auto px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-sm text-primary">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                AI-Powered GTD System
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
                Clear your mind.
                <br />
                <span className="bg-gradient-to-r from-primary via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Own your day.
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                OffMind is the calm productivity system for overthinkers. Capture everything,
                let AI help you organize, and commit only to what matters.
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2 px-8 shadow-md shadow-primary/20">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-border/60">
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground/70">
                14-day free trial. No credit card required.
              </p>
            </div>

            {/* Product Preview - Visual anchor */}
            <div className="mx-auto mt-20 max-w-4xl">
              <div className="relative rounded-xl border border-border/50 bg-card/80 p-1.5 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="rounded-lg border border-border/30 bg-background overflow-hidden">
                  {/* Mock dashboard header */}
                  <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <OffMindLogo size={18} />
                      <span className="text-xs font-medium text-muted-foreground">OffMind</span>
                    </div>
                  </div>
                  {/* Mock three-layer cards */}
                  <div className="p-6">
                    <p className="text-lg font-semibold text-foreground mb-4">Good morning, Paulo</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
                            <Inbox className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-400/80">Capture</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">5</p>
                        <p className="text-[10px] text-muted-foreground mt-1">items in inbox</p>
                      </div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
                            <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/80">Process</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">2</p>
                        <p className="text-[10px] text-muted-foreground mt-1">to organize</p>
                      </div>
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                            <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400/80">Commit</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">3</p>
                        <p className="text-[10px] text-muted-foreground mt-1">today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-y border-border/40 bg-muted/20 py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three simple steps to productivity peace
              </h2>
              <p className="mt-4 text-muted-foreground">
                Based on the proven GTD methodology, enhanced with AI for the modern age
              </p>
            </div>

            <div className="mx-auto mt-20 grid max-w-5xl gap-12 sm:grid-cols-3">
              <ProcessStep
                number={1}
                icon={Inbox}
                title="Capture"
                description="Brain dump everything. Web, mobile, Telegram, browser extension. Zero friction, all platforms."
                color="blue"
              />
              <ProcessStep
                number={2}
                icon={ArrowRightLeft}
                title="Process"
                description="AI suggests where each item belongs. Review and refine with a few clicks. No more decision fatigue."
                color="amber"
              />
              <ProcessStep
                number={3}
                icon={CalendarCheck}
                title="Commit"
                description="Schedule what matters. See only today's priorities. Complete with satisfaction."
                color="green"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need, nothing you don't
              </h2>
              <p className="mt-4 text-muted-foreground">
                Powerful features designed to reduce overwhelm, not add to it
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Sparkles}
                title="AI Processing"
                description="Smart categorization and scheduling suggestions based on your patterns"
                color="primary"
              />
              <FeatureCard
                icon={FolderOpen}
                title="Spaces & Projects"
                description="Organize by life areas. Work, personal, health - all in separate contexts"
                color="blue"
              />
              <FeatureCard
                icon={FileText}
                title="Rich Pages"
                description="Notion-like documents linked to your tasks for deeper thinking"
                color="violet"
              />
              <FeatureCard
                icon={Zap}
                title="Quick Capture"
                description="Telegram bot, browser extension, and mobile-first web app"
                color="amber"
              />
              <FeatureCard
                icon={Shield}
                title="Privacy First"
                description="Your data stays yours. Self-hostable. No ads, no tracking"
                color="emerald"
              />
              <FeatureCard
                icon={Clock}
                title="Time Blocking"
                description="Turn processed items into scheduled commitments"
                color="rose"
              />
            </div>
          </div>
        </section>

        {/* Built for Overthinkers */}
        <section className="border-y border-border/40 bg-muted/20 py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for overthinkers
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                If you have 47 browser tabs, 3 note apps, and constant anxiety about
                forgetting things - OffMind gives you a single place to dump everything
                and lets AI do the heavy lifting of organizing it all.
              </p>
              <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 mb-3">
                    <Inbox className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">Instant brain dump</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Capture from anywhere in under 2 seconds. Think it, capture it, forget it.</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">AI organizes for you</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Stop spending mental energy on categorization. AI suggests, you approve.</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 mb-3">
                    <CalendarCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">Focus on today</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Only see what you committed to. Everything else is safely stored away.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, honest pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start free. Upgrade when you're ready.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
              {/* Free Tier */}
              <div className="rounded-2xl border border-border/50 bg-card p-8">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="mt-2 text-sm text-muted-foreground">For getting started</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-3.5">
                  <PricingFeature>Up to 100 items</PricingFeature>
                  <PricingFeature>3 spaces</PricingFeature>
                  <PricingFeature>Basic AI suggestions</PricingFeature>
                  <PricingFeature>Web capture</PricingFeature>
                </ul>
                <Button asChild className="mt-8 w-full" variant="outline">
                  <Link href="/signup">Start Free</Link>
                </Button>
              </div>

              {/* Pro Tier */}
              <div className="relative rounded-2xl border-2 border-primary/50 bg-card p-8 shadow-lg shadow-primary/5">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-blue-400 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="mt-2 text-sm text-muted-foreground">For serious productivity</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-3.5">
                  <PricingFeature>Unlimited items</PricingFeature>
                  <PricingFeature>Unlimited spaces & projects</PricingFeature>
                  <PricingFeature>Advanced AI processing</PricingFeature>
                  <PricingFeature>Telegram & extension capture</PricingFeature>
                  <PricingFeature>API access</PricingFeature>
                  <PricingFeature>Priority support</PricingFeature>
                </ul>
                <Button asChild className="mt-8 w-full shadow-sm shadow-primary/20">
                  <Link href="/signup">Start 14-Day Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border/40 bg-muted/20 py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to clear your mind?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join the waitlist for early access and exclusive updates.
              </p>
              <WaitlistForm />
              <p className="mt-4 text-sm text-muted-foreground">
                Or{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  sign up now
                </Link>{' '}
                to start using OffMind today.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <OffMindLogo size={28} variant="full" />
            <p className="text-sm text-muted-foreground/60">
              Built with care for clarity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Process Step Component
function ProcessStep({
  number,
  icon: Icon,
  title,
  description,
  color,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'blue' | 'amber' | 'green';
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      glow: 'shadow-blue-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/10',
    },
    green: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/10',
    },
  };

  const c = colorClasses[color];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl border', c.bg, c.border, `shadow-lg ${c.glow}`)}>
          <Icon className={cn('h-7 w-7', c.text)} />
        </div>
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background shadow-sm">
          {number}
        </span>
      </div>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 transition-all duration-200 hover:border-border hover:shadow-sm card-hover">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', c.bg)}>
        <Icon className={cn('h-5 w-5', c.text)} />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

// Pricing Feature Component
function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
        <Check className="h-3 w-3 text-emerald-400" />
      </div>
      <span className="text-sm">{children}</span>
    </li>
  );
}
