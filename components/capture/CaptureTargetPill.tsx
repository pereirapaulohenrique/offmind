'use client';

import { useState, useMemo } from 'react';
import { ArrowRight, Inbox, FolderOpen, Briefcase, FileText, X, Search } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ICON_MAP } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  useCaptureTargetStore,
  type CaptureTarget,
  type CaptureTargetType,
} from '@/stores/capture-target';

interface TargetOption {
  type: CaptureTargetType;
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface CaptureTargetPillProps {
  spaces: Array<{ id: string; name: string; icon: string; color: string }>;
  projects: Array<{ id: string; name: string; icon: string; color: string; space_id: string | null }>;
  pages: Array<{ id: string; title: string; icon: string; project_id: string | null; space_id: string | null }>;
}

const TYPE_ICON: Record<CaptureTargetType, typeof Inbox> = {
  space: FolderOpen,
  project: Briefcase,
  page: FileText,
};

const TYPE_LABEL: Record<CaptureTargetType, string> = {
  space: 'Space',
  project: 'Project',
  page: 'Page',
};

export function CaptureTargetPill({ spaces, projects, pages }: CaptureTargetPillProps) {
  const { captureTarget, recentTargets, setCaptureTarget, clearCaptureTarget } =
    useCaptureTargetStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allTargets = useMemo<TargetOption[]>(() => {
    const targets: TargetOption[] = [];
    for (const s of spaces) {
      targets.push({ type: 'space', id: s.id, name: s.name, icon: s.icon, color: s.color });
    }
    for (const p of projects) {
      targets.push({ type: 'project', id: p.id, name: p.name, icon: p.icon, color: p.color });
    }
    for (const pg of pages) {
      targets.push({ type: 'page', id: pg.id, name: pg.title, icon: pg.icon });
    }
    return targets;
  }, [spaces, projects, pages]);

  const filteredTargets = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allTargets.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 10);
  }, [search, allTargets]);

  const handleSelect = (target: TargetOption) => {
    setCaptureTarget({
      type: target.type,
      id: target.id,
      name: target.name,
      icon: target.icon,
      color: target.color,
    });
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    clearCaptureTarget();
    setOpen(false);
    setSearch('');
  };

  const hasTarget = captureTarget !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-200 flex-shrink-0',
            hasTarget
              ? 'bg-[var(--accent-glow)] text-[var(--accent-base)] border border-[var(--accent-border)] hover:bg-[var(--accent-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          )}
        >
          <ArrowRight className="h-3 w-3" />
          <span className="max-w-[120px] truncate">
            {hasTarget ? captureTarget.name : 'Inbox'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0 shadow-xl"
      >
        {/* Clear target */}
        {hasTarget && (
          <button
            onClick={handleClear}
            className="flex w-full items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-2.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-3 w-3" />
            Clear target (back to Inbox)
          </button>
        )}

        {/* Recent targets */}
        {recentTargets.length > 0 && (
          <div className="border-b border-[var(--border-subtle)]">
            <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-disabled)]">
              Recent
            </div>
            {recentTargets.map((target) => (
              <TargetRow
                key={`${target.type}-${target.id}`}
                target={target}
                isActive={captureTarget?.id === target.id && captureTarget?.type === target.type}
                onSelect={() => handleSelect(target)}
              />
            ))}
          </div>
        )}

        {/* Search */}
        <div className="p-2">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-hover)] px-2.5 py-1.5">
            <Search className="h-3 w-3 text-[var(--text-disabled)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search spaces, projects, pages..."
              className="flex-1 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Search results */}
        {filteredTargets.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto border-t border-[var(--border-subtle)]">
            {filteredTargets.map((target) => (
              <TargetRow
                key={`${target.type}-${target.id}`}
                target={target}
                isActive={captureTarget?.id === target.id && captureTarget?.type === target.type}
                onSelect={() => handleSelect(target)}
              />
            ))}
          </div>
        )}

        {search.trim() && filteredTargets.length === 0 && (
          <div className="px-3 py-3 text-xs text-[var(--text-disabled)] text-center">
            No matches
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function TargetRow({
  target,
  isActive,
  onSelect,
}: {
  target: { type: CaptureTargetType; id: string; name: string; icon?: string; color?: string };
  isActive: boolean;
  onSelect: () => void;
}) {
  const TypeIcon = TYPE_ICON[target.type];
  const ResolvedIcon = target.icon ? ICON_MAP[target.icon] || TypeIcon : TypeIcon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
        isActive
          ? 'bg-[var(--accent-glow)] text-[var(--text-primary)]'
          : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
      )}
    >
      <ResolvedIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
      <span className="flex-1 truncate text-xs">{target.name}</span>
      <span className="rounded-full bg-[var(--bg-hover)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-disabled)]">
        {TYPE_LABEL[target.type]}
      </span>
    </button>
  );
}
