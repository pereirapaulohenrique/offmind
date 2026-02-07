'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  Inbox,
  ArrowRight,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  FolderKanban,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { OffMindLogo } from '@/components/brand/OffMindLogo';

// Navigation items with Lucide icons
const mainNav: { href: string; label: string; icon: LucideIcon; shortcut: string }[] = [
  { href: '/home', label: 'Home', icon: Home, shortcut: '⌘0' },
  { href: '/inbox', label: 'Inbox', icon: Inbox, shortcut: '⌘1' },
  { href: '/review', label: 'Review', icon: ArrowRight, shortcut: '⌘2' },
  { href: '/commit', label: 'Commit', icon: Calendar, shortcut: '⌘3' },
];

const secondaryNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/spaces', label: 'Spaces', icon: LayoutGrid },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/pages', label: 'Pages', icon: FileText },
];

const bottomNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  inboxCount?: number;
  spaces?: { id: string; name: string; icon: string; color: string }[];
  projects?: { id: string; name: string; icon: string; color: string; space_id?: string }[];
  pages?: { id: string; title: string; icon: string }[];
}

export function Sidebar({ inboxCount = 0, spaces = [], projects = [], pages = [] }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  // Handle keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 68 : 252 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col backdrop-blur-xl",
          sidebarCollapsed && "rounded-r-2xl"
        )}
        style={{
          background: sidebarCollapsed
            ? 'linear-gradient(180deg, rgba(var(--bg-inset-rgb), 0.85) 0%, rgba(var(--sidebar-rgb), 0.9) 100%)'
            : 'linear-gradient(180deg, rgba(var(--bg-inset-rgb), 0.9) 0%, rgba(var(--sidebar-rgb), 0.95) 100%)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="animate-breathe">
              <OffMindLogo size={28} />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--text-muted)] hover:text-sidebar-foreground transition-colors duration-200"
                  onClick={toggleSidebar}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gradient separator below logo */}
        <div className="mx-3 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border-subtle), transparent)' }} />

        <ScrollArea className="flex-1 overflow-visible px-2">
          {/* Main Navigation */}
          <nav className="space-y-0.5 overflow-visible py-2">
            {mainNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
                isCollapsed={sidebarCollapsed}
                shortcut={item.shortcut}
                badge={item.href === '/inbox' && inboxCount > 0 ? inboxCount : undefined}
              />
            ))}
          </nav>

          <div className="my-2 mx-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border-subtle), transparent)' }} />

          {/* When collapsed: show Spaces/Projects/Pages as icons */}
          {sidebarCollapsed && (
            <nav className="space-y-0.5 py-2">
              {secondaryNav.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname.startsWith(item.href)}
                  isCollapsed={true}
                />
              ))}
            </nav>
          )}

          {/* When expanded: show full Spaces/Projects/Pages sections */}
          {!sidebarCollapsed && (
            <>
              {/* Spaces Section */}
              <div className="py-2">
                <SectionHeader title="Spaces" href="/spaces" />
                <div className="mt-1 space-y-0.5">
                  {spaces.map((space) => (
                    <DynamicNavItem
                      key={space.id}
                      href={`/spaces/${space.id}`}
                      label={space.name}
                      iconName={space.icon}
                      color={space.color}
                      isActive={pathname === `/spaces/${space.id}`}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-[var(--text-disabled)] hover:text-[var(--accent-base)] h-8 transition-colors duration-200"
                    asChild
                  >
                    <Link href="/spaces">
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Space
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Projects Section */}
              <div className="py-2">
                <SectionHeader title="Projects" href="/projects" />
                <div className="mt-1 space-y-0.5">
                  {projects.map((project) => (
                    <DynamicNavItem
                      key={project.id}
                      href={`/projects/${project.id}`}
                      label={project.name}
                      iconName={project.icon}
                      color={project.color}
                      isActive={pathname === `/projects/${project.id}`}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-[var(--text-disabled)] hover:text-[var(--accent-base)] h-8 transition-colors duration-200"
                    asChild
                  >
                    <Link href="/projects">
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Project
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Pages Section */}
              <div className="py-2">
                <SectionHeader title="Pages" href="/pages" />
                <div className="mt-1 space-y-0.5">
                  {pages.slice(0, 5).map((page) => (
                    <DynamicNavItem
                      key={page.id}
                      href={`/pages/${page.id}`}
                      label={page.title}
                      iconName={page.icon || 'file-text'}
                      isActive={pathname === `/pages/${page.id}`}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-[var(--text-disabled)] hover:text-[var(--accent-base)] h-8 transition-colors duration-200"
                    asChild
                  >
                    <Link href="/pages">
                      <Plus className="h-3.5 w-3.5 mr-2" /> New Page
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="p-2" style={{ borderTop: '1px solid', borderImage: 'linear-gradient(to right, transparent, var(--border-subtle), transparent) 1' }}>
          {/* Expand/collapse toggle */}
          {sidebarCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-9 mb-1 text-[var(--text-disabled)] hover:text-sidebar-foreground transition-all duration-200 rounded-full hover:bg-[var(--bg-hover)]"
                  onClick={toggleSidebar}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          )}
          {bottomNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

// Section header component with link
function SectionHeader({ title, href }: { title: string; href?: string }) {
  const content = (
    <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase text-[var(--text-muted)]" style={{ letterSpacing: 'var(--tracking-widest)' }}>
      {title}
    </h3>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:text-[var(--text-primary)] transition-colors duration-200">
        {content}
      </Link>
    );
  }

  return content;
}

// Navigation item with Lucide icon component
interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  shortcut?: string;
  badge?: number;
}

function NavItem({ href, label, icon: Icon, isActive, isCollapsed, shortcut, badge }: NavItemProps) {
  // Layer-specific active styles using CSS variables — glow effect + accent dot
  const getLayerStyles = () => {
    if (!isActive) return { glow: '', text: '', dot: '' };

    switch (href) {
      case '/inbox':
        return {
          glow: 'shadow-[0_0_20px_rgba(96,165,250,0.15)]',
          text: 'text-[var(--layer-capture)]',
          dot: 'bg-[var(--layer-capture)]',
        };
      case '/review':
        return {
          glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]',
          text: 'text-[var(--layer-process)]',
          dot: 'bg-[var(--layer-process)]',
        };
      case '/commit':
        return {
          glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
          text: 'text-[var(--layer-commit)]',
          dot: 'bg-[var(--layer-commit)]',
        };
      default:
        return {
          glow: 'shadow-[0_0_20px_rgba(45,212,191,0.15)]',
          text: 'text-[var(--accent-base)]',
          dot: 'bg-[var(--accent-base)]',
        };
    }
  };

  const layerStyles = getLayerStyles();

  const content = (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] flow-transition-fast',
        isActive
          ? `bg-[var(--bg-hover)]/50 font-medium ${layerStyles.text} ${layerStyles.glow}`
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/30 hover:text-[var(--text-primary)] hover:translate-x-0.5',
        isCollapsed && 'justify-center px-2'
      )}
    >
      {/* Active accent dot with pulse */}
      {isActive && !isCollapsed && (
        <span
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full animate-pulse-subtle',
            layerStyles.dot
          )}
        />
      )}
      <Icon className={cn('h-[18px] w-[18px] flex-shrink-0', isActive && layerStyles.text)} />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="animate-pulse-subtle rounded-full bg-[var(--layer-capture-bg)] border border-[var(--layer-capture-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--layer-capture)] tabular-nums">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {shortcut && (
            <span className="text-[11px] text-[var(--text-disabled)]">{shortcut}</span>
          )}
        </>
      )}
      {/* Badge visible even when collapsed */}
      {isCollapsed && badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--layer-capture)] text-[9px] font-bold text-[var(--bg-base)] px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <div className="relative overflow-visible">
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="rounded-full bg-[var(--layer-capture)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--bg-base)]">
                {badge}
              </span>
            )}
            {shortcut && <span className="text-[var(--text-muted)]">{shortcut}</span>}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return content;
}

// Dynamic navigation item for user-created items (spaces, projects, pages)
interface DynamicNavItemProps {
  href: string;
  label: string;
  iconName: string;
  color?: string;
  isActive: boolean;
}

function DynamicNavItem({ href, label, iconName, color, isActive }: DynamicNavItemProps) {
  const Icon = ICON_MAP[iconName] || ICON_MAP['folder'];
  const colorOption = color ? COLOR_PALETTE.find(c => c.value === color) : null;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm flow-transition-fast',
        isActive
          ? 'bg-[var(--bg-hover)]/50 text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/30 hover:text-[var(--text-primary)] hover:translate-x-0.5'
      )}
    >
      <div className={cn(
        'flex h-5 w-5 items-center justify-center rounded',
        colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
      )}>
        <Icon className={cn('h-3 w-3', colorOption?.text || 'text-[var(--text-muted)]')} />
      </div>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}
