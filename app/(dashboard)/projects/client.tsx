'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  FolderOpen,
  ClipboardList,
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

interface ProjectsPageClientProps {
  initialProjects: Project[];
  spaces: Space[];
  userId: string;
}

interface FormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  space_id: string | null;
}

export function ProjectsPageClient({
  initialProjects,
  spaces,
  userId,
}: ProjectsPageClientProps) {
  const getSupabase = () => createClient();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Get suggested color for new project
  const suggestedColor = getSuggestedColor(projects.length);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    icon: 'folder-open',
    color: suggestedColor.value,
    space_id: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reset form with new suggested color
  const resetForm = () => {
    const newSuggestedColor = getSuggestedColor(projects.length);
    setFormData({ name: '', description: '', icon: 'folder-open', color: newSuggestedColor.value, space_id: null });
  };

  // Create project
  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon,
          color: formData.color,
          space_id: formData.space_id,
          sort_order: projects.length,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setProjects([...projects, data as Project]);
      setIsCreateOpen(false);
      resetForm();
      toast.success('Project created');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSaving(false);
    }
  }, [formData, projects, userId]);

  // Update project
  const handleUpdate = useCallback(async () => {
    if (!editingProject || !formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon,
          color: formData.color,
          space_id: formData.space_id,
        } as any)
        .eq('id', editingProject.id);

      if (error) throw error;

      setProjects(
        projects.map((p) =>
          p.id === editingProject.id
            ? { ...p, ...formData, name: formData.name.trim() }
            : p
        )
      );
      setIsEditOpen(false);
      setEditingProject(null);
      toast.success('Project updated');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  }, [editingProject, formData, projects]);

  // Archive project
  const handleArchive = useCallback(
    async (projectId: string) => {
      const supabase = getSupabase();

      try {
        const { error } = await supabase
          .from('projects')
          .update({ status: 'archived' } as any)
          .eq('id', projectId);

        if (error) throw error;

        setProjects(projects.filter((p) => p.id !== projectId));
        toast.success('Project archived');
      } catch (error) {
        console.error('Error archiving project:', error);
        toast.error('Failed to archive project');
      }
    },
    [projects]
  );

  // Delete project
  const handleDelete = useCallback(
    async (projectId: string) => {
      const supabase = getSupabase();

      try {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);

        if (error) throw error;

        setProjects(projects.filter((p) => p.id !== projectId));
        toast.success('Project deleted');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    },
    [projects]
  );

  // Open edit dialog
  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      icon: project.icon,
      color: project.color,
      space_id: project.space_id,
    });
    setIsEditOpen(true);
  };

  // Group projects by space
  const projectsBySpace: Record<string, Project[]> = {};
  const unassignedProjects: Project[] = [];

  projects.forEach((project) => {
    if (project.space_id) {
      if (!projectsBySpace[project.space_id]) {
        projectsBySpace[project.space_id] = [];
      }
      projectsBySpace[project.space_id].push(project);
    } else {
      unassignedProjects.push(project);
    }
  });

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Projects</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Track your ongoing projects and initiatives.
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
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Create a new project to track related tasks and items.
                </DialogDescription>
              </DialogHeader>
              <ProjectForm
                formData={formData}
                setFormData={setFormData}
                spaces={spaces}
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
        {projects.length === 0 ? (
          <EmptyState
            iconName="folder-open"
            title="No projects yet"
            description="Create projects to organize related tasks and track your progress."
            action={{
              label: 'Create Project',
              onClick: () => setIsCreateOpen(true),
            }}
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-8">
            {/* Projects by space */}
            {spaces.map((space) => {
              const spaceProjects = projectsBySpace[space.id] || [];
              if (spaceProjects.length === 0) return null;
              const SpaceIcon = ICON_MAP[space.icon] || FolderOpen;
              const spaceColor = COLOR_PALETTE.find(c => c.value === space.color);

              return (
                <div key={space.id}>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                    <SpaceIcon className={cn('h-5 w-5', spaceColor?.text || 'text-[var(--text-muted)]')} />
                    <span>{space.name}</span>
                    <span className="text-sm text-[var(--text-muted)]">
                      ({spaceProjects.length})
                    </span>
                  </h2>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {spaceProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          space={space}
                          onEdit={() => openEdit(project)}
                          onArchive={() => handleArchive(project.id)}
                          onDelete={() => handleDelete(project.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}

            {/* Unassigned projects */}
            {unassignedProjects.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                  <ClipboardList className="h-5 w-5 text-[var(--text-muted)]" />
                  <span>Unassigned</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    ({unassignedProjects.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {unassignedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={() => openEdit(project)}
                        onArchive={() => handleArchive(project.id)}
                        onDelete={() => handleDelete(project.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            spaces={spaces}
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

// Project Card Component
interface ProjectCardProps {
  project: Project;
  space?: Space;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, space, onEdit, onArchive, onDelete }: ProjectCardProps) {
  const ProjectIcon = ICON_MAP[project.icon] || FolderOpen;
  const colorOption = COLOR_PALETTE.find(c => c.value === project.color);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group block rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--accent-border)]"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
          )}>
            <ProjectIcon className={cn('h-5 w-5', colorOption?.text || 'text-[var(--text-muted)]')} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-medium text-[var(--text-primary)]">{project.name}</h3>
            {project.description && (
              <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">
                {project.description}
              </p>
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
                onEdit();
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                onArchive();
              }}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
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
}

// Project Form Component
interface ProjectFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  spaces: Space[];
}

function ProjectForm({ formData, setFormData, spaces }: ProjectFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Website Redesign"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the project..."
          className="resize-none"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Space</Label>
        <Select
          value={formData.space_id || 'none'}
          onValueChange={(value) =>
            setFormData({ ...formData, space_id: value === 'none' ? null : value })
          }
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
