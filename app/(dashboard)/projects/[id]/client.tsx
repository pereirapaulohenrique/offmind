'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Trash2,
  MoreHorizontal,
  FileText,
  FolderOpen,
  ListTodo,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/shared/EmptyState';
import { IconPicker } from '@/components/shared/IconPicker';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Space, Item, Project, Page, Destination } from '@/types/database';

interface ProjectDetailClientProps {
  project: Project & { spaces?: Space };
  items: Item[];
  pages: Page[];
  destinations: Destination[];
  spaces: Space[];
  userId: string;
}

export function ProjectDetailClient({
  project: initialProject,
  items: initialItems,
  pages: initialPages,
  destinations,
  spaces,
  userId,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const getSupabase = () => createClient();

  const [project, setProject] = useState(initialProject);
  const [items, setItems] = useState(initialItems);
  const [pages, setPages] = useState(initialPages);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    icon: project.icon,
    color: project.color,
    space_id: project.space_id || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const ProjectIcon = ICON_MAP[project.icon] || FolderOpen;
  const colorOption = COLOR_PALETTE.find(c => c.value === project.color);

  // Stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.is_completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const totalPages = pages.length;

  // Update project
  const handleUpdate = useCallback(async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editForm.name.trim(),
          icon: editForm.icon,
          color: editForm.color,
          space_id: editForm.space_id || null,
        } as any)
        .eq('id', project.id);

      if (error) throw error;

      setProject({ ...project, ...editForm });
      setIsEditOpen(false);
      toast.success('Project updated');
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  }, [editForm, project]);

  // Delete project
  const handleDelete = useCallback(async () => {
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast.success('Project deleted');
      router.push('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setIsSaving(false);
    }
  }, [project, router]);

  // Parent space info
  const parentSpace = project.spaces || spaces.find(s => s.id === project.space_id);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 sm:px-8 warm-glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
          )}>
            <ProjectIcon className={cn('h-5 w-5', colorOption?.text || 'text-[var(--text-muted)]')} />
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{project.name}</h1>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              {parentSpace && (
                <>
                  <Link href={`/spaces/${parentSpace.id}`} className="hover:text-foreground">
                    {parentSpace.name}
                  </Link>
                  <span>·</span>
                </>
              )}
              <span>{totalItems} items · {totalPages} pages</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress bar */}
        {totalItems > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[var(--text-muted)]">Progress</span>
              <span className="font-medium">{completedItems}/{totalItems} ({progressPercent}%)</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Items ({totalItems})
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="h-4 w-4" />
              Pages ({totalPages})
            </TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-4">
            {items.length === 0 ? (
              <EmptyState
                iconName="list-todo"
                title="No items in this project"
                description="Items assigned to this project will appear here"
              />
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((item) => {
                    const dest = destinations.find(d => d.id === item.destination_id);
                    const DestIcon = dest ? ICON_MAP[dest.icon] : null;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Link
                          href={`/items/${item.id}`}
                          className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 hover:border-[var(--accent-border)] transition-colors"
                        >
                          {item.is_completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-[var(--text-muted)]" />
                          )}
                          <span className={cn(
                            'flex-1',
                            item.is_completed && 'line-through text-[var(--text-muted)]'
                          )}>
                            {item.title}
                          </span>
                          {dest && DestIcon && (
                            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <DestIcon className="h-3 w-3" />
                              {dest.name}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            {pages.length === 0 ? (
              <EmptyState
                iconName="file-text"
                title="No pages in this project"
                description="Create pages to document your project"
                action={{
                  label: 'Create Page',
                  href: '/pages',
                }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/pages/${page.id}`}
                    className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent-border)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[var(--text-muted)]" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{page.title || 'Untitled'}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          Updated {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Space</label>
              <Select
                value={editForm.space_id || 'none'}
                onValueChange={(value) => setEditForm({ ...editForm, space_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No space</SelectItem>
                  {spaces.map((space) => {
                    const SpaceIcon = ICON_MAP[space.icon] || FolderOpen;
                    return (
                      <SelectItem key={space.id} value={space.id}>
                        <div className="flex items-center gap-2">
                          <SpaceIcon className="h-4 w-4" />
                          {space.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <IconPicker
                  value={editForm.icon}
                  onChange={(icon) => setEditForm({ ...editForm, icon })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <ColorPicker
                  value={editForm.color}
                  onChange={(color) => setEditForm({ ...editForm, color })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{project.name}"? This will not delete items or pages - they will be unassigned from this project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
