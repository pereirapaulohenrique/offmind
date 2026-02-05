'use client';

import { useState, useCallback } from 'react';
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

interface ProjectsPageClientProps {
  initialProjects: Project[];
  spaces: Space[];
  userId: string;
}

const EMOJI_OPTIONS = ['📁', '🎯', '💼', '🎮', '📝', '🚀', '💡', '📊', '🔧', '🎨', '📚', '⭐'];
const COLOR_OPTIONS = ['indigo', 'blue', 'purple', 'green', 'yellow', 'pink', 'orange', 'red'];

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
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    icon: '📁',
    color: 'indigo',
    space_id: null,
  });
  const [isSaving, setIsSaving] = useState(false);

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
      setFormData({ name: '', description: '', icon: '📁', color: 'indigo', space_id: null });
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
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Track your ongoing projects and initiatives.
            </p>
          </div>

          {/* Create button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <span className="mr-2">+</span>
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
            icon="📁"
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

              return (
                <div key={space.id}>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-foreground">
                    <span>{space.icon}</span>
                    <span>{space.name}</span>
                    <span className="text-sm text-muted-foreground">
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
                <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-foreground">
                  <span>📋</span>
                  <span>Unassigned</span>
                  <span className="text-sm text-muted-foreground">
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-emphasis"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
          style={{
            backgroundColor: `var(--${project.color}-100, hsl(var(--muted)))`,
          }}
        >
          {project.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{project.name}</h3>
          {project.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
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
            <DropdownMenuItem onClick={onEdit}>
              <span className="mr-2">✏️</span>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <span className="mr-2">📥</span>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
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
