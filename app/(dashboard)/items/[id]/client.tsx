'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Trash2,
  Send,
  Archive,
  X,
  Maximize2,
  Pause,
  Play,
  ImageIcon,
  Volume2,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { softDeleteItem } from '@/lib/utils/soft-delete';
import { useItemsStore } from '@/stores/items';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { SubtasksList } from '@/components/item-detail/SubtasksList';
import { LinkedPageSection } from '@/components/item-detail/LinkedPageSection';
import { ItemRelationsSection } from '@/components/item-detail/ItemRelationsSection';
import type {
  Item,
  Subtask,
  Page,
  Destination,
  Space,
  Project,
  Contact,
  Json,
  Attachment,
} from '@/types/database';
import type { CustomFieldDefinition } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DESTINATION_FIELDS: Record<
  string,
  Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'url' | 'number';
    options?: string[];
    placeholder?: string;
  }>
> = {
  backlog: [
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: ['Low', 'Medium', 'High', 'Urgent'],
    },
    {
      name: 'effort',
      label: 'Effort',
      type: 'select',
      options: [
        'Quick (< 15min)',
        'Small (< 1h)',
        'Medium (< 4h)',
        'Large (> 4h)',
      ],
    },
  ],
  reference: [
    {
      name: 'source_url',
      label: 'Source URL',
      type: 'url',
      placeholder: 'https://...',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text',
      placeholder: 'e.g., Article, Book, Video',
    },
  ],
  incubating: [
    {
      name: 'stage',
      label: 'Development Stage',
      type: 'select',
      options: ['Seed', 'Exploring', 'Developing', 'Ready to Act'],
    },
  ],
  someday: [
    { name: 'revisit_date', label: 'Revisit On', type: 'date' },
    { name: 'maturity', label: 'Maturity', type: 'select', options: ['Raw Idea', 'Developing', 'Ready to Act'] },
  ],
  questions: [
    {
      name: 'possible_answer',
      label: 'Possible Answer',
      type: 'text',
      placeholder: 'What might the answer be?',
    },
    {
      name: 'research_links',
      label: 'Research Links',
      type: 'url',
      placeholder: 'https://...',
    },
  ],
  waiting: [
    {
      name: 'waiting_for',
      label: 'Waiting For',
      type: 'text',
      placeholder: "Person or thing you're waiting for",
    },
    { name: 'follow_up_date', label: 'Follow Up Date', type: 'date' },
  ],
};

const SCHEDULE_RELEVANT_SLUGS = ['backlog', 'commit'];

// ---------------------------------------------------------------------------
// Spring animation presets
// ---------------------------------------------------------------------------

const springTransition = {
  type: 'spring' as const,
  damping: 28,
  stiffness: 320,
};

// ---------------------------------------------------------------------------
// Inline: ImageLightbox
// ---------------------------------------------------------------------------

function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        src={src}
        alt={alt}
        className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Inline: AudioPlayer
// ---------------------------------------------------------------------------

function AudioPlayer({
  src,
  duration: initialDuration,
}: {
  src: string;
  duration?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(initialDuration ?? 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    });

    audio.addEventListener('ended', () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.duration && isFinite(audio.duration)) {
      setProgress(audio.currentTime / audio.duration);
      setCurrentTime(audio.currentTime);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    } else {
      audio.play();
      rafRef.current = requestAnimationFrame(tick);
    }
    setPlaying(!playing);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
      <button
        onClick={toggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-white hover:bg-[#c2410c]/80 transition-colors"
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5 ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#c2410c] transition-[width] duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <span className="shrink-0 text-[11px] font-mono text-neutral-500">
        {fmt(currentTime)}/{fmt(audioDuration)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ItemDetailClientProps {
  item: Item;
  initialSubtasks: Subtask[];
  linkedPage: Page | null;
  destinations: Destination[];
  spaces: Space[];
  projects: Project[];
  contacts: Contact[];
  userId: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ---------------------------------------------------------------------------
// Layer badge helpers
// ---------------------------------------------------------------------------

const LAYER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  capture: {
    label: 'Capture',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  process: {
    label: 'Process',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  commit: {
    label: 'Commit',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ItemDetailClient({
  item: serverItem,
  initialSubtasks,
  linkedPage: serverLinkedPage,
  destinations,
  spaces,
  projects,
  contacts,
  userId,
}: ItemDetailClientProps) {
  const router = useRouter();
  const { updateItem, removeItem } = useItemsStore();

  // ---- Supabase client (stable reference) ----
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // ---- Local item state ----
  const [item, setItem] = useState<Item>(serverItem);
  const [linkedPage, setLinkedPage] = useState<Page | null>(serverLinkedPage);

  // ---- Save status ----
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // ---- Editable fields ----
  const [title, setTitle] = useState(serverItem.title);
  const [notes, setNotes] = useState(serverItem.notes ?? '');
  const [destinationId, setDestinationId] = useState<string | null>(
    serverItem.destination_id,
  );
  const [spaceId, setSpaceId] = useState<string | null>(serverItem.space_id);
  const [projectId, setProjectId] = useState<string | null>(
    serverItem.project_id,
  );
  const [scheduledAt, setScheduledAt] = useState(
    serverItem.scheduled_at
      ? serverItem.scheduled_at.slice(0, 16)
      : '',
  );
  const [durationMinutes, setDurationMinutes] = useState<number | null>(
    serverItem.duration_minutes,
  );
  const [isAllDay, setIsAllDay] = useState(serverItem.is_all_day);
  const [waitingFor, setWaitingFor] = useState(serverItem.waiting_for ?? '');
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    (serverItem.custom_values as Record<string, unknown>) ?? {},
  );
  const [recurrence, setRecurrence] = useState<string>(
    ((serverItem.custom_values as Record<string, any>)?.recurrence) || ''
  );

  // ---- Contact suggestions ----
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);

  // ---- Delete confirmation ----
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ---- Lightbox for image attachments ----
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // ---- AI feature loading states ----
  const [aiSubtasksLoading, setAiSubtasksLoading] = useState(false);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);

  // ---- Post-completion prompt ----
  const [showCompletionPrompt, setShowCompletionPrompt] = useState<'schedule' | 'backlog' | null>(null);

  // ---- Refs ----
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);

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
  const showScheduleSection =
    SCHEDULE_RELEVANT_SLUGS.includes(destinationSlug) || Boolean(scheduledAt);
  const showWaitingSection = destinationSlug === 'waiting';
  const layerConfig = LAYER_CONFIG[item.layer] ?? LAYER_CONFIG.capture;

  // Parse attachments
  const attachments: Attachment[] = (() => {
    try {
      const raw = item.attachments;
      if (Array.isArray(raw)) return raw as unknown as Attachment[];
      return [];
    } catch {
      return [];
    }
  })();
  const imageAttachments = attachments.filter((a) => a.type === 'image');
  const audioAttachments = attachments.filter((a) => a.type === 'audio');

  // Breadcrumb destination name
  const breadcrumbDestName = (() => {
    if (item.destination_id) {
      const dest = destinations.find((d) => d.id === item.destination_id);
      return dest?.name ?? 'Items';
    }
    if (item.layer === 'capture') return 'Inbox';
    return 'Items';
  })();

  // ---- Cleanup on unmount ----
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

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

  // ---- Real-time subscription to item changes ----
  useEffect(() => {
    const channel = supabase
      .channel(`item-detail-${serverItem.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'items',
          filter: `id=eq.${serverItem.id}`,
        },
        (payload: any) => {
          if (!isMountedRef.current) return;
          const updated = payload.new as Item;
          setItem(updated);
          updateItem(updated);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverItem.id]);

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
          const refreshed = { ...item, ...finalUpdates } as Item;
          setItem(refreshed);
          updateItem(refreshed);
          setSaveStatus('saved');

          setTimeout(() => {
            if (isMountedRef.current) setSaveStatus('idle');
          }, 1500);
        }
      } catch (err) {
        console.error('ItemDetailClient: save failed', err);
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

  const forceSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!item) return;

    const updates: Partial<Item> = {
      title,
      notes: notes || null,
      destination_id: destinationId,
      space_id: spaceId,
      project_id: projectId,
      scheduled_at: scheduledAt
        ? new Date(scheduledAt).toISOString()
        : null,
      duration_minutes: durationMinutes,
      is_all_day: isAllDay,
      waiting_for: waitingFor || null,
      waiting_since:
        waitingFor && !item.waiting_since
          ? new Date().toISOString()
          : item.waiting_since,
      custom_values:
        Object.keys(customValues).length > 0
          ? (customValues as Json)
          : null,
    };

    persistSave(updates);
  }, [
    item,
    title,
    notes,
    destinationId,
    spaceId,
    projectId,
    scheduledAt,
    durationMinutes,
    isAllDay,
    waitingFor,
    customValues,
    persistSave,
  ]);

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

    // Immediate save for destination change
    persistSave({ destination_id: destId });
  };

  const handleSpaceChange = (value: string) => {
    const resolved = value === 'none' ? null : value;
    setSpaceId(resolved);
    persistSave({ space_id: resolved });
  };

  const handleProjectChange = (value: string) => {
    const resolved = value === 'none' ? null : value;
    setProjectId(resolved);
    persistSave({ project_id: resolved });
  };

  const handleScheduledAtChange = (value: string) => {
    setScheduledAt(value);
    debouncedSave({
      scheduled_at: value ? new Date(value).toISOString() : null,
    });
  };

  const handleDurationChange = (value: string) => {
    const mins = value ? parseInt(value, 10) : null;
    setDurationMinutes(mins);
    debouncedSave({ duration_minutes: mins });
  };

  const handleAllDayToggle = () => {
    const next = !isAllDay;
    setIsAllDay(next);
    persistSave({ is_all_day: next });
  };

  const handleWaitingForChange = (value: string) => {
    setWaitingFor(value);
    debouncedSave({ waiting_for: value || null });
  };

  const handleCustomValueChange = (key: string, value: unknown) => {
    const next = { ...customValues, [key]: value };
    setCustomValues(next);
    debouncedSave({
      custom_values:
        Object.keys(next).length > 0 ? (next as Json) : null,
    });
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);
      if (error) throw error;

      removeItem(item.id);
      toast.success('Item deleted');
      router.back();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  // ---- Archive ----
  const handleArchive = useCallback(async () => {
    const result = await softDeleteItem(item.id);
    if (result.success) {
      removeItem(item.id);
      toast.success('Item archived');
      router.back();
    } else {
      toast.error('Failed to archive item');
    }
  }, [item.id, removeItem, router]);

  // ---- Mark Complete ----
  const handleComplete = async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const now = new Date().toISOString();
    const updates: Partial<Item> = {
      title,
      notes: notes || null,
      destination_id: destinationId,
      space_id: spaceId,
      project_id: projectId,
      scheduled_at: scheduledAt
        ? new Date(scheduledAt).toISOString()
        : null,
      duration_minutes: durationMinutes,
      is_all_day: isAllDay,
      waiting_for: waitingFor || null,
      custom_values:
        Object.keys(customValues).length > 0
          ? (customValues as Json)
          : null,
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

      // Handle recurrence — create next occurrence
      const recurrenceValue = (customValues as Record<string, any>)?.recurrence;
      if (recurrenceValue && scheduledAt) {
        const currentDate = new Date(scheduledAt);
        let nextDate: Date | null = null;

        switch (recurrenceValue) {
          case 'daily':
            nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekdays': {
            nextDate = new Date(currentDate);
            do {
              nextDate.setDate(nextDate.getDate() + 1);
            } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
            break;
          }
          case 'weekly':
            nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case 'monthly':
            nextDate = new Date(currentDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }

        if (nextDate) {
          try {
            await supabase.from('items').insert({
              user_id: userId,
              title: title,
              notes: notes || null,
              layer: 'commit',
              destination_id: destinationId,
              space_id: spaceId,
              project_id: projectId,
              scheduled_at: nextDate.toISOString(),
              duration_minutes: durationMinutes,
              is_all_day: isAllDay,
              custom_values: customValues as any,
              source: 'recurrence',
            });
            toast.success(`Next occurrence scheduled for ${nextDate.toLocaleDateString()}`);
          } catch {
            // Silent fail — the current item was completed successfully
          }
        }
      }

      // Show post-completion prompt for schedule/backlog, otherwise go back
      if (destinationSlug === 'commit') {
        setShowCompletionPrompt('schedule');
      } else if (destinationSlug === 'backlog') {
        setShowCompletionPrompt('backlog');
      } else {
        router.back();
      }
    } catch {
      toast.error('Failed to complete item');
    }
  };

  // ---- Post-completion: create page for schedule prompt ----
  const handleCreateMeetingPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          user_id: userId,
          title: `Meeting notes: ${title}`,
          item_id: item.id,
          space_id: spaceId,
          project_id: projectId,
        })
        .select('id')
        .single();

      if (error) throw error;
      if (data) {
        router.push(`/pages/${data.id}`);
      }
    } catch {
      toast.error('Failed to create page');
      router.back();
    }
  };

  // ---- Post-completion: create follow-up item for backlog prompt ----
  const handleCreateFollowUp = async () => {
    try {
      const backlogDest = destinations.find((d) => d.slug === 'backlog');
      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          title: `Follow-up: ${title}`,
          destination_id: backlogDest?.id ?? null,
          space_id: spaceId,
          project_id: projectId,
          layer: backlogDest ? 'process' : 'capture',
        })
        .select('id')
        .single();

      if (error) throw error;
      toast.success('Follow-up created');
      if (data) {
        router.push(`/items/${data.id}`);
      }
    } catch {
      toast.error('Failed to create follow-up');
      router.back();
    }
  };

  // ---- Convert to Project ----
  const handleConvertToProject = async () => {
    try {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: title,
          space_id: spaceId,
          icon: 'folder-open',
          color: 'blue',
        })
        .select('id')
        .single();

      if (projectError) throw projectError;
      if (!newProject) throw new Error('No project returned');

      const { error: updateError } = await supabase
        .from('items')
        .update({ project_id: newProject.id })
        .eq('id', item.id);

      if (updateError) throw updateError;

      setProjectId(newProject.id);
      const refreshed = { ...item, project_id: newProject.id } as Item;
      setItem(refreshed);
      updateItem(refreshed);

      toast.success('Converted to project!');
      router.push(`/projects/${newProject.id}`);
    } catch {
      toast.error('Failed to convert to project');
    }
  };

  // ---- AI: Break into subtasks ----
  const handleAISuggestSubtasks = async () => {
    setAiSubtasksLoading(true);
    try {
      // Fetch current subtasks to pass existing titles
      const { data: currentSubtasks } = await supabase
        .from('subtasks')
        .select('title, sort_order')
        .eq('item_id', item.id)
        .order('sort_order');

      const existingSubtaskTitles = (currentSubtasks ?? []).map((s: any) => s.title);
      const existingCount = currentSubtasks?.length ?? 0;

      const res = await fetch('/api/ai/suggest-subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          title,
          notes,
          existingSubtasks: existingSubtaskTitles,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');

      const result = await res.json();

      const newSubtasks = result.subtasks.map((s: any, i: number) => ({
        item_id: item.id,
        user_id: userId,
        title: s.title,
        sort_order: (existingCount + i) * 10,
        is_completed: false,
      }));

      const { data: inserted } = await supabase
        .from('subtasks')
        .insert(newSubtasks)
        .select();

      if (inserted) {
        toast.success(result.reasoning || `Added ${inserted.length} subtasks`);
      }
    } catch (err) {
      console.error('AI suggest subtasks failed', err);
      toast.error('Failed to generate subtask suggestions');
    } finally {
      setAiSubtasksLoading(false);
    }
  };

  // ---- AI: Draft Page ----
  function textToTiptapDoc(text: string) {
    const paragraphs = text.split('\n\n').filter(Boolean);
    return {
      type: 'doc',
      content: paragraphs.map(p => {
        // Check if it's a heading
        if (p.startsWith('# ')) {
          return { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: p.replace('# ', '') }] };
        }
        if (p.startsWith('## ')) {
          return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: p.replace('## ', '') }] };
        }
        if (p.startsWith('### ')) {
          return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: p.replace('### ', '') }] };
        }
        // Check if it's a bullet list
        if (p.includes('\n- ') || p.startsWith('- ')) {
          const items = p.split('\n').filter(l => l.startsWith('- ')).map(l => ({
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: l.replace('- ', '') }] }],
          }));
          return { type: 'bulletList', content: items };
        }
        return { type: 'paragraph', content: [{ type: 'text', text: p }] };
      }),
    };
  }

  const handleAIDraftPage = async () => {
    setAiDraftLoading(true);
    try {
      // Fetch current subtask titles for context
      const { data: currentSubtasks } = await supabase
        .from('subtasks')
        .select('title')
        .eq('item_id', item.id)
        .order('sort_order');

      const subtaskTitles = (currentSubtasks ?? []).map((s: any) => s.title);

      const res = await fetch('/api/ai/draft-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          title,
          notes,
          subtasks: subtaskTitles,
          destinationSlug,
        }),
      });

      if (!res.ok) throw new Error('AI draft request failed');

      const result = await res.json();

      // Convert AI-generated text to TipTap JSON document
      const tiptapDoc = textToTiptapDoc(result.content);

      const { data: newPage, error } = await supabase
        .from('pages')
        .insert({
          user_id: userId,
          title,
          content: tiptapDoc,
          item_id: item.id,
          space_id: spaceId,
          project_id: projectId,
        })
        .select()
        .single();

      if (error) throw error;

      if (newPage) {
        setLinkedPage(newPage as Page);
        toast.success('AI draft page created');
        router.push(`/pages/${newPage.id}`);
      }
    } catch (err) {
      console.error('AI draft page failed', err);
      toast.error('Failed to generate AI draft');
    } finally {
      setAiDraftLoading(false);
    }
  };

  // ---- Save & Route ----
  const handleSaveAndRoute = async () => {
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
      scheduled_at: scheduledAt
        ? new Date(scheduledAt).toISOString()
        : null,
      duration_minutes: durationMinutes,
      is_all_day: isAllDay,
      waiting_for: waitingFor || null,
      waiting_since: waitingSince,
      custom_values:
        Object.keys(customValues).length > 0
          ? (customValues as Json)
          : null,
      layer,
      updated_at: now,
    };

    try {
      const { error } = await supabase
        .from('items')
        .update(updates as Record<string, unknown>)
        .eq('id', item.id);

      if (error) throw error;

      const routed = { ...item, ...updates } as Item;
      updateItem(routed);
      toast.success('Item saved and routed');
      router.back();
    } catch {
      toast.error('Failed to save');
    }
  };

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceSave, destinationId]);

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
          Saving…
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
    return <span className="text-xs text-neutral-600">Up to date</span>;
  };

  const renderBuiltInField = (
    field: (typeof builtInFields)[number],
  ) => {
    const value = (customValues[field.name] as string) ?? '';

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.name} className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400">
            {field.label}
          </label>
          <Select
            value={value || 'unset'}
            onValueChange={(v) =>
              handleCustomValueChange(
                field.name,
                v === 'unset' ? '' : v,
              )
            }
          >
            <SelectTrigger className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]">
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
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
          <label className="text-xs font-medium text-neutral-400">
            {field.label}
          </label>
          <Input
            type="date"
            value={value}
            onChange={(e) =>
              handleCustomValueChange(field.name, e.target.value)
            }
            className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
          />
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400">
          {field.label}
        </label>
        <Input
          type={field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={(e) =>
            handleCustomValueChange(field.name, e.target.value)
          }
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
            <label className="text-xs font-medium text-neutral-400">
              {field.name}
            </label>
            <Select
              value={String(value) || 'unset'}
              onValueChange={(v) =>
                handleCustomValueChange(
                  field.id,
                  v === 'unset' ? '' : v,
                )
              }
            >
              <SelectTrigger className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]">
                <SelectValue
                  placeholder={`Select ${field.name.toLowerCase()}`}
                />
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
                <svg
                  className="h-full w-full text-white"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 8l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <label className="text-xs font-medium text-neutral-400">
              {field.name}
            </label>
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {field.name}
            </label>
            <Input
              type="number"
              value={String(value)}
              onChange={(e) =>
                handleCustomValueChange(
                  field.id,
                  e.target.value ? Number(e.target.value) : '',
                )
              }
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {field.name}
            </label>
            <Input
              type="date"
              value={String(value)}
              onChange={(e) =>
                handleCustomValueChange(field.id, e.target.value)
              }
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );

      case 'url':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {field.name}
            </label>
            <Input
              type="url"
              value={String(value)}
              onChange={(e) =>
                handleCustomValueChange(field.id, e.target.value)
              }
              placeholder="https://..."
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );

      case 'longtext':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {field.name}
            </label>
            <textarea
              value={String(value)}
              onChange={(e) =>
                handleCustomValueChange(field.id, e.target.value)
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-[#c2410c]/40 focus:ring-1 focus:ring-[#c2410c]/20"
            />
          </div>
        );

      default: // text
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {field.name}
            </label>
            <Input
              value={String(value)}
              onChange={(e) =>
                handleCustomValueChange(field.id, e.target.value)
              }
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        );
    }
  };

  // ===================================================================
  // RENDER — Centered single-column layout
  // ===================================================================

  const DestIcon = selectedDestination
    ? ICON_MAP[selectedDestination.icon] || ICON_MAP['inbox']
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="flex h-full flex-col"
      >
        {/* ── Scrollable content ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">

            {/* ── Header: back + save ──────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>
                  Back to{' '}
                  <span className="text-neutral-300">{breadcrumbDestName}</span>
                </span>
              </button>
              {renderSaveIndicator()}
            </div>

            {/* ── Content ─────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* ── Title ─────────────────────────────────────────── */}
              <div>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Item title…"
                  className={cn(
                    'h-auto border-none bg-transparent px-0 py-1 text-2xl font-semibold text-neutral-100',
                    'placeholder:text-neutral-600',
                    'focus-visible:ring-0 focus-visible:shadow-none',
                  )}
                />

                {/* ── Meta line ──────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium',
                      layerConfig.bg,
                      layerConfig.color,
                    )}
                  >
                    {layerConfig.label}
                  </span>

                  {recurrence && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
                      ↻ {recurrence === 'weekdays' ? 'Weekdays' : recurrence.charAt(0).toUpperCase() + recurrence.slice(1)}
                    </span>
                  )}

                  {item.source && (
                    <>
                      <span className="text-neutral-700">·</span>
                      <span className="capitalize">{item.source}</span>
                    </>
                  )}

                  <span className="text-neutral-700">·</span>
                  <span>
                    Created{' '}
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </span>

                  {item.is_completed && (
                    <>
                      <span className="text-neutral-700">·</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* ── Row 1: Notes + Destination/Details ──────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Notes ──────────────────────────────────────────── */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-400">
                    Notes
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add notes…"
                    rows={3}
                    className={cn(
                      'w-full resize-none rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3',
                      'text-sm leading-relaxed text-neutral-300 placeholder:text-neutral-600',
                      'outline-none transition-colors',
                      'focus:border-[#c2410c]/30 focus:bg-white/[0.03]',
                    )}
                    style={{ minHeight: '100px' }}
                  />
                </div>

                {/* ── Destination + Details (right side of row 1) ───── */}
                <div className="space-y-4">

                {/* ── Destination row ────────────────────────────────── */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  {selectedDestination && DestIcon ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#c2410c]/30 bg-[#c2410c]/10 px-3 py-1 text-sm font-medium text-[#c2410c]">
                      <DestIcon className="h-3.5 w-3.5" />
                      {selectedDestination.name}
                    </span>
                  ) : (
                    <span className="text-sm text-neutral-500">No destination</span>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="ml-auto flex items-center gap-1.5 text-sm text-neutral-400 hover:text-[#c2410c] transition-colors"
                      >
                        {selectedDestination
                          ? 'Move'
                          : 'Choose'}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      {destinations
                        .slice()
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((dest) => {
                          const Icon = ICON_MAP[dest.icon] || ICON_MAP['inbox'];
                          const isActive = destinationId === dest.id;
                          return (
                            <DropdownMenuItem
                              key={dest.id}
                              onClick={() => handleDestinationChange(dest.id)}
                              className={cn(
                                'gap-2',
                                isActive && 'text-[#c2410c] font-medium',
                              )}
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                              <span className="flex-1">{dest.name}</span>
                              {isActive && <CheckCircle2 className="h-3 w-3 ml-auto opacity-60" />}
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* ── Destination-specific fields ─────────────────────── */}
                {(builtInFields.length > 0 ||
                  showWaitingSection ||
                  customFieldDefs.length > 0) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                      {selectedDestination?.name ?? 'Destination'} Details
                    </h3>

                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                      {/* Waiting-specific fields */}
                      {showWaitingSection && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="relative space-y-1.5">
                            <label className="text-xs font-medium text-neutral-400">
                              Waiting For
                            </label>
                            <Input
                              value={waitingFor}
                              onChange={(e) => {
                                handleWaitingForChange(e.target.value);
                                setShowContactSuggestions(true);
                              }}
                              onFocus={() => setShowContactSuggestions(true)}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowContactSuggestions(false),
                                  200,
                                )
                              }
                              placeholder="Person or thing you're waiting on"
                              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
                            />
                            {showContactSuggestions &&
                              waitingFor &&
                              contacts &&
                              contacts.length > 0 &&
                              (() => {
                                const filtered = contacts
                                  .filter((c) =>
                                    c.name
                                      .toLowerCase()
                                      .includes(waitingFor.toLowerCase()),
                                  )
                                  .slice(0, 5);
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
                                        {c.email && (
                                          <span className="ml-2 text-xs text-neutral-500">
                                            {c.email}
                                          </span>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                );
                              })()}
                          </div>
                          {item.waiting_since && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-neutral-400">
                                Waiting Since
                              </label>
                              <p className="text-sm text-neutral-300">
                                {new Date(item.waiting_since).toLocaleDateString(
                                  undefined,
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  },
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Built-in destination fields + custom fields in grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {builtInFields
                          .filter(
                            (f) =>
                              !(showWaitingSection && f.name === 'waiting_for'),
                          )
                          .map(renderBuiltInField)}
                        {customFieldDefs.map(renderCustomField)}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Promote to Backlog (Someday/Maybe only) ────────── */}
                {destinationSlug === 'someday' && (() => {
                  const backlogDest = destinations.find((d) => d.slug === 'backlog');
                  if (!backlogDest) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        handleDestinationChange(backlogDest.id);
                        toast.success('Promoted to Backlog!');
                      }}
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                    >
                      Promote to Backlog
                    </button>
                  );
                })()}
                </div>{/* end Destination + Details */}
              </div>{/* end Row 1: Notes + Destination */}

              {/* ── Row 2: Subtasks + Schedule/Organize ──────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Subtasks ───────────────────────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                      Subtasks
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={aiSubtasksLoading}
                      onClick={handleAISuggestSubtasks}
                      className="gap-1.5 rounded-xl border-white/[0.08] bg-transparent text-[#c2410c] hover:bg-[#c2410c]/10 hover:text-[#c2410c] h-7 text-xs px-2.5"
                    >
                      {aiSubtasksLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {aiSubtasksLoading ? 'Thinking...' : 'AI Suggest'}
                    </Button>
                  </div>
                  <SubtasksList
                    itemId={item.id}
                    initialSubtasks={initialSubtasks}
                    userId={userId}
                    onPromoteSubtask={async (subtaskTitle) => {
                      try {
                        const { data, error } = await supabase
                          .from('items')
                          .insert({
                            user_id: userId,
                            title: subtaskTitle,
                            destination_id: destinationId,
                            space_id: spaceId,
                            project_id: projectId,
                            layer: destinationId ? 'process' : 'capture',
                          })
                          .select('id')
                          .single();

                        if (error) throw error;
                        toast.success(`"${subtaskTitle}" promoted to item`);
                        if (data) {
                          router.push(`/items/${data.id}`);
                        }
                      } catch {
                        toast.error('Failed to promote subtask');
                      }
                    }}
                  />
                </div>

                {/* ── Schedule + Organize ───────────────────────────── */}
                <div className="space-y-5">

                {/* ── Schedule ───────────────────────────────────────── */}
                {showScheduleSection && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                      Schedule
                    </h3>

                    <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-400">
                          Scheduled At
                        </label>
                        <Input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) =>
                            handleScheduledAtChange(e.target.value)
                          }
                          className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-400">
                            Duration (min)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            value={durationMinutes ?? ''}
                            onChange={(e) =>
                              handleDurationChange(e.target.value)
                            }
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
                          <span className="text-xs text-neutral-400">
                            All day
                          </span>
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

                      {/* Recurrence */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                          Repeat
                        </label>
                        <select
                          value={recurrence}
                          onChange={(e) => {
                            setRecurrence(e.target.value);
                            handleCustomValueChange('recurrence', e.target.value);
                          }}
                          className={cn(
                            'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-neutral-100',
                            'focus:border-[#c2410c]/40 focus:outline-none focus:ring-1 focus:ring-[#c2410c]/30',
                          )}
                        >
                          <option value="">No repeat</option>
                          <option value="daily">Daily</option>
                          <option value="weekdays">Weekdays</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Every 2 weeks</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Organize: Space + Project ──────────────────────── */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Organize
                  </h3>

                  <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    {/* Space */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-400">
                        Space
                      </label>
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
                                  {SpaceIcon && (
                                    <SpaceIcon className="h-4 w-4" />
                                  )}
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
                      <label className="text-xs font-medium text-neutral-400">
                        Project
                      </label>
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
                            .filter(
                              (p) =>
                                !spaceId ||
                                p.space_id === spaceId ||
                                p.space_id === null,
                            )
                            .map((project) => {
                              const ProjIcon = ICON_MAP[project.icon];
                              return (
                                <SelectItem
                                  key={project.id}
                                  value={project.id}
                                >
                                  <span className="flex items-center gap-2">
                                    {ProjIcon && (
                                      <ProjIcon className="h-4 w-4" />
                                    )}
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

                </div>{/* end Schedule + Organize */}
              </div>{/* end Row 2: Subtasks + Schedule/Organize */}

              {/* ── Row 3: Linked Page + Attachments ──────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Linked Page + Relations ──────────────────────────── */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <LinkedPageSection
                      item={item}
                      linkedPage={linkedPage}
                      userId={userId}
                      destinationSlug={destinationSlug}
                      onPageCreated={(pageId) => {
                        const fetchPage = async () => {
                          const { data } = await supabase
                            .from('pages')
                            .select('*')
                            .eq('id', pageId)
                            .single();
                          if (data) setLinkedPage(data as Page);
                        };
                        fetchPage();
                      }}
                    />
                    {!linkedPage && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={aiDraftLoading}
                          onClick={handleAIDraftPage}
                          className="gap-1.5 rounded-xl border-white/[0.08] bg-transparent text-[#c2410c] hover:bg-[#c2410c]/10 hover:text-[#c2410c] h-7 text-xs px-2.5"
                        >
                          {aiDraftLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {aiDraftLoading ? 'Drafting...' : 'AI Draft'}
                        </Button>
                      </div>
                    )}
                  </div>
                  <ItemRelationsSection itemId={item.id} userId={userId} />
                </div>

                {/* ── Attachments ────────────────────────────────────── */}
                <div>
                  {(imageAttachments.length > 0 ||
                    audioAttachments.length > 0) && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Attachments
                      </h3>

                      {imageAttachments.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>
                              {imageAttachments.length} image
                              {imageAttachments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {imageAttachments.map((att) => (
                              <button
                                key={att.id}
                                type="button"
                                onClick={() => setLightboxSrc(att.url)}
                                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all hover:border-white/[0.16] hover:shadow-lg cursor-zoom-in"
                              >
                                <img
                                  src={att.url}
                                  alt={att.filename}
                                  className="h-28 w-36 object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                  <Maximize2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {audioAttachments.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>
                              {audioAttachments.length} audio recording
                              {audioAttachments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {audioAttachments.map((att) => (
                              <AudioPlayer
                                key={att.id}
                                src={att.url}
                                duration={att.duration}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>{/* end Row 3 */}

            </div>{/* end Content */}

          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-6 py-3">
          {/* Left: Delete */}
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

          {/* Center: Archive + More Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              className="gap-2 rounded-xl text-neutral-500 hover:text-neutral-200"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-neutral-500 hover:text-neutral-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={handleConvertToProject}>
                  Convert to Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Save & Route + Complete */}
          <div className="flex items-center gap-2">
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

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="gap-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Image Lightbox ───────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxSrc && (
          <ImageLightbox
            src={lightboxSrc}
            alt="Attachment"
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Post-Completion Prompt ────────────────────────────────── */}
      <AnimatePresence>
        {showCompletionPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowCompletionPrompt(null);
              router.back();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rounded-2xl border border-white/[0.08] bg-[#252220] p-6 shadow-xl max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {showCompletionPrompt === 'schedule' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Create meeting notes?
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Start a page linked to this item for your meeting notes.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={handleCreateMeetingPage}
                      className="flex-1 gap-2 rounded-xl bg-[#c2410c] text-white hover:bg-[#c2410c]/90"
                    >
                      Start a Page
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCompletionPrompt(null);
                        router.back();
                      }}
                      className="flex-1 rounded-xl text-neutral-400 hover:text-neutral-200"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Create a follow-up?
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Create a new item to follow up on &ldquo;{title}&rdquo;.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={handleCreateFollowUp}
                      className="flex-1 gap-2 rounded-xl bg-[#c2410c] text-white hover:bg-[#c2410c]/90"
                    >
                      New Item
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCompletionPrompt(null);
                        router.back();
                      }}
                      className="flex-1 rounded-xl text-neutral-400 hover:text-neutral-200"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
