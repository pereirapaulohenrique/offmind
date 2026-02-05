'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { usePagesStore } from '@/stores/pages';
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
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Page, Space, Project } from '@/types/database';

interface PagesListClientProps {
  initialPages: Page[];
  spaces: Space[];
  projects: Project[];
  userId: string;
}

export function PagesListClient({
  initialPages,
  spaces,
  projects,
  userId,
}: PagesListClientProps) {
  const router = useRouter();
  const getSupabase = () => createClient();
  const { pages, setPages, addPage, removePage, isLoading, setLoading } = usePagesStore();
  const [search, setSearch] = useState('');
  const [filterSpace, setFilterSpace] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Initialize pages
  useEffect(() => {
    setPages(initialPages);
  }, [initialPages, setPages]);

  // Create new page
  const handleCreatePage = useCallback(async () => {
    const supabase = getSupabase();
    setIsCreating(true);

    try {
      const newPage = {
        user_id: userId,
        title: 'Untitled',
        content: {},
        space_id: filterSpace !== 'all' ? filterSpace : null,
        project_id: filterProject !== 'all' ? filterProject : null,
      };

      const { data, error } = await supabase
        .from('pages')
        .insert(newPage as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        addPage(data as Page);
        router.push(`/pages/${data.id}`);
      }
    } catch (error) {
      toast.error('Failed to create page');
    } finally {
      setIsCreating(false);
    }
  }, [userId, filterSpace, filterProject, addPage, router]);

  // Delete page
  const handleDeletePage = useCallback(async (id: string) => {
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      removePage(id);
      toast.success('Page deleted');
    } catch (error) {
      toast.error('Failed to delete page');
    }
  }, [removePage]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(async (page: Page) => {
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_favorite: !page.is_favorite } as any)
        .eq('id', page.id);

      if (error) throw error;

      setPages(pages.map(p =>
        p.id === page.id ? { ...p, is_favorite: !p.is_favorite } : p
      ));
    } catch (error) {
      toast.error('Failed to update page');
    }
  }, [pages, setPages]);

  // Filter pages
  const filteredPages = pages.filter((page) => {
    // Search filter
    if (search && !page.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Space filter
    if (filterSpace !== 'all' && page.space_id !== filterSpace) {
      return false;
    }
    // Project filter
    if (filterProject !== 'all' && page.project_id !== filterProject) {
      return false;
    }
    return true;
  });

  // Sort favorites first, then by updated_at
  const sortedPages = [...filteredPages].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Pages</h1>
            <p className="text-sm text-muted-foreground">
              Your documents and notes
            </p>
          </div>
          <Button onClick={handleCreatePage} disabled={isCreating}>
            {isCreating ? 'Creating...' : '+ New Page'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          {spaces.length > 0 && (
            <Select value={filterSpace} onValueChange={setFilterSpace}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All spaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All spaces</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.icon} {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {projects.length > 0 && (
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.icon} {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Pages list */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <LoadingState count={6} type="card" />
        ) : sortedPages.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No pages yet"
            description="Create your first page to start writing"
            action={{
              label: isCreating ? 'Creating...' : 'Create Page',
              onClick: handleCreatePage,
            }}
          />
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {sortedPages.map((page) => (
                  <motion.div
                    key={page.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative rounded-lg border bg-card p-4 hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => router.push(`/pages/${page.id}`)}
                  >
                    {/* Favorite indicator */}
                    {page.is_favorite && (
                      <span className="absolute top-2 right-2 text-yellow-500">⭐</span>
                    )}

                    {/* Icon and title */}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{page.icon || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{page.title || 'Untitled'}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Space/Project badges */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {page.space_id && spaces.find(s => s.id === page.space_id) && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {spaces.find(s => s.id === page.space_id)?.icon}{' '}
                          {spaces.find(s => s.id === page.space_id)?.name}
                        </span>
                      )}
                      {page.project_id && projects.find(p => p.id === page.project_id) && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {projects.find(p => p.id === page.project_id)?.icon}{' '}
                          {projects.find(p => p.id === page.project_id)?.name}
                        </span>
                      )}
                    </div>

                    {/* Actions dropdown */}
                    <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(page);
                          }}>
                            {page.is_favorite ? '☆ Unfavorite' : '⭐ Favorite'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.id);
                            }}
                          >
                            🗑️ Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
