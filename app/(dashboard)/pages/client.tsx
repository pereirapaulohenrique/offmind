'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Star,
  StarOff,
  Trash2,
  MoreVertical,
  FolderOpen,
} from 'lucide-react';
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
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
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
      <div className="px-5 py-4 sm:px-6" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl" style={{ letterSpacing: 'var(--tracking-tight)' }}>Pages</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Your documents and notes
            </p>
          </div>
          <Button onClick={handleCreatePage} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'New Page'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-3 sm:px-6" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
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
                {spaces.map((space) => {
                  const SpaceIcon = ICON_MAP[space.icon] || FolderOpen;
                  return (
                    <SelectItem key={space.id} value={space.id}>
                      <span className="flex items-center gap-2">
                        <SpaceIcon className="h-4 w-4" />
                        {space.name}
                      </span>
                    </SelectItem>
                  );
                })}
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
                {projects.map((project) => {
                  const ProjectIcon = ICON_MAP[project.icon] || FolderOpen;
                  return (
                    <SelectItem key={project.id} value={project.id}>
                      <span className="flex items-center gap-2">
                        <ProjectIcon className="h-4 w-4" />
                        {project.name}
                      </span>
                    </SelectItem>
                  );
                })}
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
            iconName="file-text"
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
                {sortedPages.map((page) => {
                  const pageSpace = spaces.find(s => s.id === page.space_id);
                  const pageProject = projects.find(p => p.id === page.project_id);
                  const PageSpaceIcon = pageSpace ? ICON_MAP[pageSpace.icon] || FolderOpen : null;
                  const PageProjectIcon = pageProject ? ICON_MAP[pageProject.icon] || FolderOpen : null;

                  return (
                    <motion.div
                      key={page.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative rounded-md bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] cursor-pointer transition-all duration-150"
                      onClick={() => router.push(`/pages/${page.id}`)}
                    >
                      {/* Favorite indicator */}
                      {page.is_favorite && (
                        <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}

                      {/* Icon and title */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-hover)]">
                          <FileText className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{page.title || 'Untitled'}</h3>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            Updated {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Space/Project badges */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {pageSpace && PageSpaceIcon && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-xs">
                            <PageSpaceIcon className="h-3 w-3" />
                            {pageSpace.name}
                          </span>
                        )}
                        {pageProject && PageProjectIcon && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-xs">
                            <PageProjectIcon className="h-3 w-3" />
                            {pageProject.name}
                          </span>
                        )}
                      </div>

                      {/* Actions dropdown */}
                      <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(page);
                            }}>
                              {page.is_favorite ? (
                                <>
                                  <StarOff className="mr-2 h-4 w-4" />
                                  Unfavorite
                                </>
                              ) : (
                                <>
                                  <Star className="mr-2 h-4 w-4" />
                                  Favorite
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(page.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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
          </div>
        )}
      </div>
    </div>
  );
}
