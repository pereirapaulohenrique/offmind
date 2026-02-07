'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  userName: string;
  onComplete: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to OffMind',
    description: 'The calm productivity system designed for overthinkers. Let us show you how it works in 30 seconds.',
    icon: null,
    color: 'primary' as const,
  },
  {
    id: 'capture',
    title: '1. Capture Everything',
    description: 'Brain dump every thought, task, and idea into your inbox. No organizing needed - just get it out of your head.',
    icon: Inbox,
    color: 'blue' as const,
    tip: 'Press Cmd+N anywhere to quickly capture',
  },
  {
    id: 'process',
    title: '2. Process with AI',
    description: 'AI suggests where each item belongs - backlog, reference, someday, or schedule it. Review suggestions with one click.',
    icon: ArrowRightLeft,
    color: 'amber' as const,
    tip: 'Use the AI Suggest button on any item for smart categorization',
  },
  {
    id: 'commit',
    title: '3. Commit to Today',
    description: 'Schedule only what matters for today. Your commit view shows just the items you decided to focus on - nothing else.',
    icon: CalendarCheck,
    color: 'green' as const,
    tip: 'Your home page will always show today\'s commitments first',
  },
  {
    id: 'ready',
    title: 'You\'re all set!',
    description: 'Start by capturing your first thought. The more you use OffMind, the smarter it gets at helping you organize.',
    icon: Sparkles,
    color: 'primary' as const,
  },
];

const colorStyles = {
  primary: {
    bg: 'bg-[var(--accent-subtle)]',
    text: 'text-[var(--accent-base)]',
    border: 'border-[var(--accent-border)]',
    dot: 'bg-[var(--accent-base)]',
  },
  blue: {
    bg: 'bg-[var(--layer-capture-bg)]',
    text: 'text-[var(--layer-capture)]',
    border: 'border-[var(--layer-capture-border)]',
    dot: 'bg-[var(--layer-capture)]',
  },
  amber: {
    bg: 'bg-[var(--layer-process-bg)]',
    text: 'text-[var(--layer-process)]',
    border: 'border-[var(--layer-process-border)]',
    dot: 'bg-[var(--layer-process)]',
  },
  green: {
    bg: 'bg-[var(--layer-commit-bg)]',
    text: 'text-[var(--layer-commit)]',
    border: 'border-[var(--layer-commit-border)]',
    dot: 'bg-[var(--layer-commit)]',
  },
};

export function OnboardingFlow({ userName, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const colors = colorStyles[step.color];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const next = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const skip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)]/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg mx-4"
      >
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-2xl shadow-black/20">
          {/* Skip button */}
          {!isLast && (
            <button
              onClick={skip}
              className="absolute top-5 right-5 text-xs text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
            >
              Skip intro
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon / Logo */}
              <div className="mb-6">
                {isFirst ? (
                  <OffMindLogo size={64} />
                ) : step.icon ? (
                  <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', colors.bg)}>
                    <step.icon className={cn('h-8 w-8', colors.text)} />
                  </div>
                ) : (
                  <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', colors.bg)}>
                    <Check className={cn('h-8 w-8', colors.text)} />
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold tracking-tight">
                {isFirst ? `Hey ${userName}, welcome!` : step.title}
              </h2>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] max-w-sm">
                {step.description}
              </p>

              {/* Tip */}
              {'tip' in step && step.tip && (
                <div className={cn('mt-5 rounded-lg border px-4 py-2.5 text-xs', colors.border, colors.bg)}>
                  <span className={cn('font-medium', colors.text)}>Tip: </span>
                  <span className="text-[var(--text-muted)]">{step.tip}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    i === currentStep
                      ? `w-6 ${colors.dot}`
                      : i < currentStep
                        ? 'w-1.5 bg-[var(--text-disabled)]'
                        : 'w-1.5 bg-[var(--border-default)]'
                  )}
                />
              ))}
            </div>

            {/* Button */}
            <Button onClick={next} className="gap-2 shadow-sm">
              {isLast ? (
                <>
                  Start Capturing
                  <Inbox className="h-4 w-4" />
                </>
              ) : (
                <>
                  {isFirst ? 'Show me how' : 'Next'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
