'use client';

import { useState, useCallback } from 'react';
import { useFiltersStore } from '@/stores/filters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Destination, Space, Project } from '@/types/database';
import type { ItemSort } from '@/types';

interface FilterBarProps {
  destinations?: Destination[];
  spaces?: Space[];
  projects?: Project[];
  showDestinationFilter?: boolean;
  showSpaceFilter?: boolean;
  showProjectFilter?: boolean;
  showCompletedFilter?: boolean;
  showSortOptions?: boolean;
  className?: string;
}

export function FilterBar({
  destinations = [],
  spaces = [],
  projects = [],
  showDestinationFilter = true,
  showSpaceFilter = false,
  showProjectFilter = false,
  showCompletedFilter = true,
  showSortOptions = true,
  className,
}: FilterBarProps) {
  const { filters, sort, setFilter, clearFilter, clearAllFilters, setSort } = useFiltersStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      // Simple debounce
      const timeoutId = setTimeout(() => {
        if (value.trim()) {
          setFilter('search', value.trim());
        } else {
          clearFilter('search');
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [setFilter, clearFilter]
  );

  const handleSortChange = (field: ItemSort['field']) => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'desc' });
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.destinationId ||
    filters.spaceId ||
    filters.projectId ||
    filters.isCompleted !== undefined;

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          🔍
        </span>
        <Input
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search items..."
          className="pl-9"
        />
      </div>

      {/* Destination filter */}
      {showDestinationFilter && destinations.length > 0 && (
        <Select
          value={filters.destinationId || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              clearFilter('destinationId');
            } else {
              setFilter('destinationId', value);
            }
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All destinations</SelectItem>
            {destinations.map((dest) => (
              <SelectItem key={dest.id} value={dest.id}>
                <span className="flex items-center gap-2">
                  <span>{dest.icon}</span>
                  <span>{dest.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Space filter */}
      {showSpaceFilter && spaces.length > 0 && (
        <Select
          value={filters.spaceId || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              clearFilter('spaceId');
            } else {
              setFilter('spaceId', value);
            }
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Space" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All spaces</SelectItem>
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
      )}

      {/* Project filter */}
      {showProjectFilter && projects.length > 0 && (
        <Select
          value={filters.projectId || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              clearFilter('projectId');
            } else {
              setFilter('projectId', value);
            }
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <span className="flex items-center gap-2">
                  <span>{project.icon}</span>
                  <span>{project.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Completed filter */}
      {showCompletedFilter && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.isCompleted === undefined}
              onCheckedChange={() => clearFilter('isCompleted')}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.isCompleted === false}
              onCheckedChange={() => setFilter('isCompleted', false)}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.isCompleted === true}
              onCheckedChange={() => setFilter('isCompleted', true)}
            >
              Completed
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Sort options */}
      {showSortOptions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Sort: {getSortLabel(sort.field)}
              <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={sort.field === 'created_at'}
              onCheckedChange={() => handleSortChange('created_at')}
            >
              Created
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sort.field === 'updated_at'}
              onCheckedChange={() => handleSortChange('updated_at')}
            >
              Updated
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sort.field === 'title'}
              onCheckedChange={() => handleSortChange('title')}
            >
              Title
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sort.field === 'scheduled_at'}
              onCheckedChange={() => handleSortChange('scheduled_at')}
            >
              Scheduled
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearAllFilters();
            setSearchInput('');
          }}
          className="text-[var(--text-muted)]"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

function getSortLabel(field: ItemSort['field']): string {
  switch (field) {
    case 'created_at':
      return 'Created';
    case 'updated_at':
      return 'Updated';
    case 'title':
      return 'Title';
    case 'scheduled_at':
      return 'Scheduled';
    case 'sort_order':
      return 'Manual';
    default:
      return field;
  }
}
