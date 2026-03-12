'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  Sparkles,
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
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/landing/ScrollReveal';
import { GlowCard } from '@/components/landing/GlowCard';
import { GradientText } from '@/components/landing/GradientText';

/* =============================================================================
   OffMind Landing Page — Premium Revision v2

   Typography: Satoshi (display/headlines) + Geist Sans (body/UI)
   Visual: transparent nav, scroll-triggered bg, hero grid, section alternation
   Buttons: rounded-lg (rectangular), not rounded-full (pill)
============================================================================= */

const BG_DARK = 'bg-[#09090b]';
const BG_ALT = 'bg-[#0c0c10]';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-zinc-50 antialiased">
      {/* ================================================================
          NAVIGATION — transparent, scroll-triggered background
      ================================================================ */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-[#09090b]/80 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.04)]'
            : 'bg-transparent',
        )}
      >
        <nav className="flex h-16 items-center px-5 sm:px-8 lg:px-12">
          {/* Logo — far left */}
          <div className="flex flex-1 items-center">
            <Link href="/" className="flex items-center gap-0.5">
              <OffMindLogo size={32} />
              <span className="font-satoshi text-[17px] font-medium tracking-[0.08em] text-zinc-100">
                offmind
              </span>
            </Link>
          </div>

          {/* Center links */}
          <div className="hidden items-center gap-8 sm:flex">
            <a
              href="#how-it-works"
              className="text-[14px] text-zinc-300 transition-colors hover:text-white"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-[14px] text-zinc-300 transition-colors hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-[14px] text-zinc-300 transition-colors hover:text-white"
            >
              Pricing
            </a>
          </div>

          {/* CTA — far right, rectangular */}
          <div className="flex flex-1 items-center justify-end">
            <Button
              asChild
              size="sm"
              className="rounded-md bg-teal-500 text-zinc-950 hover:bg-teal-400 font-semibold text-[13px] shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
            >
              <a href="#pricing" onClick={() => trackCTAClicked('get_access', 'nav')}>
                Get Access
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ================================================================
            HERO — Satoshi display, grid background, deep ambient glow
        ================================================================ */}
        <section className={cn('relative overflow-hidden', BG_DARK)}>
          {/* Ambient depth — teal glow top center */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[900px] w-[1200px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 20%, rgba(45,212,191,0.07) 0%, rgba(45,212,191,0.03) 40%, transparent 70%)',
            }}
          />
          {/* Ambient depth — secondary glow offset right */}
          <div
            className="pointer-events-none absolute right-0 top-20 h-[600px] w-[600px]"
            style={{
              background:
                'radial-gradient(circle at 70% 30%, rgba(45,212,191,0.04) 0%, transparent 60%)',
            }}
          />
          {/* Noise texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 pt-24 pb-14 sm:px-8 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.4fr,1fr] lg:gap-16">
              {/* Left column — editorial text with Satoshi */}
              <div>
                {/* Founding member — clean typographic treatment */}
                <ScrollReveal>
                  <p className="mb-8 text-[13px] font-medium tracking-wide text-teal-500/70">
                    200 founding member spots available
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                  <h1
                    className="font-satoshi text-[2.75rem] font-medium text-zinc-50 sm:text-6xl lg:text-7xl"
                    style={{ letterSpacing: '0.01em', lineHeight: '1.12' }}
                  >
                    Your mind has too many{' '}
                    <GradientText>tabs open.</GradientText>
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <p
                    className="mt-7 max-w-lg text-[17px] text-zinc-400"
                    style={{ lineHeight: '1.8', letterSpacing: '0.01em' }}
                  >
                    OffMind captures everything, organizes when you're ready,
                    and makes sure nothing goes to waste.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.3}>
                  <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-md bg-teal-500 text-zinc-950 hover:bg-teal-400 font-semibold text-[15px] px-8 shadow-[0_0_30px_rgba(45,212,191,0.2)] transition-all hover:shadow-[0_0_40px_rgba(45,212,191,0.3)]"
                    >
                      <a
                        href="#pricing"
                        onClick={() => trackCTAClicked('get_lifetime_access', 'hero')}
                      >
                        Get Lifetime Access
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="rounded-md border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100 text-[15px]"
                    >
                      <a
                        href="#how-it-works"
                        onClick={() => trackCTAClicked('see_how_it_works', 'hero')}
                      >
                        See How It Works
                      </a>
                    </Button>
                  </div>

                  <p className="mt-5 text-[13px] text-zinc-600">
                    One-time payment. No subscription. 14-day refund guarantee.
                  </p>
                </ScrollReveal>
              </div>

              {/* Right column — Product screenshot with fade mask */}
              <ScrollReveal delay={0.2} y={32}>
                <div
                  className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-sm"
                  style={{
                    boxShadow:
                      '0 1px 3px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.4), 0 0 80px rgba(45,212,191,0.04)',
                  }}
                >
                  <div className="rounded-xl border border-white/[0.04] bg-[#09090b] overflow-hidden">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <OffMindLogo size={14} />
                        <span className="text-[11px] text-zinc-600">getoffmind.com</span>
                      </div>
                    </div>
                    {/* Screenshot with bottom fade */}
                    <div
                      style={{
                        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                      }}
                    >
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
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Proof strip */}
        <section className={cn('py-8', BG_DARK)}>
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-10 text-[13px] text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-teal-500/40" />
                Capture in under 3 seconds
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-teal-500/40" />
                AI suggests, you decide
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-teal-500/40" />
                Pay once, own forever
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================
            HOW IT WORKS — Alt background
        ================================================================ */}
        <section id="how-it-works" className={cn('relative py-28 sm:py-36 lg:py-40', BG_ALT)}>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{ background: 'linear-gradient(to bottom, #09090b, transparent)' }}
          />

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-teal-500/70">
                  How it works
                </p>
                <h2
                  className="font-satoshi text-3xl font-medium text-zinc-50 sm:text-[2.75rem]"
                  style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                >
                  Three steps to a clear mind
                </h2>
                <p className="mt-5 text-[16px] text-zinc-400">
                  Capture first, organize later. Nothing gets lost.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer
              className="mx-auto mt-20 grid max-w-5xl gap-16 sm:gap-20"
              stagger={0.15}
            >
              <StaggerItem>
                <WorkflowStep
                  number={1}
                  icon={Inbox}
                  title="Capture"
                  subtitle="Zero friction"
                  description="Grab any thought in seconds. Idea, task, question, half-formed insight. No choosing a folder. No picking a database. Just capture and move on."
                  accentColor="blue"
                  accentClasses={{
                    iconBg: 'bg-blue-500/10',
                    iconText: 'text-blue-400',
                    border: 'border-blue-500/15',
                    badge: 'bg-blue-500 text-white',
                    subtitle: 'text-blue-400/80',
                    line: 'from-blue-500/20',
                  }}
                />
              </StaggerItem>

              <StaggerItem>
                <WorkflowStep
                  number={2}
                  icon={ArrowRightLeft}
                  title="Route"
                  subtitle="AI-assisted"
                  description="When you're ready, route items to destinations that match their nature. Backlog, Schedule, Questions, Reference, or custom. AI suggests, you decide with one tap."
                  accentColor="amber"
                  accentClasses={{
                    iconBg: 'bg-amber-500/10',
                    iconText: 'text-amber-400',
                    border: 'border-amber-500/15',
                    badge: 'bg-amber-500 text-zinc-950',
                    subtitle: 'text-amber-400/80',
                    line: 'from-amber-500/20',
                  }}
                />
              </StaggerItem>

              <StaggerItem>
                <WorkflowStep
                  number={3}
                  icon={CalendarCheck}
                  title="Compound"
                  subtitle="Nothing dies"
                  description="Routed items grow. A thought becomes a task, a task joins a project, a project evolves into rich pages. Weekly review surfaces what you forgot. Nothing stays buried."
                  accentColor="emerald"
                  accentClasses={{
                    iconBg: 'bg-emerald-500/10',
                    iconText: 'text-emerald-400',
                    border: 'border-emerald-500/15',
                    badge: 'bg-emerald-500 text-zinc-950',
                    subtitle: 'text-emerald-400/80',
                    line: 'from-emerald-500/20',
                  }}
                />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ================================================================
            FEATURES — Glass cards, ambient glow
        ================================================================ */}
        <section id="features" className={cn('relative py-28 sm:py-36 lg:py-40', BG_DARK)}>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(45,212,191,0.03) 0%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2
                  className="font-satoshi text-3xl font-medium text-zinc-50 sm:text-[2.75rem]"
                  style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                >
                  Powerful where it matters.
                  <br />
                  <span className="text-zinc-500">Simple everywhere else.</span>
                </h2>
                <p className="mt-5 text-[16px] text-zinc-400">
                  Every feature reduces decisions. Nothing adds complexity.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer
              className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2"
              stagger={0.1}
            >
              <StaggerItem>
                <FeatureCard
                  icon={Sparkles}
                  title="AI That Helps, Never Takes Over"
                  description="Suggests where to route items, breaks down tasks, clusters related thoughts. Every action needs your say-so. The AI proposes, you decide."
                />
              </StaggerItem>
              <StaggerItem>
                <FeatureCard
                  icon={MessageSquare}
                  title="Capture from Anywhere"
                  description="Web app, desktop shortcut, Telegram bot, browser extension. Every channel feeds the same inbox. Capture in under 3 seconds."
                />
              </StaggerItem>
              <StaggerItem>
                <FeatureCard
                  icon={Shield}
                  title="Own Your Thinking"
                  description="Your data is yours. No ads, no tracking, no training AI on your thoughts. One-time payment means you're the customer, not the product."
                />
              </StaggerItem>
              <StaggerItem>
                <FeatureCard
                  icon={Clock}
                  title="Weekly Review"
                  description="A guided review that surfaces forgotten items, stale captures, and unprocessed thoughts. Nothing stays buried. Everything gets its moment."
                />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ================================================================
            BUILDER CREDIBILITY
        ================================================================ */}
        <section className={cn('relative py-28 sm:py-36 lg:py-40', BG_ALT)}>
          <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 sm:gap-10">
                  <div className="flex-shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06]">
                      <User className="h-10 w-10 text-zinc-600" />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-teal-500/70">
                      Built by a real person
                    </p>
                    <h2
                      className="font-satoshi text-2xl font-medium text-zinc-50 sm:text-3xl"
                      style={{ letterSpacing: '-0.02em', lineHeight: '1.15' }}
                    >
                      I&apos;m Paulo. I built OffMind because I needed it.
                    </h2>
                    <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-zinc-400">
                      <p>
                        I&apos;m a Data & AI leader who juggles work, a side business,
                        and a mind with too many tabs open. I tried Notion, Obsidian,
                        Apple Notes, Todoist. None of them understood the core problem:
                        I think first, organize later. I need to capture in two seconds,
                        not two minutes of choosing a database.
                      </p>
                      <p>
                        So I built the tool I always needed. OffMind captures instantly,
                        routes when I&apos;m ready, and makes sure nothing I think goes to waste.
                        Backed by real AI that helps but never acts without asking.
                      </p>
                      <p className="text-zinc-500">
                        Every founding member gets direct access to me.
                        You&apos;re not buying from a company. You&apos;re
                        backing a builder who uses this tool every single day.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ================================================================
            PRICING
        ================================================================ */}
        <section id="pricing" className={cn('relative py-28 sm:py-36 lg:py-40', BG_DARK)}>
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(45,212,191,0.04) 0%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-teal-500/70">
                  Founding member pricing
                </p>
                <h2
                  className="font-satoshi text-3xl font-medium text-zinc-50 sm:text-[2.75rem]"
                  style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                >
                  Pay once. Own forever.
                </h2>
                <p className="mt-5 text-[16px] text-zinc-400">
                  No subscriptions. No recurring charges. 200 total founding
                  member spots.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer
              className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3"
              stagger={0.1}
            >
              <StaggerItem>
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
              </StaggerItem>

              <StaggerItem>
                <PricingCard
                  name="Builder"
                  price={79}
                  spots={100}
                  description="For minds with too many tabs open"
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
              </StaggerItem>

              <StaggerItem>
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
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal delay={0.3}>
              <p className="mx-auto mt-8 max-w-md text-center text-[13px] text-zinc-600">
                14-day money-back guarantee. If OffMind isn&apos;t for you, get a
                full refund.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ================================================================
            FAQ
        ================================================================ */}
        <section className={cn('py-28 sm:py-36 lg:py-40', BG_ALT)}>
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center mb-14">
                <h2
                  className="font-satoshi text-3xl font-medium text-zinc-50 sm:text-[2.75rem]"
                  style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                >
                  Questions
                </h2>
              </div>
            </ScrollReveal>

            <div className="mx-auto max-w-2xl">
              <FAQItem
                question="How is this different from Notion?"
                answer="Notion requires you to build a system before you can capture a single thought. OffMind lets you capture first and organize later. The system grows with you instead of demanding architecture upfront."
              />
              <FAQItem
                question="What does the AI actually do?"
                answer="When you capture a thought, AI suggests which destination it belongs to: Backlog, Schedule, Questions, Reference, or a custom destination. It also extracts dates, breaks down complex items, and clusters related thoughts. You always confirm before anything moves."
              />
              <FAQItem
                question="What's a 'founding member'?"
                answer="You're buying lifetime access at a locked-in price before we launch publicly. After these 200 spots fill up, OffMind will move to a subscription model. Founding members keep lifetime access forever."
              />
              <FAQItem
                question="I have ADHD. Will this work for me?"
                answer="OffMind was designed for minds like yours. Capture in seconds with zero decisions. Route when you're ready, not when the app demands it. Weekly review catches what slipped. No guilt, no complexity, no 47-step setup."
              />
              <FAQItem
                question="Is my data private?"
                answer="Yes. Your data is stored with row-level security. We don't sell data, show ads, or use your content for AI training. Your thoughts stay yours."
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
        <section className={cn('relative overflow-hidden', BG_DARK)}>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(45,212,191,0.06) 0%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36 lg:py-40">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2
                  className="font-satoshi text-3xl font-medium text-zinc-50 sm:text-[2.75rem]"
                  style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                >
                  Where scattered thoughts
                  <br />
                  <GradientText>become real things.</GradientText>
                </h2>
                <p className="mt-5 text-[16px] text-zinc-400">
                  200 founding member spots. Once they&apos;re gone, it&apos;s
                  subscription only.
                </p>
                <div className="mt-8">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-md bg-teal-500 text-zinc-950 hover:bg-teal-400 font-semibold text-[15px] px-10 shadow-[0_0_30px_rgba(45,212,191,0.2)] transition-all hover:shadow-[0_0_40px_rgba(45,212,191,0.3)]"
                  >
                    <a
                      href="#pricing"
                      onClick={() =>
                        trackCTAClicked('get_lifetime_access', 'final_cta')
                      }
                    >
                      Get Lifetime Access
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={cn('py-10', BG_DARK)} style={{ borderTop: '1px solid rgba(161,161,170,0.08)' }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-1">
              <OffMindLogo size={20} />
              <span className="font-satoshi text-[13px] font-medium tracking-[0.08em] text-zinc-400">
                offmind
              </span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-zinc-600">
              <a href="/privacy" className="transition-colors hover:text-zinc-400">Privacy</a>
              <a href="/terms" className="transition-colors hover:text-zinc-400">Terms</a>
              <a
                href="https://x.com/compoundbuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-zinc-400"
              >
                @compoundbuilder
              </a>
            </div>
            <p className="text-[13px] text-zinc-700">&copy; 2026 OffMind</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   Workflow Step
============================================================================= */
function WorkflowStep({
  number,
  icon: Icon,
  title,
  subtitle,
  description,
  accentClasses,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  accentClasses: {
    iconBg: string;
    iconText: string;
    border: string;
    badge: string;
    subtitle: string;
    line: string;
  };
}) {
  return (
    <div className="flex items-start gap-6 sm:gap-8">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl border',
              accentClasses.iconBg,
              accentClasses.border,
            )}
          >
            <Icon className={cn('h-6 w-6', accentClasses.iconText)} />
          </div>
          <span
            className={cn(
              'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
              accentClasses.badge,
            )}
          >
            {number}
          </span>
        </div>
        {number < 3 && (
          <div
            className={cn(
              'mt-3 h-12 w-px bg-gradient-to-b to-transparent sm:h-16',
              accentClasses.line,
            )}
          />
        )}
      </div>

      <div className="pt-1">
        <h3
          className="font-satoshi text-xl font-medium text-zinc-50"
          style={{ letterSpacing: '-0.01em' }}
        >
          {title}
        </h3>
        <span className={cn('text-[13px] font-medium', accentClasses.subtitle)}>
          {subtitle}
        </span>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================================
   Feature Card
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
    <GlowCard>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06]">
        <Icon className="h-5 w-5 text-zinc-500 transition-colors group-hover:text-teal-400" />
      </div>
      <h3
        className="font-satoshi mt-4 text-[16px] font-semibold text-zinc-100"
        style={{ letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">
        {description}
      </p>
    </GlowCard>
  );
}

/* =============================================================================
   Pricing Card
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
    <GlowCard highlighted={highlighted} className={cn('flex flex-col', highlighted ? 'order-first sm:order-none' : '')}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-950">
          Most Popular
        </div>
      )}

      <h3 className="font-satoshi text-lg font-semibold text-zinc-100">{name}</h3>
      <p className="mt-1 text-[13px] text-zinc-500">{description}</p>

      <div className="mt-5">
        <span
          className="font-satoshi text-4xl font-bold tracking-tight text-zinc-50"
          style={{ letterSpacing: '-0.03em' }}
        >
          ${price}
        </span>
        <span className="ml-1 text-[14px] text-zinc-500">one-time</span>
      </div>
      <p className="mt-1.5 text-[12px] font-medium text-teal-500">
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
            : 'bg-white/[0.06] text-zinc-200 hover:bg-white/[0.1] hover:text-zinc-50',
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
    </GlowCard>
  );
}

/* =============================================================================
   FAQ Item
============================================================================= */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left group"
      >
        <span className="font-satoshi text-[15px] font-medium text-zinc-200 pr-4 transition-colors group-hover:text-zinc-50">
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

/* =============================================================================
   Ripple Field — Organic Depth Background
   Concentric circles expanding from 3 origin points on the right side,
   like stones dropped in still water. Ripples overlap and interfere.
   Metaphor: each captured thought creates ripples that compound with others.
============================================================================= */
function RippleField() {
  /* Three origin points — staggered on the right half */
  const origins = [
    { x: '62%', y: '25%', rings: 4, maxSize: 600, delayOffset: 0 },
    { x: '82%', y: '55%', rings: 3, maxSize: 480, delayOffset: 5 },
    { x: '50%', y: '70%', rings: 3, maxSize: 420, delayOffset: 10 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {origins.map((origin, oi) =>
        Array.from({ length: origin.rings }).map((_, ri) => {
          const size = ((ri + 1) / origin.rings) * origin.maxSize;
          const delay = origin.delayOffset + ri * 3.5;
          const duration = 12 + ri * 3;

          return (
            <div
              key={`${oi}-${ri}`}
              className="absolute rounded-full"
              style={{
                left: origin.x,
                top: origin.y,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                border: '1.5px solid rgba(45,212,191,0.4)',
                opacity: 0,
                animationName: 'ripple-expand',
                animationDuration: `${duration}s`,
                animationTimingFunction: 'ease-out',
                animationDelay: `${delay}s`,
                animationIterationCount: 'infinite',
                animationFillMode: 'both',
              }}
            />
          );
        }),
      )}

      {/* Soft glow at each origin */}
      {origins.map((origin, i) => (
        <div
          key={`glow-${i}`}
          className="absolute"
          style={{
            left: origin.x,
            top: origin.y,
            width: 140,
            height: 140,
            marginLeft: -70,
            marginTop: -70,
            background:
              'radial-gradient(circle, rgba(45,212,191,0.12) 0%, rgba(45,212,191,0.04) 40%, transparent 70%)',
          }}
        />
      ))}
    </div>
  );
}
