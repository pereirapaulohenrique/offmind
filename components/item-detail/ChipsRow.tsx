'use client';

import { Flag, Clock, CalendarDays, RotateCcw, FolderOpen } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ICON_MAP } from '@/components/icons';
import type { Space } from '@/types/database';

interface ChipsRowProps {
  customValues: Record<string, unknown>;
  onCustomValueChange: (key: string, value: unknown) => void;
  durationMinutes: number | null;
  onDurationChange: (value: string) => void;
  scheduledAt: string;
  onScheduledAtChange: (value: string) => void;
  recurrence: string;
  onRecurrenceChange: (value: string) => void;
  spaceId: string | null;
  spaces: Space[];
  onSpaceChange: (value: string) => void;
}

const PRIORITY_OPTIONS = ['Urgent', 'High', 'Medium', 'Low'] as const;
const RECURRENCE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

const chipBase =
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer';
const chipInactive =
  'border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-neutral-200';
const chipActive =
  'border-[#c2410c]/30 bg-[#c2410c]/10 text-[#c2410c] hover:bg-[#c2410c]/15';
const popoverClass =
  'w-52 rounded-xl border border-white/[0.08] bg-[#252220] p-3 shadow-xl';
const selectClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-200 focus:border-[#c2410c]/50 focus:outline-none';
const inputClass = selectClass;

export function ChipsRow({
  customValues,
  onCustomValueChange,
  durationMinutes,
  onDurationChange,
  scheduledAt,
  onScheduledAtChange,
  recurrence,
  onRecurrenceChange,
  spaceId,
  spaces,
  onSpaceChange,
}: ChipsRowProps) {
  const priority = (customValues?.priority as string) || '';
  const spaceName = spaces.find((s) => s.id === spaceId)?.name;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Priority */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chipBase, priority ? chipActive : chipInactive)}>
            <Flag className="h-3 w-3" />
            <span>{priority || 'Priority'}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className={popoverClass}>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => onCustomValueChange('priority', e.target.value || null)}
            className={selectClass}
          >
            <option value="">None</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </PopoverContent>
      </Popover>

      {/* Duration */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chipBase, durationMinutes ? chipActive : chipInactive)}>
            <Clock className="h-3 w-3" />
            <span>{durationMinutes ? `${durationMinutes}m` : 'Duration'}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className={popoverClass}>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={0}
            step={5}
            value={durationMinutes ?? ''}
            onChange={(e) => onDurationChange(e.target.value)}
            placeholder="30"
            className={inputClass}
          />
        </PopoverContent>
      </Popover>

      {/* Schedule */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chipBase, scheduledAt ? chipActive : chipInactive)}>
            <CalendarDays className="h-3 w-3" />
            <span>
              {scheduledAt
                ? format(new Date(scheduledAt), 'MMM d, HH:mm')
                : 'Schedule'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className={popoverClass}>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Schedule
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => onScheduledAtChange(e.target.value)}
            className={inputClass}
          />
          {scheduledAt && (
            <button
              onClick={() => onScheduledAtChange('')}
              className="mt-2 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Clear schedule
            </button>
          )}
        </PopoverContent>
      </Popover>

      {/* Repeat */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chipBase, recurrence ? chipActive : chipInactive)}>
            <RotateCcw className="h-3 w-3" />
            <span>
              {recurrence
                ? RECURRENCE_OPTIONS.find((r) => r.value === recurrence)?.label || recurrence
                : 'Repeat'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className={popoverClass}>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Repeat
          </label>
          <select
            value={recurrence}
            onChange={(e) => onRecurrenceChange(e.target.value)}
            className={selectClass}
          >
            {RECURRENCE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </PopoverContent>
      </Popover>

      {/* Space */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chipBase, spaceId ? chipActive : chipInactive)}>
            <FolderOpen className="h-3 w-3" />
            <span>{spaceName || 'Space'}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className={popoverClass}>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Space
          </label>
          <select
            value={spaceId || 'none'}
            onChange={(e) => onSpaceChange(e.target.value)}
            className={selectClass}
          >
            <option value="none">None</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </PopoverContent>
      </Popover>
    </div>
  );
}
