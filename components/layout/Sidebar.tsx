'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sun,
  Inbox,
  Columns3,
  Calendar,
  ListTodo,
  Clock,
  Archive,
  RotateCcw,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { useInboxCount } from '@/stores/items';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SidebarProps {
  inboxCount?: number;
  spaces?: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    projects?: Array<{
      id: string;
      name: string;
      icon: string;
      color: string;
      pages?: Array<{
        id: string;
        title: string;
        icon: string;
      }>;
    }>;
  }>;
}

// ---------------------------------------------------------------------------
// Navigation data
// ---------------------------------------------------------------------------

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

const primaryNav: NavEntry[] = [
  { href: '/today', label: 'Today', icon: Sun, shortcut: '\u2318 0' },
  { href: '/inbox', label: 'Inbox', icon: Inbox, shortcut: '\u2318 1' },
  { href: '/organize', label: 'Organize', icon: Columns3, shortcut: '\u2318 2' },
];

const destinationNav: NavEntry[] = [
  { href: '/schedule', label: 'Schedule', icon: Calendar, shortcut: '\u2318 3' },
  { href: '/backlog', label: 'Backlog', icon: ListTodo },
  { href: '/waiting-for', label: 'Waiting For', icon: Clock },
  { href: '/archive', label: 'Archive', icon: Archive },
];

const toolsNav: NavEntry[] = [
  { href: '/review', label: 'Weekly Review', icon: RotateCcw },
];

// ---------------------------------------------------------------------------
// Spring presets
// ---------------------------------------------------------------------------

const spring = { type: 'spring' as const, stiffness: 350, damping: 28 };
const springFast = { type: 'spring' as const, stiffness: 400, damping: 30 };

// ---------------------------------------------------------------------------
// Layer-aware active colors
// ---------------------------------------------------------------------------

type LayerStyle = {
  bg: string;
  text: string;
  pill: string;
};

function getLayerStyle(pathname: string): LayerStyle {
  if (pathname.startsWith('/inbox')) {
    return {
      bg: 'rgba(96,165,250,0.10)',
      text: 'var(--layer-capture, #60a5fa)',
      pill: 'var(--layer-capture, #60a5fa)',
    };
  }
  if (pathname.startsWith('/organize')) {
    return {
      bg: 'rgba(251,191,36,0.10)',
      text: 'var(--layer-process, #fbbf24)',
      pill: 'var(--layer-process, #fbbf24)',
    };
  }
  if (
    pathname.startsWith('/schedule') ||
    pathname.startsWith('/backlog') ||
    pathname.startsWith('/waiting-for')
  ) {
    return {
      bg: 'rgba(52,211,153,0.10)',
      text: 'var(--layer-commit, #34d399)',
      pill: 'var(--layer-commit, #34d399)',
    };
  }
  if (pathname.startsWith('/review')) {
    return {
      bg: 'rgba(194,65,12,0.10)',
      text: '#c2410c',
      pill: '#c2410c',
    };
  }
  if (pathname.startsWith('/archive')) {
    return {
      bg: 'rgba(120,113,108,0.10)',
      text: 'var(--text-secondary)',
      pill: 'var(--text-muted)',
    };
  }
  // Default: terracotta
  return {
    bg: 'rgba(194,65,12,0.10)',
    text: '#c2410c',
    pill: '#c2410c',
  };
}

// ---------------------------------------------------------------------------
// Warm gradient separator
// ---------------------------------------------------------------------------

function WarmSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn('mx-3 h-[1.5px] rounded-full', className)}
      style={{
        background:
          'linear-gradient(to right, transparent, rgba(194,65,12,0.14), rgba(161,98,7,0.08), transparent)',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-1 px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none">
      {title}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// NavItem — static navigation entry with Lucide icon
// ---------------------------------------------------------------------------

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  shortcut?: string;
  badge?: number;
  layerStyle: LayerStyle;
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  shortcut,
  badge,
  layerStyle,
}: NavItemProps) {
  const inner = (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
        isActive
          ? ''
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
        isCollapsed && 'justify-center px-0'
      )}
      style={
        isActive
          ? { background: layerStyle.bg, color: layerStyle.text }
          : undefined
      }
    >
      {/* Active pill indicator */}
      {isActive && !isCollapsed && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
          style={{ background: layerStyle.pill }}
          transition={spring}
        />
      )}

      <span className="relative flex-shrink-0">
        <Icon
          className={cn(
            'h-[18px] w-[18px] transition-colors duration-200',
            isActive ? '' : 'text-[var(--text-muted)]'
          )}
          style={isActive ? { color: layerStyle.text } : undefined}
        />
        {/* Badge — collapsed: absolute dot */}
        {isCollapsed && badge !== undefined && badge > 0 && (
          <span className="absolute -top-2 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c2410c] px-1 text-[9px] font-bold text-white shadow-[0_2px_6px_rgba(194,65,12,0.3)]">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>

      {/* Expanded content */}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="rounded-full bg-[rgba(234,88,12,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#c2410c] tabular-nums">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {shortcut && (
            <span className="text-[11px] text-[var(--text-disabled)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {shortcut}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <div className="relative overflow-visible">
        <Tooltip>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 rounded-xl">
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="rounded-full bg-[rgba(234,88,12,0.12)] px-1.5 py-0.5 text-[10px] font-medium text-[#c2410c]">
                {badge}
              </span>
            )}
            {shortcut && <span className="text-[var(--text-muted)]">{shortcut}</span>}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return inner;
}

// ---------------------------------------------------------------------------
// SpaceTreeItem — collapsible space with nested projects/pages
// ---------------------------------------------------------------------------

interface SpaceTreeItemProps {
  space: NonNullable<SidebarProps['spaces']>[number];
  pathname: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

function SpaceTreeItem({ space, pathname, isExpanded, onToggle }: SpaceTreeItemProps) {
  const SpaceIcon = ICON_MAP[space.icon] || ICON_MAP['folder'];
  const colorOption = space.color
    ? COLOR_PALETTE.find((c) => c.value === space.color)
    : null;
  const isSpaceActive = pathname === `/spaces/${space.id}`;

  return (
    <div>
      {/* Space row */}
      <div className="flex items-center group">
        {/* Chevron toggle */}
        <button
          type="button"
          onClick={() => onToggle(space.id)}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
          aria-label={isExpanded ? `Collapse ${space.name}` : `Expand ${space.name}`}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={springFast}
            className="flex items-center justify-center"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </button>

        {/* Space link */}
        <Link
          href={`/spaces/${space.id}`}
          className={cn(
            'flex flex-1 items-center gap-2.5 rounded-xl px-2 py-1.5 text-[13px] transition-all duration-200',
            isSpaceActive
              ? 'bg-[rgba(194,65,12,0.08)] text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          )}
        >
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-lg transition-colors duration-200',
              colorOption?.bgSubtle || 'bg-[rgba(194,65,12,0.06)]'
            )}
          >
            <SpaceIcon
              className={cn(
                'h-3 w-3',
                colorOption?.text || 'text-[var(--text-muted)]'
              )}
            />
          </div>
          <span className="flex-1 truncate">{space.name}</span>
        </Link>
      </div>

      {/* Nested projects */}
      <AnimatePresence initial={false}>
        {isExpanded && space.projects && space.projects.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <div className="pl-6 space-y-0.5 mt-0.5">
              {space.projects.map((project) => (
                <ProjectTreeItem
                  key={project.id}
                  project={project}
                  pathname={pathname}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectTreeItem — project with nested pages
// ---------------------------------------------------------------------------

interface ProjectTreeItemProps {
  project: NonNullable<
    NonNullable<SidebarProps['spaces']>[number]['projects']
  >[number];
  pathname: string;
}

function ProjectTreeItem({ project, pathname }: ProjectTreeItemProps) {
  const ProjectIcon = ICON_MAP[project.icon] || ICON_MAP['briefcase'];
  const colorOption = project.color
    ? COLOR_PALETTE.find((c) => c.value === project.color)
    : null;
  const isProjectActive = pathname === `/projects/${project.id}`;

  return (
    <div>
      <Link
        href={`/projects/${project.id}`}
        className={cn(
          'flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-[13px] transition-all duration-200',
          isProjectActive
            ? 'bg-[rgba(194,65,12,0.08)] text-[var(--text-primary)] font-medium'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
        )}
      >
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-lg transition-colors duration-200',
            colorOption?.bgSubtle || 'bg-[rgba(194,65,12,0.06)]'
          )}
        >
          <ProjectIcon
            className={cn(
              'h-3 w-3',
              colorOption?.text || 'text-[var(--text-muted)]'
            )}
          />
        </div>
        <span className="flex-1 truncate">{project.name}</span>
      </Link>

      {/* Nested pages */}
      {project.pages && project.pages.length > 0 && (
        <div className="pl-4 space-y-0.5 mt-0.5">
          {project.pages.map((page) => (
            <PageTreeItem key={page.id} page={page} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PageTreeItem — leaf page link
// ---------------------------------------------------------------------------

interface PageTreeItemProps {
  page: NonNullable<
    NonNullable<
      NonNullable<SidebarProps['spaces']>[number]['projects']
    >[number]['pages']
  >[number];
  pathname: string;
}

function PageTreeItem({ page, pathname }: PageTreeItemProps) {
  const PageIcon = ICON_MAP[page.icon] || FileText;
  const isPageActive = pathname === `/pages/${page.id}`;

  return (
    <Link
      href={`/pages/${page.id}`}
      className={cn(
        'flex items-center gap-2 rounded-xl px-2 py-1 text-[12px] transition-all duration-200',
        isPageActive
          ? 'bg-[rgba(194,65,12,0.06)] text-[var(--text-primary)] font-medium'
          : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
      )}
    >
      <PageIcon className="h-3 w-3 flex-shrink-0" />
      <span className="flex-1 truncate">{page.title}</span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Sidebar (main export)
// ---------------------------------------------------------------------------

export function Sidebar({ inboxCount: _inboxCountProp = 0, spaces = [] }: SidebarProps) {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    toggleSidebar,
    sidebarExpandedNodes,
    toggleSidebarNode,
  } = useUIStore();

  // Reactive inbox count from Zustand store (updated by RealtimeProvider)
  const reactiveInboxCount = useInboxCount();
  const inboxCount = reactiveInboxCount > 0 ? reactiveInboxCount : _inboxCountProp;

  // ---- Keyboard shortcuts ------------------------------------------------

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }
    },
    [toggleSidebar]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ---- Determine current layer style for active item ---------------------

  const currentLayerStyle = getLayerStyle(pathname);

  // ---- Helpers -----------------------------------------------------------

  const isRouteActive = (href: string) => {
    if (href === '/today') return pathname === '/today' || pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // ---- Render ------------------------------------------------------------

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 68 : 260 }}
        transition={spring}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col rounded-r-2xl"
        style={{
          background: 'var(--bg-inset)',
          boxShadow: '4px 0 20px rgba(80,50,20,0.08)',
        }}
      >
        {/* ---- Logo header ------------------------------------------------ */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
          <Link href="/today" className="flex items-center gap-3 overflow-hidden">
            <OffMindLogo size={28} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={spring}
                  className="text-[15px] font-semibold tracking-tight text-sidebar-foreground overflow-hidden whitespace-nowrap"
                >
                  OffMind
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springFast}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-xl text-[var(--text-muted)] hover:text-sidebar-foreground hover:bg-[var(--bg-hover)] transition-all duration-200"
                  onClick={toggleSidebar}
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- Header separator ------------------------------------------- */}
        <WarmSeparator />

        {/* ---- Scrollable body -------------------------------------------- */}
        <ScrollArea className="flex-1 overflow-visible px-2">
          {/* -- Primary navigation ----------------------------------------- */}
          <nav className="space-y-0.5 py-3" aria-label="Primary navigation">
            {primaryNav.map((item) => {
              const active = isRouteActive(item.href);
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={active}
                  isCollapsed={sidebarCollapsed}
                  shortcut={item.shortcut}
                  badge={item.href === '/inbox' && inboxCount > 0 ? inboxCount : undefined}
                  layerStyle={active ? getLayerStyle(item.href) : currentLayerStyle}
                />
              );
            })}
          </nav>

          <WarmSeparator className="my-1" />

          {/* -- Destinations section ---------------------------------------- */}
          {!sidebarCollapsed && <SectionHeader title="Destinations" />}

          <nav className="space-y-0.5 py-1" aria-label="Destination navigation">
            {destinationNav.map((item) => {
              const active = isRouteActive(item.href);
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={active}
                  isCollapsed={sidebarCollapsed}
                  shortcut={item.shortcut}
                  layerStyle={active ? getLayerStyle(item.href) : currentLayerStyle}
                />
              );
            })}
          </nav>

          <WarmSeparator className="my-1" />

          {/* -- Tools section ------------------------------------------------ */}
          {!sidebarCollapsed && <SectionHeader title="Tools" />}

          <nav className="space-y-0.5 py-1" aria-label="Tools navigation">
            {toolsNav.map((item) => {
              const active = isRouteActive(item.href);
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={active}
                  isCollapsed={sidebarCollapsed}
                  shortcut={item.shortcut}
                  layerStyle={active ? getLayerStyle(item.href) : currentLayerStyle}
                />
              );
            })}
          </nav>

          {/* -- Spaces section ---------------------------------------------- */}
          {!sidebarCollapsed ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <WarmSeparator className="my-1" />

                <SectionHeader title="Spaces" />

                <div className="space-y-0.5 pb-2">
                  {spaces.map((space) => (
                    <SpaceTreeItem
                      key={space.id}
                      space={space}
                      pathname={pathname}
                      isExpanded={sidebarExpandedNodes.includes(space.id)}
                      onToggle={toggleSidebarNode}
                    />
                  ))}

                  {/* Add space button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-[12px] text-[var(--text-disabled)] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.06)] h-8 rounded-xl transition-all duration-200"
                    asChild
                  >
                    <Link href="/spaces">
                      <Plus className="h-3.5 w-3.5" />
                      Add Space
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : spaces.length > 0 ? (
            <div className="py-1">
              <div className="mx-3 my-1 h-px bg-[var(--border-subtle)]" />
              <Popover>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button
                          className="flex w-full items-center justify-center rounded-xl py-2.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-200"
                        >
                          <Folder className="h-[18px] w-[18px]" />
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right">Spaces</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="w-64 p-2 rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-float)]"
                >
                  <div className="space-y-0.5">
                    <h3 className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Spaces
                    </h3>
                    {spaces.map((space) => (
                      <SpaceTreeItem
                        key={space.id}
                        space={space}
                        pathname={pathname}
                        isExpanded={sidebarExpandedNodes.includes(space.id)}
                        onToggle={toggleSidebarNode}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : null}
        </ScrollArea>

        {/* ---- Bottom section --------------------------------------------- */}
        <div className="flex-shrink-0 p-3">
          <WarmSeparator className="mb-3" />

          {/* Expand button (collapsed only) */}
          {sidebarCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-9 mb-1.5 rounded-xl text-[var(--text-muted)] hover:text-sidebar-foreground hover:bg-[var(--bg-hover)] border border-transparent hover:border-[rgba(194,65,12,0.12)] transition-all duration-200"
                  onClick={toggleSidebar}
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Expand sidebar <span className="text-[var(--text-muted)]">\u2318 \</span>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Settings link */}
          <NavItem
            href="/settings"
            label="Settings"
            icon={Settings}
            isActive={isRouteActive('/settings')}
            isCollapsed={sidebarCollapsed}
            layerStyle={
              isRouteActive('/settings')
                ? getLayerStyle('/settings')
                : currentLayerStyle
            }
          />
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
