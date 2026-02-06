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
  type LucideIcon,
} from 'lucide-react';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { OffMindLogo } from '@/components/brand/OffMindLogo';

// Navigation items with Lucide icons
const mainNav: { href: string; label: string; icon: LucideIcon; shortcut: string }[] = [
  { href: '/home', label: 'Home', icon: Home, shortcut: '⌘0' },
  { href: '/capture', label: 'Capture', icon: Inbox, shortcut: '⌘1' },
  { href: '/process', label: 'Process', icon: ArrowRight, shortcut: '⌘2' },
  { href: '/commit', label: 'Commit', icon: Calendar, shortcut: '⌘3' },
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
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/60 bg-sidebar"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2.5">
            <OffMindLogo size={32} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[15px] font-semibold tracking-tight text-sidebar-foreground overflow-hidden whitespace-nowrap"
                >
                  OffMind
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground"
              onClick={toggleSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 px-2.5">
          {/* Main Navigation */}
          <nav className="space-y-0.5 py-2">
            {mainNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
                isCollapsed={sidebarCollapsed}
                shortcut={item.shortcut}
                badge={item.href === '/capture' && inboxCount > 0 ? inboxCount : undefined}
              />
            ))}
          </nav>

          <Separator className="my-3 opacity-50" />

          {/* Spaces Section */}
          {!sidebarCollapsed && (
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
                  className="w-full justify-start text-sm text-muted-foreground/70 hover:text-foreground h-8"
                  asChild
                >
                  <Link href="/spaces">
                    <Plus className="h-3.5 w-3.5 mr-2" /> Add Space
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Projects Section */}
          {!sidebarCollapsed && (
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
                  className="w-full justify-start text-sm text-muted-foreground/70 hover:text-foreground h-8"
                  asChild
                >
                  <Link href="/projects">
                    <Plus className="h-3.5 w-3.5 mr-2" /> Add Project
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Pages Section */}
          {!sidebarCollapsed && (
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
                  className="w-full justify-start text-sm text-muted-foreground/70 hover:text-foreground h-8"
                  asChild
                >
                  <Link href="/pages">
                    <Plus className="h-3.5 w-3.5 mr-2" /> New Page
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="border-t border-border/50 p-2.5">
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

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <div className="border-t border-border/50 p-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-9"
              onClick={toggleSidebar}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  );
}

// Section header component with link
function SectionHeader({ title, href }: { title: string; href?: string }) {
  const content = (
    <h3 className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
      {title}
    </h3>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:text-foreground transition-colors">
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
  // Layer-specific active styles
  const layerAccent = isActive
    ? href === '/capture'
      ? 'border-l-blue-400 bg-blue-500/[0.06]'
      : href === '/process'
        ? 'border-l-amber-400 bg-amber-500/[0.06]'
        : href === '/commit'
          ? 'border-l-emerald-400 bg-emerald-500/[0.06]'
          : 'border-l-primary bg-primary/[0.06]'
    : 'border-l-transparent';

  const layerIconColor = isActive
    ? href === '/capture'
      ? 'text-blue-400'
      : href === '/process'
        ? 'text-amber-400'
        : href === '/commit'
          ? 'text-emerald-400'
          : 'text-primary'
    : '';

  const content = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-all duration-150',
        isActive
          ? `${layerAccent} font-medium text-sidebar-accent-foreground`
          : `border-l-transparent text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground`,
        isCollapsed && 'justify-center border-l-0 px-2'
      )}
    >
      <Icon className={cn('h-4 w-4 flex-shrink-0', layerIconColor)} />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="animate-pulse-subtle rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-400 tabular-nums">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {shortcut && (
            <span className="text-[11px] text-muted-foreground/50">{shortcut}</span>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <span>{label}</span>
          {shortcut && <span className="ml-2 text-muted-foreground">{shortcut}</span>}
        </TooltipContent>
      </Tooltip>
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
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      )}
    >
      <div className={cn(
        'flex h-5 w-5 items-center justify-center rounded',
        colorOption?.bgSubtle || 'bg-muted'
      )}>
        <Icon className={cn('h-3 w-3', colorOption?.text || 'text-muted-foreground')} />
      </div>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}
