'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/dates';
import type { Item, Destination, Space, Project, Page } from '@/types/database';
import { toast } from 'sonner';

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
  const [waitingFor, setWaitingFor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [linkedPage, setLinkedPage] = useState<Page | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setNotes(item.notes || '');
      setDestinationId(item.destination_id);
      setSpaceId(item.space_id);
      setProjectId(item.project_id);
      setScheduledAt(item.scheduled_at ? item.scheduled_at.slice(0, 16) : '');
      setWaitingFor(item.waiting_for || '');
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
      waitingFor !== (item.waiting_for || '');
    setHasChanges(changed);
  }, [item, title, notes, destinationId, spaceId, projectId, scheduledAt, waitingFor]);

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
        waiting_for: waitingFor || null,
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
  }, [item, hasChanges, title, notes, destinationId, spaceId, projectId, scheduledAt, waitingFor, onUpdate]);

  // Auto-save on blur
  const handleBlur = () => {
    if (hasChanges) {
      handleSave();
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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {item.layer === 'capture' && '📥'}
                  {item.layer === 'process' && '📤'}
                  {item.layer === 'commit' && '📅'}
                </span>
                <span className="text-sm text-muted-foreground capitalize">
                  {item.layer} layer
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="text-xs text-muted-foreground">Unsaved changes</span>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <span>✕</span>
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
                    placeholder="Add notes..."
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <Separator />

                {/* Destination */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Destination</Label>
                  <Select
                    value={destinationId || 'none'}
                    onValueChange={(value) => {
                      setDestinationId(value === 'none' ? null : value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination">
                        {selectedDestination ? (
                          <span className="flex items-center gap-2">
                            <span>{selectedDestination.icon}</span>
                            <span>{selectedDestination.name}</span>
                          </span>
                        ) : (
                          'No destination'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No destination</SelectItem>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={dest.id}>
                          <span className="flex items-center gap-2">
                            <span>{dest.icon}</span>
                            <span>{dest.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Waiting for (only for waiting destination) */}
                {selectedDestination?.slug === 'waiting' && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Waiting for</Label>
                    <Input
                      value={waitingFor}
                      onChange={(e) => setWaitingFor(e.target.value)}
                      onBlur={handleBlur}
                      placeholder="Person or thing you're waiting for..."
                    />
                  </div>
                )}

                {/* Schedule */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Schedule</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    onBlur={handleBlur}
                  />
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

                {/* Organization */}
                {spaces.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Space</Label>
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
                        {spaces.map((space) => (
                          <SelectItem key={space.id} value={space.id}>
                            <span className="flex items-center gap-2">
                              <span>{space.icon}</span>
                              <span>{space.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Project</Label>
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
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <span className="flex items-center gap-2">
                              <span>{project.icon}</span>
                              <span>{project.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                {/* Linked Page */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Page</Label>
                  {linkedPage ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/pages/${linkedPage.id}`)}
                    >
                      <span className="mr-2">{linkedPage.icon || '📄'}</span>
                      <span className="truncate">{linkedPage.title || 'Untitled'}</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCreatePage}
                      disabled={isCreatingPage}
                    >
                      {isCreatingPage ? 'Creating...' : '📄 Create Page'}
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
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <span className="mr-2">🗑️</span>
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
