'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ArrowRight, CheckCircle2, FileText, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Item, Contact } from '@/types/database';

interface DestinationContextSectionProps {
  item: Item;
  destinationSlug: string;
  destinationName: string;
  customValues: Record<string, unknown>;
  onCustomValueChange: (key: string, value: unknown) => void;
  contacts: Contact[];
  onAction: (action: string, payload?: any) => void;
}

// ------------------------------------------------------------------
// Shared field styling (Bloom design system dark mode)
// ------------------------------------------------------------------
const fieldClasses = 'rounded-xl border-white/[0.08] bg-white/[0.03]';

const actionButtonPromote =
  'bg-[#c2410c]/10 text-[#c2410c] hover:bg-[#c2410c]/20 rounded-xl';
const actionButtonComplete =
  'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl';

// ------------------------------------------------------------------
// Sub-section: Backlog
// ------------------------------------------------------------------
function BacklogSection({
  customValues,
  onCustomValueChange,
  onAction,
}: Pick<DestinationContextSectionProps, 'customValues' | 'onCustomValueChange' | 'onAction'>) {
  return (
    <div className="space-y-4">
      {/* Priority selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Priority</label>
        <Select
          value={(customValues.priority as string) ?? ''}
          onValueChange={(v) => onCustomValueChange('priority', v)}
        >
          <SelectTrigger className={cn('w-full', fieldClasses)}>
            <SelectValue placeholder="Set priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Effort selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Effort</label>
        <Select
          value={(customValues.effort as string) ?? ''}
          onValueChange={(v) => onCustomValueChange('effort', v)}
        >
          <SelectTrigger className={cn('w-full', fieldClasses)}>
            <SelectValue placeholder="Estimate effort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trivial">Trivial (&lt; 15 min)</SelectItem>
            <SelectItem value="small">Small (&lt; 1 hr)</SelectItem>
            <SelectItem value="medium">Medium (1-4 hrs)</SelectItem>
            <SelectItem value="large">Large (half day+)</SelectItem>
            <SelectItem value="epic">Epic (multi-day)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', actionButtonPromote)}
          onClick={() => onAction('schedule')}
        >
          <Calendar className="h-3.5 w-3.5" />
          Schedule
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', actionButtonComplete)}
          onClick={() => onAction('complete')}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-section: Waiting
// ------------------------------------------------------------------
function WaitingSection({
  customValues,
  onCustomValueChange,
  contacts,
  onAction,
}: Pick<DestinationContextSectionProps, 'customValues' | 'onCustomValueChange' | 'contacts' | 'onAction'>) {
  const [contactQuery, setContactQuery] = useState(
    (customValues.waiting_contact as string) ?? ''
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredContacts = useMemo(() => {
    if (!contactQuery.trim()) return contacts;
    const q = contactQuery.toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [contactQuery, contacts]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectContact(name: string) {
    setContactQuery(name);
    onCustomValueChange('waiting_contact', name);
    setShowDropdown(false);
  }

  return (
    <div className="space-y-4">
      {/* Contact input with autocomplete */}
      <div className="space-y-1.5" ref={wrapperRef}>
        <label className="text-xs font-medium text-white/60">Waiting For</label>
        <div className="relative">
          <Input
            placeholder="Contact name..."
            value={contactQuery}
            onChange={(e) => {
              setContactQuery(e.target.value);
              onCustomValueChange('waiting_contact', e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className={fieldClasses}
          />
          {showDropdown && filteredContacts.length > 0 && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1614] shadow-lg">
              <div className="max-h-48 overflow-y-auto py-1">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                    onClick={() => selectContact(contact.name)}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium text-white/60">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{contact.name}</span>
                    {contact.email && (
                      <span className="ml-auto truncate text-xs text-white/30">
                        {contact.email}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow up date */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Follow Up Date</label>
        <Input
          type="date"
          value={(customValues.follow_up_date as string) ?? ''}
          onChange={(e) => onCustomValueChange('follow_up_date', e.target.value)}
          className={fieldClasses}
        />
      </div>

      {/* Response Received */}
      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', actionButtonComplete)}
          onClick={() => onAction('complete')}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Response Received
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-section: Someday
// ------------------------------------------------------------------
function SomedaySection({
  item,
  customValues,
  onCustomValueChange,
  onAction,
}: Pick<DestinationContextSectionProps, 'item' | 'customValues' | 'onCustomValueChange' | 'onAction'>) {
  const maturity = useMemo(() => {
    const created = new Date(item.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 7) return { label: 'Raw Idea', color: 'text-blue-400 bg-blue-500/10' };
    if (diffDays < 30) return { label: 'Developing', color: 'text-amber-400 bg-amber-500/10' };
    return { label: 'Ready to Act', color: 'text-emerald-400 bg-emerald-500/10' };
  }, [item.created_at]);

  return (
    <div className="space-y-4">
      {/* Revisit date */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Revisit Date</label>
        <Input
          type="date"
          value={(customValues.revisit_date as string) ?? ''}
          onChange={(e) => onCustomValueChange('revisit_date', e.target.value)}
          className={fieldClasses}
        />
      </div>

      {/* Maturity indicator */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Maturity</label>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
              maturity.color
            )}
          >
            <Lightbulb className="h-3 w-3" />
            {maturity.label}
          </span>
          <span className="text-xs text-white/30">
            created {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Promote to Backlog */}
      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', actionButtonPromote)}
          onClick={() => onAction('promote-to-backlog')}
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Promote to Backlog
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-section: Reference
// ------------------------------------------------------------------
function ReferenceSection({
  customValues,
  onCustomValueChange,
  onAction,
}: Pick<DestinationContextSectionProps, 'customValues' | 'onCustomValueChange' | 'onAction'>) {
  return (
    <div className="space-y-4">
      {/* Source URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Source URL</label>
        <Input
          type="url"
          placeholder="https://..."
          value={(customValues.source_url as string) ?? ''}
          onChange={(e) => onCustomValueChange('source_url', e.target.value)}
          className={fieldClasses}
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Category</label>
        <Input
          placeholder="e.g. Article, Video, Tool..."
          value={(customValues.category as string) ?? ''}
          onChange={(e) => onCustomValueChange('category', e.target.value)}
          className={fieldClasses}
        />
      </div>

      {/* Expand to Page */}
      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', actionButtonPromote)}
          onClick={() => onAction('expand-to-page')}
        >
          <FileText className="h-3.5 w-3.5" />
          Expand to Page
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-section: Questions
// ------------------------------------------------------------------
function QuestionsSection({
  customValues,
  onCustomValueChange,
  onAction,
}: Pick<DestinationContextSectionProps, 'customValues' | 'onCustomValueChange' | 'onAction'>) {
  return (
    <div className="space-y-4">
      {/* Possible answer */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Possible Answer</label>
        <textarea
          placeholder="Write your thoughts..."
          rows={4}
          value={(customValues.possible_answer as string) ?? ''}
          onChange={(e) => onCustomValueChange('possible_answer', e.target.value)}
          className={cn(
            'flex w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none transition-colors focus:border-white/[0.15]',
            fieldClasses
          )}
        />
      </div>

      {/* Research links */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Research Links</label>
        <Input
          placeholder="Paste relevant URLs..."
          value={(customValues.research_links as string) ?? ''}
          onChange={(e) => onCustomValueChange('research_links', e.target.value)}
          className={fieldClasses}
        />
      </div>

      {/* Mark Answered */}
      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', actionButtonComplete)}
          onClick={() => onAction('complete')}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark Answered
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-section: Incubating
// ------------------------------------------------------------------
function IncubatingSection({
  customValues,
  onCustomValueChange,
  onAction,
}: Pick<DestinationContextSectionProps, 'customValues' | 'onCustomValueChange' | 'onAction'>) {
  return (
    <div className="space-y-4">
      {/* Development Stage */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">Development Stage</label>
        <Select
          value={(customValues.development_stage as string) ?? ''}
          onValueChange={(v) => onCustomValueChange('development_stage', v)}
        >
          <SelectTrigger className={cn('w-full', fieldClasses)}>
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seed">Seed — Initial spark</SelectItem>
            <SelectItem value="sprout">Sprout — Taking shape</SelectItem>
            <SelectItem value="growing">Growing — Gaining clarity</SelectItem>
            <SelectItem value="mature">Mature — Ready for action</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Promote to Backlog */}
      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', actionButtonPromote)}
          onClick={() => onAction('promote-to-backlog')}
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Promote to Backlog
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
export function DestinationContextSection({
  item,
  destinationSlug,
  destinationName,
  customValues,
  onCustomValueChange,
  contacts,
  onAction,
}: DestinationContextSectionProps) {
  const sharedProps = { customValues, onCustomValueChange, onAction };

  let content: React.ReactNode = null;

  switch (destinationSlug) {
    case 'backlog':
      content = <BacklogSection {...sharedProps} />;
      break;
    case 'waiting':
      content = <WaitingSection {...sharedProps} contacts={contacts} />;
      break;
    case 'someday':
      content = <SomedaySection item={item} {...sharedProps} />;
      break;
    case 'reference':
      content = <ReferenceSection {...sharedProps} />;
      break;
    case 'questions':
      content = <QuestionsSection {...sharedProps} />;
      break;
    case 'incubating':
      content = <IncubatingSection {...sharedProps} />;
      break;
    default:
      return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {destinationName} Details
      </h3>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        {content}
      </div>
    </section>
  );
}
