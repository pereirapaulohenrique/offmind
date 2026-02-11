'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/editor';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Page, Space, Project, Item } from '@/types/database';

interface PageEditorClientProps {
  page: Page;
  spaces: Space[];
  projects: Project[];
  linkedItem: Item | null;
}

// Common emojis for page icons
const PAGE_ICONS = ['📄', '📝', '📋', '📌', '📎', '📁', '💡', '⭐', '🎯', '🚀', '💻', '🔧', '📊', '📈', '🗒️', '📚'];

export function PageEditorClient({
  page: initialPage,
  spaces,
  projects,
  linkedItem,
}: PageEditorClientProps) {
  const router = useRouter();
  const getSupabase = () => createClient();
  const [page, setPage] = useState(initialPage);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(page.updated_at));
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smart back navigation based on page context
  const backHref = page.project_id
    ? `/projects/${page.project_id}`
    : page.space_id
      ? `/spaces/${page.space_id}`
      : '/pages';
  const backLabel = page.project_id
    ? (projects.find(p => p.id === page.project_id)?.name || 'Project')
    : page.space_id
      ? (spaces.find(s => s.id === page.space_id)?.name || 'Space')
      : 'Pages';

  // Auto-save function
  const saveChanges = useCallback(async (updates: Partial<Page>) => {
    const supabase = getSupabase();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('pages')
        .update(updates as any)
        .eq('id', page.id);

      if (error) throw error;

      setLastSaved(new Date());
      setPage((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [page.id]);

  // Debounced save for content
  const debouncedSave = useCallback((content: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveChanges({ content });
    }, 1000);
  }, [saveChanges]);

  // Handle title change
  const handleTitleChange = useCallback((title: string) => {
    setPage((prev) => ({ ...prev, title }));
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges({ title });
    }, 500);
  }, [saveChanges]);

  // Handle content change
  const handleContentChange = useCallback((content: any) => {
    setPage((prev) => ({ ...prev, content }));
    debouncedSave(content);
  }, [debouncedSave]);

  // Handle icon change
  const handleIconChange = useCallback((icon: string) => {
    setPage((prev) => ({ ...prev, icon }));
    saveChanges({ icon });
  }, [saveChanges]);

  // Handle space change
  const handleSpaceChange = useCallback((spaceId: string) => {
    const space_id = spaceId === 'none' ? null : spaceId;
    setPage((prev) => ({ ...prev, space_id }));
    saveChanges({ space_id } as any);
  }, [saveChanges]);

  // Handle project change
  const handleProjectChange = useCallback((projectId: string) => {
    const project_id = projectId === 'none' ? null : projectId;
    setPage((prev) => ({ ...prev, project_id }));
    saveChanges({ project_id } as any);
  }, [saveChanges]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(() => {
    const is_favorite = !page.is_favorite;
    setPage((prev) => ({ ...prev, is_favorite }));
    saveChanges({ is_favorite });
  }, [page.is_favorite, saveChanges]);

  // Delete page
  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this page? This cannot be undone.')) return;

    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', page.id);

      if (error) throw error;

      toast.success('Page deleted');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to delete page');
    }
  }, [page.id, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-6 py-3 sm:px-8 warm-glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(backHref)}>
              ← {backLabel}
            </Button>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-sm text-[var(--text-muted)] truncate max-w-[200px]">
              {page.title || 'Untitled'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Save status */}
            <span className="text-xs text-[var(--text-muted)]">
              {isSaving ? 'Saving...' : `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`}
            </span>

            {/* Favorite button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={page.is_favorite ? 'text-yellow-500' : ''}
            >
              {page.is_favorite ? '⭐' : '☆'}
            </Button>

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleFavorite}>
                  {page.is_favorite ? '☆ Remove from favorites' : '⭐ Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  🗑️ Delete page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Page icon and title */}
          <div className="mb-6">
            <div className="flex items-start gap-4">
              {/* Icon picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-16 w-16 p-0 text-4xl hover:bg-[var(--bg-hover)]">
                    {page.icon || '📄'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="grid grid-cols-4 gap-1 p-2">
                  {PAGE_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      variant="ghost"
                      className="h-10 w-10 p-0 text-xl"
                      onClick={() => handleIconChange(icon)}
                    >
                      {icon}
                    </Button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Title input */}
              <Input
                value={page.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled"
                className="flex-1 border-none bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
              />
            </div>

            {/* Metadata row */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              {/* Space selector */}
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">Space:</span>
                <Select
                  value={page.space_id || 'none'}
                  onValueChange={handleSpaceChange}
                >
                  <SelectTrigger className="h-8 w-36 border-dashed">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {spaces.map((space) => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.icon} {space.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project selector */}
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">Project:</span>
                <Select
                  value={page.project_id || 'none'}
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger className="h-8 w-36 border-dashed">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.icon} {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Born from item */}
              {linkedItem && (
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">Born from:</span>
                  <Link
                    href={`/items/${linkedItem.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-hover)] px-2.5 py-0.5 text-sm hover:bg-[rgba(194,65,12,0.12)] hover:text-[#c2410c] transition-colors"
                  >
                    <span className="text-[10px]">🌱</span>
                    {linkedItem.title}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6 border-b" />

          {/* Tiptap editor */}
          <TiptapEditor
            content={page.content}
            onChange={handleContentChange}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
}
