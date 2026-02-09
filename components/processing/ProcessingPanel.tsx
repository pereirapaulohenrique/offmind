'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Trash2, CheckCircle2, Loader2, Send, Archive } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { softDeleteItem } from '@/lib/utils/soft-delete';
import { useUIStore } from '@/stores/ui';
import { useItemsStore } from '@/stores/items';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Item, Destination, Space, Project, Contact, Json } from '@/types/database';
import type { CustomFieldDefinition } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProcessingPanelProps {
  destinations: Destination[];
  spaces: Space[];
  projects: Project[];
  contacts?: Contact[];
  userId: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Destination-specific field configurations (built-in destinations)
const DESTINATION_FIELDS: Record<string, Array<{
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'url' | 'number';
  options?: string[];
  placeholder?: string;
}>> = {
  backlog: [
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { name: 'effort', label: 'Effort', type: 'select', options: ['Quick (< 15min)', 'Small (< 1h)', 'Medium (< 4h)', 'Large (> 4h)'] },
  ],
  reference: [
    { name: 'source_url', label: 'Source URL', type: 'url', placeholder: 'https://...' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Article, Book, Video' },
  ],
  incubating: [
    { name: 'stage', label: 'Development Stage', type: 'select', options: ['Seed', 'Exploring', 'Developing', 'Ready to Act'] },
  ],
  someday: [
    { name: 'revisit_date', label: 'Revisit On', type: 'date' },
  ],
  questions: [
    { name: 'possible_answer', label: 'Possible Answer', type: 'text', placeholder: 'What might the answer be?' },
    { name: 'research_links', label: 'Research Links', type: 'url', placeholder: 'https://...' },
  ],
  waiting: [
    { name: 'waiting_for', label: 'Waiting For', type: 'text', placeholder: 'Person or thing you\'re waiting for' },
    { name: 'follow_up_date', label: 'Follow Up Date', type: 'date' },
  ],
};

// Slugs that show the scheduling section
const SCHEDULE_RELEVANT_SLUGS = ['backlog', 'commit'];

// ---------------------------------------------------------------------------
// Spring animation presets
// ---------------------------------------------------------------------------

const springTransition = {
  type: 'spring' as const,
  damping: 28,
  stiffness: 320,
  mass: 0.8,
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: springTransition },
  exit: { x: '100%', transition: { type: 'spring' as const, damping: 32, stiffness: 400 } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProcessingPanel({
  destinations,
  spaces,
  projects,
  contacts,
  userId,
}: ProcessingPanelProps) {
  // ---- Zustand state ----
  const {
    processingPanelOpen,
    processingItemId,
    processingPanelExpanded,
    closeProcessingPanel,
    toggleProcessingPanelExpanded,
  } = useUIStore();

  const { updateItem, removeItem } = useItemsStore();

  // ---- Local state ----
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Editable fields
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [waitingFor, setWaitingFor] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});

  // Contact suggestions
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Refs
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // ---- Supabase client (stable reference) ----
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // ---- Derived ----
  const selectedDestination = destinations.find((d) => d.id === destinationId);
  const destinationSlug = selectedDestination?.slug ?? '';
  const builtInFields = DESTINATION_FIELDS[destinationSlug] ?? [];
  const customFieldDefs: CustomFieldDefinition[] = (() => {
    try {
      const raw = selectedDestination?.custom_fields;
      if (Array.isArray(raw)) return raw as unknown as CustomFieldDefinition[];
      return [];
    } catch {
      return [];
    }
  })();
  const showScheduleSection = SCHEDULE_RELEVANT_SLUGS.includes(destinationSlug) || Boolean(scheduledAt);
  const showWaitingSection = destinationSlug === 'waiting';

  // ---- Cleanup on unmount ----
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // ---- Fetch item when panel opens or itemId changes ----
  useEffect(() => {
    if (!processingPanelOpen || !processingItemId) {
      setItem(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', processingItemId)
        .single();

      if (cancelled) return;

      if (error || !data) {
        toast.error('Could not load item');
        closeProcessingPanel();
        return;
      }

      const fetched = data as Item;
      setItem(fetched);
      hydrateForm(fetched);
      setIsLoading(false);
      setSaveStatus('idle');
      setConfirmDelete(false);
    };

    fetchItem();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingPanelOpen, processingItemId]);

  // ---- Hydrate form fields from an Item ----
  const hydrateForm = (i: Item) => {
    setTitle(i.title);
    setNotes(i.notes ?? '');
    setDestinationId(i.destination_id);
    setSpaceId(i.space_id);
    setProjectId(i.project_id);
    setScheduledAt(i.scheduled_at ? i.scheduled_at.slice(0, 16) : '');
    setDurationMinutes(i.duration_minutes);
    setIsAllDay(i.is_all_day);
    setWaitingFor(i.waiting_for ?? '');
    setCustomValues((i.custom_values as Record<string, unknown>) ?? {});
  };

  // ---- Auto-resize textarea ----
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [notes]);

  // ---- Auto-populate space when a project is selected ----
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const selected = projects.find((p) => p.id === projectId);
      if (selected?.space_id && selected.space_id !== spaceId) {
        setSpaceId(selected.space_id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, projects]);

  // ---- Debounced auto-save ----
  const persistSave = useCallback(
    async (updates: Partial<Item>) => {
      if (!item) return;

      setSaveStatus('saving');

      try {
        // Determine layer transitions
        const layerUpdates: Partial<Item> = {};
        if (updates.scheduled_at && item.layer !== 'commit') {
          layerUpdates.layer = 'commit';
        } else if (updates.destination_id && item.layer === 'capture') {
          layerUpdates.layer = 'process';
        }

        const finalUpdates: Partial<Item> = {
          ...updates,
          ...layerUpdates,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('items')
          .update(finalUpdates as Record<string, unknown>)
          .eq('id', item.id);

        if (error) throw error;

        if (isMountedRef.current) {
          // Keep local item in sync
          const refreshed = { ...item, ...finalUpdates } as Item;
          setItem(refreshed);
          updateItem(refreshed);
          setSaveStatus('saved');

          // Reset to idle after a moment
          setTimeout(() => {
            if (isMountedRef.current) setSaveStatus('idle');
          }, 1500);
        }
      } catch (err) {
        console.error('ProcessingPanel: save failed', err);
        if (isMountedRef.current) {
          setSaveStatus('error');
          toast.error('Failed to save changes');
        }
      }
    },
    [item, supabase, updateItem],
  );

  const debouncedSave = useCallback(
    (updates: Partial<Item>) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => persistSave(updates), 500);
    },
    [persistSave],
  );

  // Force an immediate save (Cmd+S, Done, etc.)
  const forceSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!item) return;

    const updates: Partial<Item> = {
      title,
      notes: notes || null,
      destination_id: destinationId,
      space_id: spaceId,
      project_id: projectId,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      duration_minutes: durationMinutes,
      is_all_day: isAllDay,
      waiting_for: waitingFor || null,
      waiting_since: waitingFor && !item.waiting_since ? new Date().toISOString() : item.waiting_since,
      custom_values: Object.keys(customValues).length > 0 ? (customValues as Json) : null,
    };

    persistSave(updates);
  }, [item, title, notes, destinationId, spaceId, projectId, scheduledAt, durationMinutes, isAllDay, waitingFor, customValues, persistSave]);

  // ---- Field change handlers (trigger debounced save) ----

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debouncedSave({ title: value });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    debouncedSave({ notes: value || null });
  };

  const handleDestinationChange = (destId: string) => {
    setDestinationId(destId);

    const dest = destinations.find((d) => d.id === destId);

    // Clear waiting fields if leaving waiting
    if (dest?.slug !== 'waiting' && waitingFor) {
      setWaitingFor('');
    }
  };

  const handleSpaceChange = (value: string) => {
    const resolved = value === 'none' ? null : value;
    setSpaceId(resolved);
  };

  const handleProjectChange = (value: string) => {
    const resolved = value === 'none' ? null : value;
    setProjectId(resolved);
  };

  const handleScheduledAtChange = (value: string) => {
    setScheduledAt(value);
  };

  const handleDurationChange = (value: string) => {
    const mins = value ? parseInt(value, 10) : null;
    setDurationMinutes(mins);
  };

  const handleAllDayToggle = () => {
    const next = !isAllDay;
    setIsAllDay(next);
  };

  const handleWaitingForChange = (value: string) => {
    setWaitingFor(value);
  };

  const handleCustomValueChange = (key: string, value: unknown) => {
    const next = { ...customValues, [key]: value };
    setCustomValues(next);
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    if (!item) return;

    try {
      const { error } = await supabase.from('items').delete().eq('id', item.id);
      if (error) throw error;

      removeItem(item.id);
      toast.success('Item deleted');
      closeProcessingPanel();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  // ---- Archive ----
  const handleArchive = useCallback(async () => {
    if (!item) return;
    const result = await softDeleteItem(item.id);
    if (result.success) {
      removeItem(item.id);
      toast.success('Item archived');
      closeProcessingPanel();
    } else {
      toast.error('Failed to archive item');
    }
  }, [item, removeItem, closeProcessingPanel]);

  // ---- Mark Done ----
  const handleDone = async () => {
    if (!item) return;

    // Flush any pending debounce first
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const now = new Date().toISOString();
    const updates: Partial<Item> = {
      title,
      notes: notes || null,
      destination_id: destinationId,
      space_id: spaceId,
      project_id: projectId,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      duration_minutes: durationMinutes,
      is_all_day: isAllDay,
      waiting_for: waitingFor || null,
      custom_values: Object.keys(customValues).length > 0 ? (customValues as Json) : null,
      is_completed: true,
      completed_at: now,
      updated_at: now,
    };

    try {
      const { error } = await supabase
        .from('items')
        .update(updates as Record<string, unknown>)
        .eq('id', item.id);

      if (error) throw error;

      const completed = { ...item, ...updates } as Item;
      updateItem(completed);
      toast.success('Item completed');
      closeProcessingPanel();
    } catch {
      toast.error('Failed to complete item');
    }
  };

  // ---- Save & Route ----
  const handleSaveAndRoute = async () => {
    if (!item) return;

    // Clear any pending debounce timer
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const now = new Date().toISOString();

    // Determine layer
    let layer = item.layer;
    if (scheduledAt) {
      layer = 'commit';
    } else if (destinationId && item.layer === 'capture') {
      layer = 'process';
    }

    // Determine waiting_since
    const dest = destinations.find((d) => d.id === destinationId);
    let waitingSince = item.waiting_since;
    if (dest?.slug === 'waiting' && waitingFor && !item.waiting_since) {
      waitingSince = now;
    }

    const updates: Partial<Item> = {
      title,
      notes: notes || null,
      destination_id: destinationId,
      space_id: spaceId,
      project_id: projectId,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      duration_minutes: durationMinutes,
      is_all_day: isAllDay,
      waiting_for: waitingFor || null,
      waiting_since: waitingSince,
      custom_values: Object.keys(customValues).length > 0 ? (customValues as Json) : null,
      layer,
      updated_at: now,
    };

    try {
      const supabaseClient = createClient();
      const { error } = await supabaseClient
        .from('items')
        .update(updates as Record<string, unknown>)
        .eq('id', item.id);

      if (error) throw error;

      const routed = { ...item, ...updates } as Item;
      updateItem(routed);
      toast.success('Item saved and routed');
      closeProcessingPanel();
    } catch {
      toast.error('Failed to save');
    }
  };

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    if (!processingPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeProcessingPanel();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (destinationId) {
          handleSaveAndRoute();
        } else {
          forceSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processingPanelOpen, closeProcessingPanel, forceSave, destinationId]);

  // Reset delete confirmation when destination changes
  useEffect(() => {
    setConfirmDelete(false);
  }, [destinationId]);

  // ---- Render helpers ----

  const renderSaveIndicator = () => {
    if (saveStatus === 'saving') {
      return (
        <span className="flex items-center gap-1.5 text-xs text-orange-400/80">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving...
        </span>
      );
    }
    if (saveStatus === 'saved') {
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-400/80">
          <CheckCircle2 className="h-3 w-3" />
          Saved
        </span>
      );
    }
    if (saveStatus === 'error') {
      return <span className="text-xs text-red-400/80">Save failed</span>;
    }
    return null;
  };

  const renderDestinationButton = (dest: Destination) => {
    const DestIcon = ICON_MAP[dest.icon] || ICON_MAP['inbox'];
    const colorOpt = COLOR_PALETTE.find((c) => c.value === dest.color);
    const isActive = destinationId === dest.id;

    return (
      <button
        key={dest.id}
        type="button"
        onClick={() => handleDestinationChange(dest.id)}
        className={cn(
          'group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-xs font-medium transition-all duration-200',
          'min-w-[80px]',
          isActive
            ? 'border-[#c2410c]/60 bg-[#c2410c]/10 text-[#c2410c] shadow-md ring-2 ring-[#c2410c]/30'
            : 'border-white/[0.06] bg-white/[0.03] text-neutral-400 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-neutral-200',
        )}
      >
        {DestIcon && (
          <DestIcon
            className={cn(
              'h-4.5 w-4.5 transition-colors',
              isActive ? 'text-[#c2410c]' : colorOpt?.text ?? 'text-neutral-500',
            )}
          />
        )}
        <span className="truncate max-w-[72px]">{dest.name}</span>
      </button>
    );
  };

  const renderBuiltInField = (field: typeof builtInFields[number]) => {
    const value = (customValues[field.name] as string) ?? '';

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.name} className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">{field.label}</label>
          <Select
            value={value || 'unset'}
            onValueChange={(v) => handleCustomValueChange(field.name, v === 'unset' ? '' : v)}
          >
            <SelectTrigger className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">-- None --</SelectItem>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === 'date') {
      return (
        <div key={field.name} className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">{field.label}</label>
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomValueChange(field.name, e.target.value)}
            className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
          />
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400">{field.label}</label>
        <Input
          type={field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={(e) => handleCustomValueChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
        />
      </div>
    );
  };

  const renderCustomField = (field: CustomFieldDefinition) => {
    const value = customValues[field.id] ?? field.default ?? '';

    switch (field.type) {
      case 'dropdown':
      case 'multiselect':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">{field.name}</label>
            <Select
              value={String(value) || 'unset'}
              onValueChange={(v) => handleCustomValueChange(field.id, v === 'unset' ? '' : v)}
            >
              <SelectTrigger className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]">
                <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">-- None --</SelectItem>
                {(field.options ?? []).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center gap-2 py-1">
            <button
              type="button"
              onClick={() => handleCustomValueChange(field.id, !value)}
              className={cn(
                'h-5 w-5 shrink-0 rounded-md border transition-colors',
                value
                  ? 'border-[#c2410c] bg-[#c2410c]'
                  : 'border-white/[0.12] bg-white/[0.03]',
              )}
            >
              {value && (
                <svg className="h-full w-full text-white" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <label className="text-xs font-medium text-neutral-400">{field.name}</label>
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">{field.name}</label>
            <Input
              type="number"
              value={String(value)}
              onChange={(e) => handleCustomValueChange(field.id, e.target.value ? Number(e.target.value) : '')}
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">{field.name}</label>
            <Input
              type="date"
              value={String(value)}
              onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );

      case 'url':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">{field.name}</label>
            <Input
              type="url"
              value={String(value)}
              onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
              placeholder="https://..."
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );

      case 'longtext':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">{field.name}</label>
            <textarea
              value={String(value)}
              onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-[#c2410c]/40 focus:ring-1 focus:ring-[#c2410c]/20"
            />
          </div>
        );

      default: // text
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">{field.name}</label>
            <Input
              value={String(value)}
              onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );
    }
  };

  // ---- Panel width classes ----
  const panelWidthClass = processingPanelExpanded
    ? 'w-full'
    : 'w-full sm:w-[55%] md:w-[45%] lg:w-[40%]';

  // ---- Render ----
  return (
    <AnimatePresence mode="wait">
      {processingPanelOpen && (
        <>
          {/* ---- Backdrop ---- */}
          {!processingPanelExpanded && (
            <motion.div
              key="processing-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              onClick={closeProcessingPanel}
              aria-hidden
            />
          )}

          {/* ---- Panel ---- */}
          <motion.div
            ref={panelRef}
            key="processing-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed right-0 top-0 z-50 flex h-full flex-col',
              'border-l border-white/[0.06]',
              // Bloom warm organic surface
              'bg-gradient-to-b from-[#1c1917] via-[#1a1815] to-[#171412]',
              'shadow-[-8px_0_32px_rgba(0,0,0,0.5)]',
              panelWidthClass,
            )}
          >
            {/* ================================================================ */}
            {/* HEADER                                                            */}
            {/* ================================================================ */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2">
                {/* Collapse (close) */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={closeProcessingPanel}
                  className="text-neutral-500 hover:text-neutral-200"
                  title="Close panel"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Expand / Minimize */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleProcessingPanelExpanded}
                  className="text-neutral-500 hover:text-neutral-200"
                  title={processingPanelExpanded ? 'Minimize panel' : 'Expand panel'}
                >
                  {processingPanelExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Save status */}
              <div className="flex items-center gap-3">
                {renderSaveIndicator()}

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={closeProcessingPanel}
                  className="text-neutral-500 hover:text-neutral-200"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ================================================================ */}
            {/* BODY                                                              */}
            {/* ================================================================ */}
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              </div>
            ) : item ? (
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-6 px-5 py-5">

                  {/* ---- Title ---- */}
                  <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Item title..."
                    className={cn(
                      'h-auto border-none bg-transparent px-0 py-1 text-2xl font-semibold text-neutral-100',
                      'placeholder:text-neutral-600',
                      'focus-visible:ring-0 focus-visible:shadow-none',
                    )}
                  />

                  {/* ---- Notes ---- */}
                  <textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    className={cn(
                      'w-full resize-none rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3',
                      'text-sm leading-relaxed text-neutral-300 placeholder:text-neutral-600',
                      'outline-none transition-colors',
                      'focus:border-[#c2410c]/30 focus:bg-white/[0.03]',
                    )}
                    style={{ minHeight: '80px' }}
                  />

                  {/* ---- Divider: DESTINATION ---- */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                      Destination
                    </span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>

                  {/* ---- Destination Grid ---- */}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {destinations
                      .slice()
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(renderDestinationButton)}
                  </div>

                  {/* ---- Divider: DESTINATION FIELDS ---- */}
                  {(builtInFields.length > 0 || customFieldDefs.length > 0 || showWaitingSection || showScheduleSection) && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/[0.06]" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                          {selectedDestination?.name ?? 'Destination'} Fields
                        </span>
                        <div className="h-px flex-1 bg-white/[0.06]" />
                      </div>

                      <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        {/* Waiting-specific fields */}
                        {showWaitingSection && (
                          <>
                            <div className="relative space-y-1.5">
                              <label className="text-xs font-medium text-neutral-400">Waiting For</label>
                              <Input
                                value={waitingFor}
                                onChange={(e) => {
                                  handleWaitingForChange(e.target.value);
                                  setShowContactSuggestions(true);
                                }}
                                onFocus={() => setShowContactSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowContactSuggestions(false), 200)}
                                placeholder="Person or thing you're waiting on"
                                className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
                              />
                              {showContactSuggestions && waitingFor && contacts && contacts.length > 0 && (() => {
                                const filtered = contacts.filter((c) =>
                                  c.name.toLowerCase().includes(waitingFor.toLowerCase())
                                ).slice(0, 5);
                                if (filtered.length === 0) return null;
                                return (
                                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-36 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#1c1917] shadow-lg">
                                    {filtered.map((c) => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          handleWaitingForChange(c.name);
                                          setShowContactSuggestions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/[0.06] transition-colors"
                                      >
                                        {c.name}
                                        {c.email && <span className="ml-2 text-xs text-neutral-500">{c.email}</span>}
                                      </button>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                            {item.waiting_since && (
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-neutral-400">Waiting Since</label>
                                <p className="text-sm text-neutral-300">
                                  {new Date(item.waiting_since).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Schedule fields */}
                        {showScheduleSection && (
                          <>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-neutral-400">Scheduled At</label>
                              <Input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => handleScheduledAtChange(e.target.value)}
                                className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
                              />
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex-1 space-y-1.5">
                                <label className="text-xs font-medium text-neutral-400">Duration (min)</label>
                                <Input
                                  type="number"
                                  min={0}
                                  step={5}
                                  value={durationMinutes ?? ''}
                                  onChange={(e) => handleDurationChange(e.target.value)}
                                  placeholder="30"
                                  className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
                                />
                              </div>

                              <div className="flex items-center gap-2 pt-5">
                                <button
                                  type="button"
                                  onClick={handleAllDayToggle}
                                  className={cn(
                                    'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                                    isAllDay ? 'bg-[#c2410c]' : 'bg-white/[0.1]',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                                      isAllDay && 'translate-x-4',
                                    )}
                                  />
                                </button>
                                <span className="text-xs text-neutral-400">All day</span>
                              </div>
                            </div>

                            {scheduledAt && (
                              <button
                                type="button"
                                onClick={() => handleScheduledAtChange('')}
                                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                              >
                                Clear schedule
                              </button>
                            )}
                          </>
                        )}

                        {/* Built-in destination fields */}
                        {builtInFields
                          .filter((f) => !(showWaitingSection && f.name === 'waiting_for'))
                          .map(renderBuiltInField)}

                        {/* Custom fields from destination.custom_fields */}
                        {customFieldDefs.map(renderCustomField)}
                      </div>
                    </>
                  )}

                  {/* ---- Divider: ORGANIZE ---- */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                      Organize
                    </span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>

                  {/* ---- Space / Project ---- */}
                  <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    {/* Space */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-400">Space</label>
                      <Select
                        value={spaceId ?? 'none'}
                        onValueChange={handleSpaceChange}
                      >
                        <SelectTrigger className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]">
                          <SelectValue placeholder="No space" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {spaces.map((space) => {
                            const SpaceIcon = ICON_MAP[space.icon];
                            return (
                              <SelectItem key={space.id} value={space.id}>
                                <span className="flex items-center gap-2">
                                  {SpaceIcon && <SpaceIcon className="h-4 w-4" />}
                                  <span>{space.name}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-400">Project</label>
                      <Select
                        value={projectId ?? 'none'}
                        onValueChange={handleProjectChange}
                      >
                        <SelectTrigger className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]">
                          <SelectValue placeholder="No project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects
                            .filter((p) => !spaceId || p.space_id === spaceId || p.space_id === null)
                            .map((project) => {
                              const ProjIcon = ICON_MAP[project.icon];
                              return (
                                <SelectItem key={project.id} value={project.id}>
                                  <span className="flex items-center gap-2">
                                    {ProjIcon && <ProjIcon className="h-4 w-4" />}
                                    <span>{project.name}</span>
                                  </span>
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-1 items-center justify-center text-neutral-500">
                Item not found
              </div>
            )}

            {/* ================================================================ */}
            {/* FOOTER                                                            */}
            {/* ================================================================ */}
            {item && !isLoading && (
              <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-5 py-3">
                {/* Delete (left) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className={cn(
                    'gap-2 rounded-xl transition-colors',
                    confirmDelete
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                      : 'text-neutral-500 hover:text-red-400',
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  {confirmDelete ? 'Confirm Delete' : 'Delete'}
                </Button>

                {/* Archive */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleArchive}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <Archive className="mr-1.5 h-4 w-4" />
                  Archive
                </Button>

                {/* Right-side buttons */}
                <div className="flex items-center gap-2">
                  {/* Save & Route */}
                  <Button
                    size="sm"
                    onClick={handleSaveAndRoute}
                    disabled={!destinationId}
                    className={cn(
                      'gap-2 rounded-xl',
                      'bg-[#c2410c] text-white hover:bg-[#c2410c]/90',
                      'shadow-[0_2px_12px_rgba(194,65,12,0.25)]',
                      !destinationId && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <Send className="h-4 w-4" />
                    Save & Route
                  </Button>

                  {/* Complete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDone}
                    className="gap-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
