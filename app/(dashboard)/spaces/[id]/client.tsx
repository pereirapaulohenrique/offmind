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
  Plus,
  FileText,
  FolderOpen,
  ListTodo,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { IconPicker } from '@/components/shared/IconPicker';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Space, Item, Project, Page, Destination } from '@/types/database';

interface SpaceDetailClientProps {
  space: Space;
  items: Item[];
  projects: Project[];
  pages: Page[];
  destinations: Destination[];
  userId: string;
}

export function SpaceDetailClient({
  space: initialSpace,
  items: initialItems,
  projects: initialProjects,
  pages: initialPages,
  destinations,
  userId,
}: SpaceDetailClientProps) {
  const router = useRouter();
  const getSupabase = () => createClient();

  const [space, setSpace] = useState(initialSpace);
  const [items, setItems] = useState(initialItems);
  const [projects, setProjects] = useState(initialProjects);
  const [pages, setPages] = useState(initialPages);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: space.name,
    icon: space.icon,
    color: space.color,
  });
  const [isSaving, setIsSaving] = useState(false);

  const SpaceIcon = ICON_MAP[space.icon] || FolderOpen;
  const colorOption = COLOR_PALETTE.find(c => c.value === space.color);

  // Update space
  const handleUpdate = useCallback(async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('spaces')
        .update({
          name: editForm.name.trim(),
          icon: editForm.icon,
          color: editForm.color,
        } as any)
        .eq('id', space.id);

      if (error) throw error;

      setSpace({ ...space, ...editForm });
      setIsEditOpen(false);
      toast.success('Space updated');
    } catch (error) {
      toast.error('Failed to update space');
    } finally {
      setIsSaving(false);
    }
  }, [editForm, space]);

  // Delete space
  const handleDelete = useCallback(async () => {
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', space.id);

      if (error) throw error;

      toast.success('Space deleted');
      router.push('/spaces');
    } catch (error) {
      toast.error('Failed to delete space');
    } finally {
      setIsSaving(false);
    }
  }, [space, router]);

  // Stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.is_completed).length;
  const totalProjects = projects.length;
  const totalPages = pages.length;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 sm:px-8 warm-glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/spaces">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
          )}>
            <SpaceIcon className={cn('h-5 w-5', colorOption?.text || 'text-[var(--text-muted)]')} />
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{space.name}</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {totalItems} items · {totalProjects} projects · {totalPages} pages
            </p>
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
                Edit Space
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Space
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Items ({totalItems})
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects ({totalProjects})
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
                title="No items in this space"
                description="Items assigned to this space will appear here"
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
                        className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 hover:border-[var(--accent-border)] transition-colors"
                      >
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          item.is_completed ? 'bg-green-500' : 'bg-[var(--text-muted)]'
                        )} />
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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {projects.length === 0 ? (
              <EmptyState
                iconName="folder-open"
                title="No projects in this space"
                description="Create projects to organize your work"
                action={{
                  label: 'Create Project',
                  href: '/projects',
                }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const ProjectIcon = ICON_MAP[project.icon] || FolderOpen;
                  const projColor = COLOR_PALETTE.find(c => c.value === project.color);

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent-border)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded',
                          projColor?.bgSubtle || 'bg-[var(--bg-hover)]'
                        )}>
                          <ProjectIcon className={cn('h-4 w-4', projColor?.text || 'text-[var(--text-muted)]')} />
                        </div>
                        <span className="font-medium">{project.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            {pages.length === 0 ? (
              <EmptyState
                iconName="file-text"
                title="No pages in this space"
                description="Create pages to document your work"
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
            <DialogTitle>Edit Space</DialogTitle>
            <DialogDescription>
              Update your space details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Space name"
              />
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
            <DialogTitle>Delete Space</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{space.name}"? This will not delete items, projects, or pages - they will be unassigned from this space.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete Space'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
