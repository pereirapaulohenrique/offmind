'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import type { Space, Project } from '@/types/database';
import { toast } from 'sonner';

interface SpacesPageClientProps {
  initialSpaces: Space[];
  projectsBySpace: Record<string, Project[]>;
  userId: string;
}

const EMOJI_OPTIONS = ['📁', '🏠', '💼', '🎮', '❤️', '🎯', '📚', '🌟', '🚀', '💡', '🎨', '🏃'];
const COLOR_OPTIONS = ['blue', 'purple', 'green', 'yellow', 'pink', 'orange', 'red', 'gray'];

export function SpacesPageClient({
  initialSpaces,
  projectsBySpace,
  userId,
}: SpacesPageClientProps) {
  const getSupabase = () => createClient();
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '📁', color: 'blue' });
  const [isSaving, setIsSaving] = useState(false);

  // Create space
  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          user_id: userId,
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          sort_order: spaces.length,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setSpaces([...spaces, data as Space]);
      setIsCreateOpen(false);
      setFormData({ name: '', icon: '📁', color: 'blue' });
      toast.success('Space created');
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create space');
    } finally {
      setIsSaving(false);
    }
  }, [formData, spaces, userId]);

  // Update space
  const handleUpdate = useCallback(async () => {
    if (!editingSpace || !formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('spaces')
        .update({
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
        } as any)
        .eq('id', editingSpace.id);

      if (error) throw error;

      setSpaces(
        spaces.map((s) =>
          s.id === editingSpace.id
            ? { ...s, name: formData.name.trim(), icon: formData.icon, color: formData.color }
            : s
        )
      );
      setIsEditOpen(false);
      setEditingSpace(null);
      toast.success('Space updated');
    } catch (error) {
      console.error('Error updating space:', error);
      toast.error('Failed to update space');
    } finally {
      setIsSaving(false);
    }
  }, [editingSpace, formData, spaces]);

  // Delete space
  const handleDelete = useCallback(
    async (spaceId: string) => {
      const supabase = getSupabase();

      try {
        const { error } = await supabase.from('spaces').delete().eq('id', spaceId);

        if (error) throw error;

        setSpaces(spaces.filter((s) => s.id !== spaceId));
        toast.success('Space deleted');
      } catch (error) {
        console.error('Error deleting space:', error);
        toast.error('Failed to delete space');
      }
    },
    [spaces]
  );

  // Open edit dialog
  const openEdit = (space: Space) => {
    setEditingSpace(space);
    setFormData({ name: space.name, icon: space.icon, color: space.color });
    setIsEditOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Spaces</h1>
            <p className="text-sm text-muted-foreground">
              Organize your life into distinct areas.
            </p>
          </div>

          {/* Create button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <span className="mr-2">+</span>
                New Space
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Space</DialogTitle>
                <DialogDescription>
                  Create a new space to organize related items and projects.
                </DialogDescription>
              </DialogHeader>
              <SpaceForm
                formData={formData}
                setFormData={setFormData}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {spaces.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No spaces yet"
            description="Create spaces to organize your life into distinct areas like Work, Personal, or Health."
            action={{
              label: 'Create Space',
              onClick: () => setIsCreateOpen(true),
            }}
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            <AnimatePresence mode="popLayout">
              {spaces.map((space) => {
                const projects = projectsBySpace[space.id] || [];
                return (
                  <motion.div
                    key={space.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-emphasis"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                        style={{
                          backgroundColor: `var(--${space.color}-100, hsl(var(--muted)))`,
                        }}
                      >
                        {space.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-foreground">
                          {space.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {projects.length} project{projects.length !== 1 ? 's' : ''}
                        </p>

                        {/* Projects preview */}
                        {projects.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {projects.slice(0, 3).map((project) => (
                              <span
                                key={project.id}
                                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              >
                                {project.icon} {project.name}
                              </span>
                            ))}
                            {projects.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{projects.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span>⋯</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(space)}>
                            <span className="mr-2">✏️</span>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(space.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <span className="mr-2">🗑️</span>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Space</DialogTitle>
            <DialogDescription>
              Update your space details.
            </DialogDescription>
          </DialogHeader>
          <SpaceForm
            formData={formData}
            setFormData={setFormData}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Space Form Component
interface SpaceFormProps {
  formData: { name: string; icon: string; color: string };
  setFormData: (data: { name: string; icon: string; color: string }) => void;
}

function SpaceForm({ formData, setFormData }: SpaceFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Work, Personal, Health"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setFormData({ ...formData, icon: emoji })}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-colors',
                formData.icon === emoji
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
              )}
              style={{
                backgroundColor: `var(--${color}-500, var(--muted))`,
              }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
