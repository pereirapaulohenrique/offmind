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
import { ICON_MAP } from '@/components/icons';
import { FolderOpen } from 'lucide-react';
import { PageCaptureQueue } from '@/components/pages/PageCaptureQueue';
import type { Page, Space, Project, Item } from '@/types/database';

interface PageEditorClientProps {
  page: Page;
  spaces: Space[];
  projects: Project[];
  linkedItem: Item | null;
  capturedItems?: Item[];
}

// Common emojis for page icons
const PAGE_ICONS = ['📄', '📝', '📋', '📌', '📎', '📁', '💡', '⭐', '🎯', '🚀', '💻', '🔧', '📊', '📈', '🗒️', '📚'];

export function PageEditorClient({
  page: initialPage,
  spaces,
  projects,
  linkedItem,
  capturedItems: initialCapturedItems = [],
}: PageEditorClientProps) {
  const router = useRouter();
  const getSupabase = () => createClient();
  const [page, setPage] = useState(initialPage);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(page.updated_at));
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [queueItems, setQueueItems] = useState<Item[]>(initialCapturedItems);
  const editorRef = useRef<any>(null);

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

  // Auto-save function (silent mode skips isSaving state to avoid re-render hiccups)
  const saveChanges = useCallback(async (updates: Partial<Page>, silent = false) => {
    const supabase = getSupabase();
    if (!silent) setIsSaving(true);

    try {
      const { error } = await supabase
        .from('pages')
        .update(updates as any)
        .eq('id', page.id);

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      if (!silent) setIsSaving(false);
    }
  }, [page.id]);

  // Debounced save for content — longer delay + silent to avoid typing hiccups
  const debouncedSave = useCallback((content: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveChanges({ content }, true);
    }, 3000);
  }, [saveChanges]);

  // Handle title change
  const handleTitleChange = useCallback((title: string) => {
    setPage((prev) => ({ ...prev, title }));
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges({ title });
    }, 2000);
  }, [saveChanges]);

  // Handle content change — don't update React state on every keystroke,
  // TipTap manages its own DOM. Just debounce-save to DB.
  const handleContentChange = useCallback((content: any) => {
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

  // Store editor reference for programmatic insertion
  const handleEditorReady = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  // Realtime subscription for new captures to this page
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel(`page-captures-${page.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'items',
          filter: `page_id=eq.${page.id}`,
        },
        (payload: any) => {
          const newItem = payload.new as Item;
          if (newItem.layer === 'capture' && !newItem.archived_at) {
            setQueueItems((prev) => [newItem, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page.id]);

  // Append a captured item's content to the editor
  const handleAppendItem = useCallback(async (item: Item) => {
    const editor = editorRef.current;
    if (editor) {
      const textToAppend = item.notes || item.title;
      editor.chain().focus('end').insertContent(`<p>${textToAppend}</p>`).run();
    }

    // Clear page_id from the item
    const supabase = getSupabase();
    await supabase
      .from('items')
      .update({ page_id: null } as any)
      .eq('id', item.id);

    setQueueItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success('Appended to page');
  }, []);

  // Append all captured items
  const handleAppendAll = useCallback(async () => {
    const editor = editorRef.current;
    if (editor && queueItems.length > 0) {
      const content = queueItems
        .map((item) => `<p>${item.notes || item.title}</p>`)
        .join('');
      editor.chain().focus('end').insertContent(content).run();
    }

    const supabase = getSupabase();
    const ids = queueItems.map((i) => i.id);
    await supabase
      .from('items')
      .update({ page_id: null } as any)
      .in('id', ids);

    setQueueItems([]);
    toast.success(`Appended ${ids.length} items`);
  }, [queueItems]);

  // Move item back to inbox (clear page_id, keep in capture layer)
  const handleLinkItem = useCallback(async (item: Item) => {
    const supabase = getSupabase();
    await supabase
      .from('items')
      .update({ page_id: null } as any)
      .eq('id', item.id);

    setQueueItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success('Moved to inbox');
  }, []);

  // Dismiss — just clear page_id
  const handleDismissItem = useCallback(async (item: Item) => {
    const supabase = getSupabase();
    await supabase
      .from('items')
      .update({ page_id: null } as any)
      .eq('id', item.id);

    setQueueItems((prev) => prev.filter((i) => i.id !== item.id));
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
            {/* Capture queue badge */}
            <PageCaptureQueue
              items={queueItems}
              onAppendItem={handleAppendItem}
              onAppendAll={handleAppendAll}
              onLinkItem={handleLinkItem}
              onDismissItem={handleDismissItem}
            />

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
        <div className="mx-auto max-w-6xl px-6 py-8">
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
                    {spaces.map((space) => {
                      const SpIcon = ICON_MAP[space.icon] || FolderOpen;
                      return (
                        <SelectItem key={space.id} value={space.id}>
                          <span className="flex items-center gap-2">
                            <SpIcon className="h-4 w-4" />
                            {space.name}
                          </span>
                        </SelectItem>
                      );
                    })}
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
                    {projects.map((project) => {
                      const PrIcon = ICON_MAP[project.icon] || FolderOpen;
                      return (
                        <SelectItem key={project.id} value={project.id}>
                          <span className="flex items-center gap-2">
                            <PrIcon className="h-4 w-4" />
                            {project.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Born from item */}
              {linkedItem && (
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">Born from:</span>
                  <Link
                    href={`/items/${linkedItem.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-hover)] px-2.5 py-0.5 text-sm hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-base)] transition-colors"
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
            onEditorReady={handleEditorReady}
          />
        </div>
      </div>
    </div>
  );
}
