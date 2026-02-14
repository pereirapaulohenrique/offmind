'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Leaf,
  Heart,
  ChevronDown,
  Globe,
  MessageSquare,
  Chrome,
  Smartphone,
  Monitor,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistForm } from '@/components/marketing/WaitlistForm';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background bloom-surface">
      {/* Navigation */}
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
            <Button
              asChild
              className="rounded-xl shadow-md tactile-press text-sm sm:text-base"
              style={{ background: 'var(--gradient-accent)', border: 'none' }}
            >
              <a href="#waitlist">
                <span className="hidden sm:inline">Join Waitlist</span>
                <span className="sm:hidden">Waitlist</span>
                <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4" />
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

          <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-28 lg:py-40 lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              {/* Warm pill badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-5 py-2 text-sm font-medium text-[var(--accent-hover)]">
                <Sparkles className="h-4 w-4" />
                AI-powered productivity for busy minds
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl title-glow" style={{ letterSpacing: '-0.03em', lineHeight: '1.08' }}>
                Your brain is for
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #c2410c, #ea580c, #f59e0b)' }}
                >
                  thinking.
                </span>
                <br />
                <span className="text-muted-foreground">Not for storage.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground" style={{ fontSize: '1.125rem' }}>
                Dump every thought, task, and idea into OffMind. AI suggests where each one belongs.
                You only see what you committed to today.
              </p>

              {/* CTAs */}
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="gap-2.5 rounded-xl px-8 shadow-lg tactile-press text-base font-semibold w-full sm:w-auto"
                  style={{ background: 'var(--gradient-accent)', border: 'none', boxShadow: '0 4px 20px rgba(194,65,12,0.25), 0 1px 3px rgba(194,65,12,0.15)' }}
                >
                  <a href="#waitlist">
                    Join the Waitlist
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-[var(--border-default)] bg-[var(--bg-surface)]/50 text-base text-foreground hover:bg-[var(--bg-hover)] tactile-press w-full sm:w-auto"
                >
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>

              <p className="mt-6 text-sm text-[var(--text-muted)]">
                Launching soon. Early supporters get lifetime access.
              </p>
            </div>

            {/* Product Preview — app screenshot */}
            <div className="mx-auto mt-16 sm:mt-24 max-w-4xl sm:max-w-5xl">
              <div
                className="relative rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)]/80 p-2 bloom-warm"
                style={{ boxShadow: '0 8px 40px rgba(80,50,20,0.15), 0 2px 8px rgba(80,50,20,0.08), 0 0 0 1px rgba(196,145,100,0.06)' }}
              >
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden">
                  {/* Browser chrome */}
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

        {/* ================================================================
            CREDIBILITY STRIP — text only, no background, no icons
        ================================================================ */}
        <section className="py-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6 text-sm text-foreground/60">
              <span>Built on the GTD methodology</span>
              <span className="hidden sm:inline text-[var(--border-default)]">&middot;</span>
              <span>Powered by AI</span>
              <span className="hidden sm:inline text-[var(--border-default)]">&middot;</span>
              <span>Made by an indie developer</span>
            </div>
          </div>
        </section>

        {/* ================================================================
            HOW IT WORKS — Capture, Organize, Commit (Tier 1: rich icons)
        ================================================================ */}
        <section id="how-it-works" className="border-y border-[var(--border-subtle)] bg-[var(--bg-inset)] py-16 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--sage-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--sage)]">
                <Leaf className="h-3.5 w-3.5" />
                How it works
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Three steps to a clear mind
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Built on the proven GTD methodology. Simple enough for anyone, powerful enough for overthinkers.
              </p>
            </div>

            <div className="mx-auto mt-20 grid max-w-5xl gap-12 sm:gap-8 sm:grid-cols-3">
              <WorkflowStep
                number={1}
                icon={Inbox}
                title="Capture"
                subtitle="Zero friction"
                description="Drop every thought, idea, and task into your inbox. No organizing, no sorting — just get it out of your head and move on."
                color="capture"
              />
              <WorkflowStep
                number={2}
                icon={ArrowRightLeft}
                title="Organize"
                subtitle="AI-assisted"
                description="AI suggests where each item belongs — backlog, reference, someday, calendar. Review the suggestions, approve with one click."
                color="process"
              />
              <WorkflowStep
                number={3}
                icon={CalendarCheck}
                title="Commit"
                subtitle="Focus on today"
                description="Schedule only what matters today. Your committed tasks become your daily focus. Everything else stays organized in the background."
                color="commit"
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            CAPTURE FROM ANYWHERE (Tier 2: monochrome icons)
        ================================================================ */}
        <section className="py-16 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--accent-hover)]">
                <Zap className="h-3.5 w-3.5" />
                Zero friction capture
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Capture from anywhere.
                <br />
                <span className="text-muted-foreground">Literally anywhere.</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                A thought should never be lost because you weren&apos;t at your desk.
                OffMind meets you wherever your ideas happen.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-4xl grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              <CaptureMethodCard
                icon={Globe}
                title="Web App"
                description="Full-featured app in your browser. Works on any device."
                status="available"
              />
              <CaptureMethodCard
                icon={MessageSquare}
                title="Telegram Bot"
                description="Send a message to @OffMindBot. Instantly captured."
                status="available"
              />
              <CaptureMethodCard
                icon={Chrome}
                title="Browser Extension"
                description="Capture thoughts, save tabs, clip pages. One click."
                status="coming"
              />
              <CaptureMethodCard
                icon={Smartphone}
                title="Mobile App"
                description="Native iOS & Android. Capture on the go."
                status="coming"
              />
              <CaptureMethodCard
                icon={Monitor}
                title="Desktop App"
                description="Global hotkey. Capture without switching windows."
                status="available"
              />
              <CaptureMethodCard
                icon={Mail}
                title="Email to Inbox"
                description="Forward any email. It becomes a task automatically."
                status="coming"
              />
            </div>

            <p className="mx-auto mt-8 max-w-xl text-center text-sm text-[var(--text-muted)]">
              Every capture method sends to the same inbox. Process once, from anywhere.
            </p>
          </div>
        </section>

        {/* ================================================================
            PROBLEM VALIDATION STRIP — research-backed stats
        ================================================================ */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl grid grid-cols-3 gap-4 sm:gap-8 text-center">
              <div>
                <p className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>1,200+</p>
                <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">Thoughts per week for the average knowledge worker</p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>60%</p>
                <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">Are potentially actionable — but never acted on</p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--accent-hover)]" style={{ letterSpacing: '-0.03em' }}>&infin;</p>
                <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">Lost without a system that captures them all</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURES — 2-column cards (Tier 2: monochrome icons)
        ================================================================ */}
        <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-inset)] py-16 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Powerful where it matters.
                <br />
                <span className="text-muted-foreground">Simple everywhere else.</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Every feature is designed to reduce decisions, not add to them
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:gap-5 sm:grid-cols-2">
              <FeatureCard
                icon={Sparkles}
                title="AI That Actually Helps"
                description="Smart suggestions for where each thought belongs. Not a gimmick — a real assistant that saves you dozens of micro-decisions every day."
              />
              <FeatureCard
                icon={FolderOpen}
                title="Spaces for Every Area of Life"
                description="Organize by context — work, personal, health, side projects. Each space keeps its own items, projects, and pages."
              />
              <FeatureCard
                icon={FileText}
                title="Built-in Notes & Docs"
                description="Rich documents woven into your tasks. For when a quick thought turns into something worth developing."
              />
              <FeatureCard
                icon={MessageSquare}
                title="Natural Language Input"
                description="Type naturally. AI extracts dates, priorities, and context from your words. 'Call dentist next Tuesday' becomes a scheduled task automatically."
              />
              <FeatureCard
                icon={Shield}
                title="Your Thoughts, Your Privacy"
                description="Your data is yours alone. No ads, no tracking, no selling your information. Private by design."
              />
              <FeatureCard
                icon={Clock}
                title="Time Blocking That Works"
                description="Turn organized items into committed time blocks on your calendar. See your day clearly — not your entire backlog."
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            BUILT FOR OVERTHINKERS — Merged with personas
        ================================================================ */}
        <section className="py-16 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--lavender-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--lavender)]">
                <Heart className="h-3.5 w-3.5" />
                Built with care
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                You&apos;re not disorganized.
                <br />
                <span className="text-muted-foreground">You just think a lot.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground" style={{ fontSize: '1.125rem' }}>
                If you have 47 browser tabs open, three different note apps, and a constant
                low hum of anxiety about forgetting something important — you&apos;re not broken.
                You just need a better system.
              </p>

              {/* Persona lines — identification-based social proof */}
              <div className="mt-10 mx-auto max-w-2xl space-y-3 text-left">
                <PersonaLine text="Have 50 tabs open and still feel like they're forgetting something" />
                <PersonaLine text="Have tried Notion, Todoist, Things, and Apple Reminders — and none stuck" />
                <PersonaLine text="Get their best ideas at the worst times" />
                <PersonaLine text="Know about GTD but never found a tool that makes it effortless" />
                <PersonaLine text="Spend more time organizing their system than actually doing things" />
                <PersonaLine text="Start every Monday with a fresh plan that falls apart by Wednesday" />
              </div>

              {/* Resolution cards — no icons (Tier 3) */}
              <div className="mt-12 grid grid-cols-1 gap-4 sm:gap-5 text-left sm:grid-cols-3">
                <div className="bloom-card p-6 inner-light">
                  <p className="text-foreground font-semibold mb-2">Instant brain dump</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Capture from anywhere in under 2 seconds. Think it, capture it, let it go. Your mind is free to do what it does best.
                  </p>
                </div>
                <div className="bloom-card p-6 inner-light">
                  <p className="text-foreground font-semibold mb-2">AI handles the sorting</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Stop spending mental energy on categorization. AI suggests where each thought belongs. You just approve.
                  </p>
                </div>
                <div className="bloom-card p-6 inner-light">
                  <p className="text-foreground font-semibold mb-2">Focus on today</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Only see what you committed to today. Everything else is safely organized in the background.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PRICING — 3-column: Free Trial, Pro, Lifetime (no icon headers)
        ================================================================ */}
        <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-inset)] py-16 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Simple, honest pricing
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Try everything free for 14 days. No credit card required.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
              {/* Free Trial */}
              <div className="bloom-card p-6 sm:p-8 inner-light flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-foreground">Free Trial</h3>
                <p className="text-sm text-muted-foreground">Full access for 14 days</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>$0</span>
                  <span className="text-muted-foreground"> for 14 days</span>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  <PricingFeature>All features included</PricingFeature>
                  <PricingFeature>Unlimited items</PricingFeature>
                  <PricingFeature>AI suggestions</PricingFeature>
                  <PricingFeature>No credit card required</PricingFeature>
                </ul>
                <Button
                  asChild
                  className="mt-8 w-full rounded-xl tactile-press"
                  variant="outline"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  <a href="#waitlist">Join Waitlist</a>
                </Button>
              </div>

              {/* Pro */}
              <div className="bloom-card p-6 sm:p-8 inner-light flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-foreground">Pro</h3>
                <p className="text-sm text-muted-foreground">For individuals who think a lot</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>$7</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">or $59/year (save 30%)</p>
                <ul className="mt-8 space-y-4 flex-1">
                  <PricingFeature>Everything in trial</PricingFeature>
                  <PricingFeature>Unlimited items & spaces</PricingFeature>
                  <PricingFeature>Advanced AI processing</PricingFeature>
                  <PricingFeature>All capture methods</PricingFeature>
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
                  <a href="#waitlist">
                    Join Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Lifetime — highlighted */}
              <div className="relative gradient-border p-6 sm:p-8 inner-light flex flex-col order-first sm:order-last" style={{ boxShadow: 'var(--shadow-glow)' }}>
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 bloom-accent px-5 py-1.5 text-xs font-bold tracking-wide"
                  style={{ boxShadow: '0 4px 12px rgba(194,65,12,0.25)' }}
                >
                  EARLY BIRD
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Lifetime</h3>
                <p className="text-sm text-muted-foreground">Pay once, use forever</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>$39</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--accent-hover)]">Only 100 spots available</p>
                <ul className="mt-8 space-y-4 flex-1">
                  <PricingFeature>Everything in Pro</PricingFeature>
                  <PricingFeature>All future updates</PricingFeature>
                  <PricingFeature>Lifetime access forever</PricingFeature>
                  <PricingFeature>Direct access to the developer</PricingFeature>
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
                  <a href="#waitlist">
                    Claim Your Spot
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            FAQ — no background, no border
        ================================================================ */}
        <section className="py-16 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                Questions?
              </h2>
            </div>

            <div className="mx-auto max-w-2xl">
              <FAQItem
                question="How is OffMind different from Notion or Todoist?"
                answer="Notion is powerful but complex — it's a workspace, not a task system. Todoist is simple but rigid. OffMind sits in the sweet spot: a fast, flexible system built on GTD principles where AI handles the organizing so you can focus on doing."
              />
              <FAQItem
                question="What does the AI actually do?"
                answer="When you capture a thought, AI analyzes it and suggests which category it belongs to — your backlog, reference material, a someday idea, your calendar, etc. It also extracts dates and priorities from natural language. You always have final say; AI just saves you the mental effort."
              />
              <FAQItem
                question="What happens after the free trial?"
                answer="After 14 days, you choose a plan to continue. Your data is never deleted — if you don't subscribe, you keep read-only access. We'll also offer a generous lifetime deal for early supporters."
              />
              <FAQItem
                question="Can I import from other tools?"
                answer="Not yet, but it's on our roadmap. We're building import support for Todoist, Notion, and CSV files."
              />
              <FAQItem
                question="Is my data private and secure?"
                answer="Yes. Your data is stored securely and encrypted. We don't sell your data, show ads, or use your content for AI training. Your thoughts are yours alone."
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            CTA + WAITLIST
        ================================================================ */}
        <section id="waitlist" className="relative border-t border-[var(--border-subtle)] overflow-hidden">
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

          <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-28 lg:py-36 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--accent-hover)]">
                <Sparkles className="h-3.5 w-3.5" />
                Early access
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl title-glow" style={{ letterSpacing: '-0.02em' }}>
                Be among the first to try OffMind
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Join the waitlist for launch-day access. Early supporters will get an exclusive lifetime deal.
              </p>
              <WaitlistForm />
              <WaitlistCounter />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-subtle)]">
                <OffMindLogo size={20} />
              </div>
              <span className="font-semibold tracking-tight text-foreground">OffMind</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
              <a href="#" className="hover:text-muted-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-muted-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-muted-foreground transition-colors">Twitter/X</a>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              &copy; 2026 OffMind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   Workflow Step Component — Capture, Organize, Commit (Tier 1: rich icons)
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
  color: 'capture' | 'process' | 'commit';
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
      <h3 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>{title}</h3>
      <span className={cn('mt-1 text-sm font-medium', c.text)}>{subtitle}</span>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}

/* =============================================================================
   Capture Method Card Component (Tier 2: monochrome icons)
============================================================================= */
function CaptureMethodCard({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status: 'available' | 'coming';
}) {
  return (
    <div className="bloom-card p-5 sm:p-6 inner-light relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
          <Icon className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        {status === 'available' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--layer-commit-bg)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--layer-commit)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--layer-commit)]" />
            Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-hover)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-foreground" style={{ letterSpacing: '-0.01em' }}>{title}</h3>
      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

/* =============================================================================
   Feature Card Component — monochrome icons (Tier 2)
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
    <div className="bloom-card p-8 inner-light card-hover">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-hover)]">
        <Icon className="h-6 w-6 text-[var(--text-muted)]" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-foreground" style={{ letterSpacing: '-0.01em' }}>{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

/* =============================================================================
   Persona Line Component — "Built for people who..."
============================================================================= */
function PersonaLine({ text }: { text: string }) {
  return (
    <p className="text-muted-foreground leading-relaxed">
      <span className="text-[var(--accent-hover)] mr-2">&mdash;</span>
      {text}
    </p>
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
      <span className="text-sm text-foreground">{children}</span>
    </li>
  );
}

/* =============================================================================
   FAQ Item Component — Animated accordion
============================================================================= */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold text-foreground pr-4">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />
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
            <p className="pb-5 text-sm leading-relaxed text-foreground/70">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =============================================================================
   Waitlist Counter Component — Shows social proof
============================================================================= */
function WaitlistCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(() => {});
  }, []);

  if (count === null || count < 3) return null;

  return (
    <p className="mt-4 text-sm text-[var(--text-muted)]">
      {count} {count === 1 ? 'person has' : 'people have'} joined the waitlist
    </p>
  );
}
