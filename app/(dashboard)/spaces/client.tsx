'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Pencil, Trash2, FolderOpen } from 'lucide-react';
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
import { IconPicker } from '@/components/shared/IconPicker';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ICON_MAP, COLOR_PALETTE, getSuggestedColor } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Space, Project } from '@/types/database';
import { toast } from 'sonner';

interface SpacesPageClientProps {
  initialSpaces: Space[];
  projectsBySpace: Record<string, Project[]>;
  userId: string;
}

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

  // Get suggested color for new space
  const suggestedColor = getSuggestedColor(spaces.length);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'folder',
    color: suggestedColor.value
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reset form with new suggested color
  const resetForm = () => {
    const newSuggestedColor = getSuggestedColor(spaces.length);
    setFormData({ name: '', icon: 'folder', color: newSuggestedColor.value });
  };

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
      resetForm();
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
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
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
            iconName="folder"
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
                const SpaceIcon = ICON_MAP[space.icon] || FolderOpen;
                const colorOption = COLOR_PALETTE.find(c => c.value === space.color);

                return (
                  <motion.div
                    key={space.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Link
                      href={`/spaces/${space.id}`}
                      className="group block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-lg',
                          colorOption?.bgSubtle || 'bg-muted'
                        )}>
                          <SpaceIcon className={cn('h-6 w-6', colorOption?.text || 'text-muted-foreground')} />
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
                              {projects.slice(0, 3).map((project) => {
                                const ProjectIcon = ICON_MAP[project.icon] || FolderOpen;
                                return (
                                  <span
                                    key={project.id}
                                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                  >
                                    <ProjectIcon className="h-3 w-3" />
                                    {project.name}
                                  </span>
                                );
                              })}
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
                          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.preventDefault();
                              openEdit(space);
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(space.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Link>
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

// Space Form Component with IconPicker and ColorPicker
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Icon</Label>
          <IconPicker
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <ColorPicker
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
          />
        </div>
      </div>
    </div>
  );
}
