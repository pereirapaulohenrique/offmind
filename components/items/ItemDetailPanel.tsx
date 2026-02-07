'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  FileText,
  Inbox,
  ArrowRight,
  Calendar,
  Clock,
  Plus,
  Sparkles,
  Loader2,
  Wand2,
  Type,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/dates';
import type { Item, Destination, Space, Project, Page } from '@/types/database';
import { toast } from 'sonner';

// Destination-specific field configurations
const DESTINATION_FIELDS: Record<string, Array<{
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'url';
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

interface ItemDetailPanelProps {
  item: Item | null;
  destinations: Destination[];
  spaces?: Space[];
  projects?: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export function ItemDetailPanel({
  item,
  destinations,
  spaces = [],
  projects = [],
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: ItemDetailPanelProps) {
  const router = useRouter();
  const getSupabase = () => createClient();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [customValues, setCustomValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [linkedPage, setLinkedPage] = useState<Page | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setNotes(item.notes || '');
      setDestinationId(item.destination_id);
      setSpaceId(item.space_id);
      setProjectId(item.project_id);
      setScheduledAt(item.scheduled_at ? item.scheduled_at.slice(0, 16) : '');
      setCustomValues((item.custom_values as Record<string, any>) || {});
      setHasChanges(false);
      setLinkedPage(null);

      // Fetch linked page if any
      const fetchLinkedPage = async () => {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('pages')
          .select('*')
          .eq('item_id', item.id)
          .single();
        if (data) setLinkedPage(data as Page);
      };
      fetchLinkedPage();
    }
  }, [item]);

  // Track changes
  useEffect(() => {
    if (!item) return;
    const changed =
      title !== item.title ||
      notes !== (item.notes || '') ||
      destinationId !== item.destination_id ||
      spaceId !== item.space_id ||
      projectId !== item.project_id ||
      scheduledAt !== (item.scheduled_at ? item.scheduled_at.slice(0, 16) : '') ||
      JSON.stringify(customValues) !== JSON.stringify(item.custom_values || {});
    setHasChanges(changed);
  }, [item, title, notes, destinationId, spaceId, projectId, scheduledAt, customValues]);

  // Auto-populate space when project is selected
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const selectedProject = projects.find(p => p.id === projectId);
      if (selectedProject?.space_id && selectedProject.space_id !== spaceId) {
        setSpaceId(selectedProject.space_id);
      }
    }
  }, [projectId, projects]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!item || !hasChanges) return;

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const updates: Partial<Item> = {
        title,
        notes: notes || null,
        destination_id: destinationId,
        space_id: spaceId,
        project_id: projectId,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        custom_values: Object.keys(customValues).length > 0 ? customValues : null,
        waiting_for: customValues.waiting_for || null,
      };

      // If scheduled, move to commit layer
      if (scheduledAt && item.layer !== 'commit') {
        updates.layer = 'commit';
      }

      // If has destination and in capture, move to process
      if (destinationId && item.layer === 'capture') {
        updates.layer = 'process';
      }

      const { error } = await supabase
        .from('items')
        .update(updates as any)
        .eq('id', item.id);

      if (error) throw error;

      onUpdate(item.id, updates);
      setHasChanges(false);
      toast.success('Changes saved');
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [item, hasChanges, title, notes, destinationId, spaceId, projectId, scheduledAt, customValues, onUpdate]);

  // Quick process to destination
  const handleQuickProcess = async (destId: string) => {
    if (!item) return;

    setDestinationId(destId);
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const updates: Partial<Item> = {
        destination_id: destId,
        layer: 'process',
      };

      const { error } = await supabase
        .from('items')
        .update(updates as any)
        .eq('id', item.id);

      if (error) throw error;

      onUpdate(item.id, updates);
      toast.success('Item processed');
    } catch (error) {
      toast.error('Failed to process item');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (item) {
      onDelete(item.id);
      onClose();
    }
  };

  // Create linked page
  const handleCreatePage = async () => {
    if (!item) return;

    const supabase = getSupabase();
    setIsCreatingPage(true);

    try {
      const newPage = {
        user_id: item.user_id,
        title: item.title,
        content: item.notes ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: item.notes }] }] } : {},
        space_id: item.space_id,
        project_id: item.project_id,
        item_id: item.id,
      };

      const { data, error } = await supabase
        .from('pages')
        .insert(newPage as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setLinkedPage(data as Page);
        toast.success('Page created');
        router.push(`/pages/${data.id}`);
      }
    } catch (error) {
      toast.error('Failed to create page');
    } finally {
      setIsCreatingPage(false);
    }
  };

  // AI Actions
  const handleAISuggestDestination = async () => {
    if (!item) return;
    setAiLoading('destination');

    try {
      const response = await fetch('/api/ai/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: item.id, title: item.title, notes: item.notes }],
          action: 'categorize',
          destinations: destinations.map(d => ({ id: d.id, slug: d.slug, name: d.name })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestion');

      const data = await response.json();
      if (data.suggestions?.[0]) {
        const suggestion = data.suggestions[0];
        const dest = destinations.find(d => d.slug === suggestion.destinationSlug);
        if (dest) {
          setDestinationId(dest.id);
          toast.success(`AI suggests: ${dest.name}`, {
            description: suggestion.reasoning,
          });
        }
      }
    } catch (error) {
      toast.error('Failed to get AI suggestion');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIImproveTitle = async () => {
    if (!item) return;
    setAiLoading('title');

    try {
      const response = await fetch('/api/ai/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: item.id, title: item.title, notes: item.notes }],
          action: 'improve',
        }),
      });

      if (!response.ok) throw new Error('Failed to improve title');

      const data = await response.json();
      if (data.suggestions?.[0]?.suggestion) {
        setTitle(data.suggestions[0].suggestion);
        toast.success('Title improved', {
          description: data.suggestions[0].reasoning,
        });
      }
    } catch (error) {
      toast.error('Failed to improve title');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAISuggestSchedule = async () => {
    if (!item) return;
    setAiLoading('schedule');

    try {
      const response = await fetch('/api/ai/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: item.id, title: item.title, notes: item.notes }],
          action: 'schedule',
        }),
      });

      if (!response.ok) throw new Error('Failed to get schedule suggestion');

      const data = await response.json();
      if (data.suggestions?.[0]?.suggestion) {
        // Parse the suggestion - format: "Schedule for YYYY-MM-DD at HH:MM"
        const match = data.suggestions[0].suggestion.match(/Schedule for (\d{4}-\d{2}-\d{2})(?: at (\d{2}:\d{2}))?/);
        if (match) {
          const dateStr = match[1];
          const timeStr = match[2] || '09:00';
          setScheduledAt(`${dateStr}T${timeStr}`);
          toast.success('Schedule suggested', {
            description: data.suggestions[0].reasoning,
          });
        }
      }
    } catch (error) {
      toast.error('Failed to get schedule suggestion');
    } finally {
      setAiLoading(null);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSave, onClose]);

  const selectedDestination = destinations.find((d) => d.id === destinationId);
  const destinationFields = selectedDestination?.slug ? DESTINATION_FIELDS[selectedDestination.slug] || [] : [];

  // Get layer icon
  const LayerIcon = item?.layer === 'capture' ? Inbox : item?.layer === 'process' ? ArrowRight : Calendar;

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[var(--border-default)] bg-[var(--bg-base)] shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  item.layer === 'capture' ? 'bg-[var(--layer-capture-bg)]' : item.layer === 'process' ? 'bg-[var(--layer-process-bg)]' : 'bg-[var(--layer-commit-bg)]'
                )}>
                  <LayerIcon className={cn(
                    'h-4 w-4',
                    item.layer === 'capture' ? 'text-[var(--layer-capture)]' : item.layer === 'process' ? 'text-[var(--layer-process)]' : 'text-[var(--layer-commit)]'
                  )} />
                </div>
                <span className="text-sm text-[var(--text-muted)] capitalize">
                  {item.layer} layer
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="text-xs text-muted-foreground">Unsaved changes</span>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Item title..."
                    className="text-lg font-medium border-none px-0 focus-visible:ring-0"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* AI Actions */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Assist
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAISuggestDestination}
                      disabled={aiLoading !== null}
                      className="gap-2"
                    >
                      {aiLoading === 'destination' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      Suggest Destination
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAIImproveTitle}
                      disabled={aiLoading !== null}
                      className="gap-2"
                    >
                      {aiLoading === 'title' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Type className="h-3 w-3" />
                      )}
                      Improve Title
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAISuggestSchedule}
                      disabled={aiLoading !== null}
                      className="gap-2"
                    >
                      {aiLoading === 'schedule' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CalendarDays className="h-3 w-3" />
                      )}
                      Suggest Schedule
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Quick Destination Selection */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground">Where does this go?</Label>
                  <div className="flex flex-wrap gap-2">
                    {destinations.slice(0, 6).map((dest) => {
                      const DestIcon = ICON_MAP[dest.icon] || Inbox;
                      const colorOption = COLOR_PALETTE.find(c => c.value === dest.color);
                      const isSelected = destinationId === dest.id;

                      return (
                        <button
                          key={dest.id}
                          onClick={() => handleQuickProcess(dest.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                            isSelected
                              ? 'border-[var(--accent-base)] bg-[var(--accent-subtle)] text-[var(--accent-base)]'
                              : 'border-[var(--border-default)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-hover)]'
                          )}
                        >
                          <DestIcon className={cn('h-4 w-4', colorOption?.text || 'text-muted-foreground')} />
                          <span>{dest.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {destinations.length > 6 && (
                    <Select
                      value={destinationId || 'none'}
                      onValueChange={(value) => {
                        if (value !== 'none') handleQuickProcess(value);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="More destinations..." />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.slice(6).map((dest) => {
                          const DestIcon = ICON_MAP[dest.icon] || Inbox;
                          return (
                            <SelectItem key={dest.id} value={dest.id}>
                              <span className="flex items-center gap-2">
                                <DestIcon className="h-4 w-4" />
                                <span>{dest.name}</span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Destination-Specific Fields */}
                {destinationFields.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <Label className="text-muted-foreground">
                        {selectedDestination?.name} Details
                      </Label>
                      {destinationFields.map((field) => (
                        <div key={field.name} className="space-y-2">
                          <Label className="text-sm">{field.label}</Label>
                          {field.type === 'select' && field.options ? (
                            <Select
                              value={customValues[field.name] || ''}
                              onValueChange={(value) =>
                                setCustomValues({ ...customValues, [field.name]: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'date' ? (
                            <Input
                              type="date"
                              value={customValues[field.name] || ''}
                              onChange={(e) =>
                                setCustomValues({ ...customValues, [field.name]: e.target.value })
                              }
                            />
                          ) : (
                            <Input
                              type={field.type === 'url' ? 'url' : 'text'}
                              value={customValues[field.name] || ''}
                              onChange={(e) =>
                                setCustomValues({ ...customValues, [field.name]: e.target.value })
                              }
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator />

                {/* Organization */}
                <div className="space-y-4">
                  <Label className="text-muted-foreground">Organization (optional)</Label>

                  {spaces.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Space</Label>
                      <Select
                        value={spaceId || 'none'}
                        onValueChange={(value) => {
                          setSpaceId(value === 'none' ? null : value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No space" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No space</SelectItem>
                          {spaces.map((space) => {
                            const SpaceIcon = ICON_MAP[space.icon] || Inbox;
                            return (
                              <SelectItem key={space.id} value={space.id}>
                                <span className="flex items-center gap-2">
                                  <SpaceIcon className="h-4 w-4" />
                                  <span>{space.name}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Project</Label>
                      <Select
                        value={projectId || 'none'}
                        onValueChange={(value) => {
                          setProjectId(value === 'none' ? null : value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No project</SelectItem>
                          {projects.map((project) => {
                            const ProjectIcon = ICON_MAP[project.icon] || Inbox;
                            return (
                              <SelectItem key={project.id} value={project.id}>
                                <span className="flex items-center gap-2">
                                  <ProjectIcon className="h-4 w-4" />
                                  <span>{project.name}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Schedule */}
                <div className="space-y-4">
                  <Label className="text-muted-foreground">Schedule (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  {scheduledAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScheduledAt('')}
                      className="text-xs text-muted-foreground"
                    >
                      Clear schedule
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Linked Page */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Linked Page</Label>
                  {linkedPage ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/pages/${linkedPage.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="truncate">{linkedPage.title || 'Untitled'}</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCreatePage}
                      disabled={isCreatingPage}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isCreatingPage ? 'Creating...' : 'Create Page'}
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Metadata */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>{formatRelativeTime(item.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span>{formatRelativeTime(item.updated_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source</span>
                    <span className="capitalize">{item.source}</span>
                  </div>
                  {item.is_completed && item.completed_at && (
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span>{formatRelativeTime(item.completed_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-6 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
