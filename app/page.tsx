'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  Sparkles,
  FolderOpen,
  FileText,
  Shield,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  MessageSquare,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { cn } from '@/lib/utils';
import { trackCTAClicked, trackCheckoutStarted } from '@/lib/analytics/events';

/* =============================================================================
   OffMind Landing Page — "Precision Void" Aesthetic
   Zinc-black backgrounds, surgical teal accents, generous whitespace.
   Every element earns its place. Nothing decorative. Everything intentional.
============================================================================= */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 antialiased">
      {/* ================================================================
          NAVIGATION
      ================================================================ */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <OffMindLogo size={22} />
            <span className="text-[15px] font-semibold tracking-tight text-zinc-100">
              OffMind
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hidden sm:block text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hidden sm:block text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">
              Pricing
            </a>
            <Button
              asChild
              size="sm"
              className="rounded-lg bg-teal-500 text-zinc-950 hover:bg-teal-400 font-semibold text-[13px] shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
            >
              <a href="#pricing" onClick={() => trackCTAClicked('get_access', 'nav')}>
                Get Access
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ================================================================
            HERO
        ================================================================ */}
        <section className="relative overflow-hidden">
          {/* Teal beam — single vertical light source */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] opacity-[0.07]"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, #2dd4bf 0%, transparent 70%)',
            }}
          />
          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 sm:px-8 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-[13px] font-medium text-teal-400">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                Founding member access open
              </div>

              {/* Headline */}
              <h1
                className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.75rem]"
                style={{ letterSpacing: '-0.035em', lineHeight: '1.1' }}
              >
                Your mind captures everything.
                <br />
                <span className="text-teal-400">OffMind organizes it.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-zinc-400">
                You already have too many apps, too many tabs, and too many loose thoughts.
                OffMind is where they all go. AI figures out the rest.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-lg bg-teal-500 text-zinc-950 hover:bg-teal-400 font-semibold text-[15px] px-8 shadow-[0_0_30px_rgba(45,212,191,0.2)] transition-all hover:shadow-[0_0_40px_rgba(45,212,191,0.3)]"
                >
                  <a href="#pricing" onClick={() => trackCTAClicked('get_lifetime_access', 'hero')}>
                    Get Lifetime Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-lg border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-[15px]"
                >
                  <a href="#how-it-works" onClick={() => trackCTAClicked('see_how_it_works', 'hero')}>See How It Works</a>
                </Button>
              </div>

              <p className="mt-5 text-[13px] text-zinc-600">
                200 founding member spots. One-time payment. No subscription.
              </p>
            </div>

            {/* Product Preview */}
            <div className="mx-auto mt-16 sm:mt-24 max-w-4xl sm:max-w-5xl">
              <div
                className="relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-1.5"
                style={{ boxShadow: '0 0 60px rgba(45,212,191,0.04), 0 8px 40px rgba(0,0,0,0.4)' }}
              >
                <div className="rounded-lg border border-zinc-800/50 bg-zinc-950 overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <OffMindLogo size={16} />
                      <span className="text-[11px] text-zinc-600">getoffmind.com</span>
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/app-screenshot-today.png"
                    alt="OffMind app — Today view showing captured thoughts organized by AI"
                    className="w-full"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credibility strip */}
        <section className="border-y border-zinc-800/40 bg-zinc-900/30 py-4">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-8 text-[13px] text-zinc-600">
              <span>Built on the GTD methodology</span>
              <span className="hidden sm:inline text-zinc-800">|</span>
              <span>Powered by real AI</span>
              <span className="hidden sm:inline text-zinc-800">|</span>
              <span>Next.js + Supabase + Anthropic</span>
            </div>
          </div>
        </section>

        {/* ================================================================
            HOW IT WORKS
        ================================================================ */}
        <section id="how-it-works" className="py-20 sm:py-32 lg:py-36">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-teal-500">
                How it works
              </p>
              <h2
                className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                Three steps to a clear mind
              </h2>
              <p className="mt-4 text-[16px] text-zinc-400">
                Based on Getting Things Done. Simple enough for anyone, powerful enough for overthinkers.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-6">
              <WorkflowStep
                number={1}
                icon={Inbox}
                title="Capture"
                subtitle="Zero friction"
                description="Drop every thought into your inbox. Web app, desktop shortcut, Telegram bot, browser extension. No sorting, no organizing. Just dump and move on."
                color="teal"
              />
              <WorkflowStep
                number={2}
                icon={ArrowRightLeft}
                title="Organize"
                subtitle="AI-assisted"
                description="AI reads each item and suggests where it belongs — backlog, reference, someday, calendar. You review and approve with one click."
                color="amber"
              />
              <WorkflowStep
                number={3}
                icon={CalendarCheck}
                title="Commit"
                subtitle="Focus on today"
                description="Schedule only what matters today. Your committed tasks become your daily focus. Everything else stays organized in the background."
                color="emerald"
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURES
        ================================================================ */}
        <section className="border-y border-zinc-800/40 bg-zinc-900/20 py-20 sm:py-32 lg:py-36">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                Powerful where it matters.
                <br />
                <span className="text-zinc-500">Simple everywhere else.</span>
              </h2>
              <p className="mt-4 text-[16px] text-zinc-400">
                Every feature reduces decisions. Nothing adds complexity.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-3 sm:grid-cols-2">
              <FeatureCard
                icon={Sparkles}
                title="AI That Actually Helps"
                description="Smart destination suggestions, natural language processing, automatic date extraction. Not a gimmick — a real assistant that saves you dozens of micro-decisions daily."
              />
              <FeatureCard
                icon={FolderOpen}
                title="Spaces for Every Area"
                description="Work, personal, health, side projects. Each space has its own items, projects, and pages. Context switching without the mess."
              />
              <FeatureCard
                icon={FileText}
                title="Built-in Notes & Docs"
                description="Rich documents woven into your workflow. When a quick thought becomes something worth developing, it grows into a full page."
              />
              <FeatureCard
                icon={MessageSquare}
                title="Capture from Anywhere"
                description="Web app, desktop hotkey, Telegram bot, browser extension. Every channel feeds the same inbox. Capture in 2 seconds."
              />
              <FeatureCard
                icon={Shield}
                title="Private by Design"
                description="Your data is yours. No ads, no tracking, no selling your information. Encrypted storage with row-level security."
              />
              <FeatureCard
                icon={Clock}
                title="Time Blocking"
                description="Turn organized items into committed time blocks. See your day clearly — not your entire backlog. Google Calendar integration."
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            BUILDER CREDIBILITY — "Built by Paulo"
        ================================================================ */}
        <section className="py-20 sm:py-32 lg:py-36">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 sm:gap-10">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 ring-2 ring-teal-500/10">
                    <User className="h-10 w-10 text-zinc-500" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-teal-500">
                    Built by a real person
                  </p>
                  <h2
                    className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    I&apos;m Paulo. I built OffMind because I needed it.
                  </h2>
                  <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-zinc-400">
                    <p>
                      I&apos;m a Data & AI Senior Manager who thinks too much. I tried Notion, Todoist, Things, Obsidian, Apple Reminders, and a dozen others. None of them stuck because none of them understood the core problem: I don&apos;t need another place to organize. I need a system that captures instantly and organizes for me.
                    </p>
                    <p>
                      So I built one. OffMind runs on Next.js, Supabase, and real AI (not a wrapper around ChatGPT). It uses the GTD methodology because GTD works — it just never had the right software.
                    </p>
                    <p className="text-zinc-500">
                      Every founding member gets direct access to me. You&apos;re not buying from a company. You&apos;re backing a builder who uses this tool every single day.
                    </p>
                  </div>

                  {/* Tech credibility */}
                  <div className="mt-8 flex flex-wrap gap-2">
                    {['Next.js', 'TypeScript', 'Supabase', 'Anthropic AI', 'Stripe', 'Electron'].map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[12px] text-zinc-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PRICING — 3-tier Founding Member
        ================================================================ */}
        <section id="pricing" className="border-y border-zinc-800/40 bg-zinc-900/20 py-20 sm:py-32 lg:py-36">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-teal-500">
                Founding member pricing
              </p>
              <h2
                className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                Pay once. Use forever.
              </h2>
              <p className="mt-4 text-[16px] text-zinc-400">
                No subscriptions. No recurring charges. 200 total founding member spots.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3">
              {/* Starter */}
              <PricingCard
                name="Starter"
                price={49}
                spots={50}
                description="Everything you need to get started"
                features={[
                  'Full OffMind access',
                  'AI-powered organizing',
                  'All capture methods',
                  '1 year of updates',
                  'Community access',
                ]}
                plan="starter"
              />

              {/* Builder — highlighted */}
              <PricingCard
                name="Builder"
                price={79}
                spots={100}
                description="For people who think a lot"
                features={[
                  'Everything in Starter',
                  'Lifetime updates',
                  'Priority support',
                  'Direct access to Paulo',
                  'All future features',
                ]}
                plan="builder"
                highlighted
              />

              {/* Believer */}
              <PricingCard
                name="Believer"
                price={149}
                spots={50}
                description="Back the vision, shape the product"
                features={[
                  'Everything in Builder',
                  'All future products',
                  'Private Discord channel',
                  'Shape the roadmap',
                  'Founding member badge',
                ]}
                plan="believer"
              />
            </div>

            <p className="mx-auto mt-8 max-w-md text-center text-[13px] text-zinc-600">
              14-day money-back guarantee. If OffMind isn&apos;t for you, get a full refund.
            </p>
          </div>
        </section>

        {/* ================================================================
            FAQ
        ================================================================ */}
        <section className="py-20 sm:py-32 lg:py-36">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <h2
                className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                Questions
              </h2>
            </div>

            <div className="mx-auto max-w-2xl">
              <FAQItem
                question="How is OffMind different from Notion or Todoist?"
                answer="Notion is powerful but complex — it's a workspace, not a capture system. Todoist is simple but rigid. OffMind sits in the sweet spot: instant capture from anywhere, AI handles the organizing, and you only see what you committed to today. It's GTD done right."
              />
              <FAQItem
                question="What does the AI actually do?"
                answer="When you capture a thought, AI analyzes it and suggests which destination it belongs to — backlog, reference, someday, calendar, etc. It also extracts dates and priorities from natural language. 'Call dentist next Tuesday' becomes a scheduled task automatically. You always have the final say."
              />
              <FAQItem
                question="What's a 'founding member'?"
                answer="You're buying lifetime access at a locked-in price before we launch publicly. After these 200 spots fill up, OffMind will move to a subscription model ($9/month). Founding members keep lifetime access forever — no recurring fees, ever."
              />
              <FAQItem
                question="Can I import from other tools?"
                answer="Not yet. Import support for Todoist, Notion, and CSV is on the roadmap. As a founding member, you'll get it as soon as it ships."
              />
              <FAQItem
                question="Is my data private?"
                answer="Yes. Your data is stored in a Supabase PostgreSQL database with row-level security. We don't sell data, show ads, or use your content for AI training. Your thoughts stay yours."
              />
              <FAQItem
                question="What if I don't like it?"
                answer="14-day money-back guarantee, no questions asked. If OffMind doesn't work for you, email hello@getoffmind.com and you'll get a full refund."
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            FINAL CTA
        ================================================================ */}
        <section className="relative border-t border-zinc-800/40 overflow-hidden">
          {/* Teal glow from below */}
          <div
            className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-[400px] w-[600px] opacity-[0.05]"
            style={{
              background: 'radial-gradient(ellipse at 50% 100%, #2dd4bf 0%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-32 lg:py-36">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                Stop losing thoughts.
                <br />
                <span className="text-teal-400">Start getting them off your mind.</span>
              </h2>
              <p className="mt-5 text-[16px] text-zinc-400">
                200 founding member spots. Once they&apos;re gone, it&apos;s subscription only.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="rounded-lg bg-teal-500 text-zinc-950 hover:bg-teal-400 font-semibold text-[15px] px-10 shadow-[0_0_30px_rgba(45,212,191,0.2)] transition-all hover:shadow-[0_0_40px_rgba(45,212,191,0.3)]"
                >
                  <a href="#pricing" onClick={() => trackCTAClicked('get_lifetime_access', 'final_cta')}>
                    Get Lifetime Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/40 py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <OffMindLogo size={18} />
              <span className="text-[14px] font-semibold tracking-tight text-zinc-400">OffMind</span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-zinc-600">
              <a href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-zinc-400 transition-colors">Terms</a>
              <a
                href="https://x.com/compoundbuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-400 transition-colors"
              >
                @compoundbuilder
              </a>
            </div>
            <p className="text-[13px] text-zinc-700">
              &copy; 2026 OffMind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   Workflow Step Component
============================================================================= */
function WorkflowStep({
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
  color: 'teal' | 'amber' | 'emerald';
}) {
  const colorMap = {
    teal: {
      iconBg: 'bg-teal-500/10',
      iconText: 'text-teal-400',
      border: 'border-teal-500/20',
      badge: 'bg-teal-500 text-zinc-950',
      subtitleText: 'text-teal-400',
    },
    amber: {
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-400',
      border: 'border-amber-500/20',
      badge: 'bg-amber-500 text-zinc-950',
      subtitleText: 'text-amber-400',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
      border: 'border-emerald-500/20',
      badge: 'bg-emerald-500 text-zinc-950',
      subtitleText: 'text-emerald-400',
    },
  };

  const c = colorMap[color];

  return (
    <div className="flex flex-col items-center text-center group">
      <div className="relative mb-6">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105',
            c.iconBg,
            c.border,
          )}
        >
          <Icon className={cn('h-7 w-7', c.iconText)} />
        </div>
        <span
          className={cn(
            'absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
            c.badge,
          )}
        >
          {number}
        </span>
      </div>
      <h3
        className="text-xl font-bold text-zinc-50"
        style={{ letterSpacing: '-0.02em' }}
      >
        {title}
      </h3>
      <span className={cn('mt-1 text-[13px] font-medium', c.subtitleText)}>
        {subtitle}
      </span>
      <p className="mt-3 text-[14px] leading-relaxed text-zinc-500 max-w-xs">
        {description}
      </p>
    </div>
  );
}

/* =============================================================================
   Feature Card Component
============================================================================= */
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
    <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 transition-colors group-hover:bg-teal-500/10">
        <Icon className="h-5 w-5 text-zinc-500 transition-colors group-hover:text-teal-400" />
      </div>
      <h3
        className="mt-4 text-[16px] font-semibold text-zinc-100"
        style={{ letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}

/* =============================================================================
   Pricing Card Component
============================================================================= */
function PricingCard({
  name,
  price,
  spots,
  description,
  features,
  plan,
  highlighted = false,
}: {
  name: string;
  price: number;
  spots: number;
  description: string;
  features: string[];
  plan: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border p-6 sm:p-8 transition-all duration-300',
        highlighted
          ? 'border-teal-500/30 bg-zinc-900/60 shadow-[0_0_40px_rgba(45,212,191,0.06)]'
          : 'border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700',
        highlighted ? 'order-first sm:order-none' : '',
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-950">
          Most Popular
        </div>
      )}

      <h3 className="text-lg font-bold text-zinc-100">{name}</h3>
      <p className="mt-1 text-[13px] text-zinc-500">{description}</p>

      <div className="mt-5">
        <span
          className="text-4xl font-bold tracking-tight text-zinc-50"
          style={{ letterSpacing: '-0.03em' }}
        >
          ${price}
        </span>
        <span className="ml-1 text-[14px] text-zinc-500">one-time</span>
      </div>
      <p className="mt-1.5 text-[12px] text-teal-500 font-medium">
        {spots} founding spots
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/10">
              <Check className="h-3 w-3 text-teal-400" />
            </div>
            <span className="text-[14px] text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        className={cn(
          'mt-8 w-full rounded-lg font-semibold text-[14px] transition-all',
          highlighted
            ? 'bg-teal-500 text-zinc-950 hover:bg-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.15)] hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]'
            : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-50',
        )}
        onClick={async () => {
          try {
            trackCTAClicked(`get_${plan}_access`, 'pricing');
            trackCheckoutStarted(plan);
            const res = await fetch('/api/stripe/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
            } else if (res.status === 401) {
              window.location.href = `/signup?plan=${plan}`;
            }
          } catch {
            window.location.href = `/signup?plan=${plan}`;
          }
        }}
      >
        Get {name} Access
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

/* =============================================================================
   FAQ Item Component
============================================================================= */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-zinc-800/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-semibold text-zinc-200 pr-4 group-hover:text-zinc-50 transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-zinc-600" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] leading-relaxed text-zinc-500">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
