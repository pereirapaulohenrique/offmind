import Link from 'next/link';
import {
  Brain,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MindBase</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 sm:py-32">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center rounded-full border bg-muted px-4 py-1 text-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              AI-Powered GTD System
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Clear your mind.
              <br />
              <span className="text-primary">Own your day.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              MindBase is the calm productivity system for overthinkers. Capture everything,
              let AI help you organize, and commit only to what matters.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/signup">
                  Start Free Trial
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              14-day free trial. No credit card required.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-y border-border bg-muted/30 py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three simple steps to productivity peace
              </h2>
              <p className="mt-4 text-muted-foreground">
                Based on the proven GTD methodology, enhanced with AI for the modern age
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-3">
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
                color="purple"
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
        <section className="py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need, nothing you don't
              </h2>
              <p className="mt-4 text-muted-foreground">
                Powerful features designed to reduce overwhelm, not add to it
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Sparkles}
                title="AI Processing"
                description="Smart categorization and scheduling suggestions based on your patterns"
              />
              <FeatureCard
                icon={FolderOpen}
                title="Spaces & Projects"
                description="Organize by life areas. Work, personal, health - all in separate contexts"
              />
              <FeatureCard
                icon={FileText}
                title="Rich Pages"
                description="Notion-like documents linked to your tasks for deeper thinking"
              />
              <FeatureCard
                icon={Zap}
                title="Quick Capture"
                description="Telegram bot, browser extension, and mobile-first web app"
              />
              <FeatureCard
                icon={Shield}
                title="Privacy First"
                description="Your data stays yours. Self-hostable. No ads, no tracking"
              />
              <FeatureCard
                icon={Clock}
                title="Time Blocking"
                description="Turn processed items into scheduled commitments"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Placeholder */}
        <section className="border-y border-border bg-muted/30 py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for overthinkers
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                "I used to have 47 browser tabs, 3 note apps, and constant anxiety about forgetting things.
                MindBase gave me a single place to dump everything and the AI does the heavy lifting
                of organizing it all. I finally feel in control."
              </p>
              <p className="mt-4 font-medium">
                - The Developer (and first user)
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, honest pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start free. Upgrade when you're ready.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
              {/* Free Tier */}
              <div className="rounded-xl border border-border bg-card p-8">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="mt-2 text-muted-foreground">For getting started</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
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
              <div className="relative rounded-xl border-2 border-primary bg-card p-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="mt-2 text-muted-foreground">For serious productivity</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <PricingFeature>Unlimited items</PricingFeature>
                  <PricingFeature>Unlimited spaces & projects</PricingFeature>
                  <PricingFeature>Advanced AI processing</PricingFeature>
                  <PricingFeature>Telegram & extension capture</PricingFeature>
                  <PricingFeature>API access</PricingFeature>
                  <PricingFeature>Priority support</PricingFeature>
                </ul>
                <Button asChild className="mt-8 w-full">
                  <Link href="/signup">Start 14-Day Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to clear your mind?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of overthinkers who found their calm.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">MindBase</span>
            </div>
            <p className="text-sm text-muted-foreground">
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
  color: 'blue' | 'purple' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    green: 'bg-green-500/10 text-green-500',
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', colorClasses[color])}>
          <Icon className="h-8 w-8" />
        </div>
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          {number}
        </span>
      </div>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Pricing Feature Component
function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-primary" />
      <span className="text-sm">{children}</span>
    </li>
  );
}
