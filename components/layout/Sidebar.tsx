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
        animate={{ width: sidebarCollapsed ? 68 : 260 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col rounded-r-2xl"
        style={{
          background: 'var(--bg-inset)',
          boxShadow: '4px 0 16px rgba(80,50,20,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-3">
            <OffMindLogo size={30} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="text-[16px] font-semibold tracking-tight text-sidebar-foreground overflow-hidden whitespace-nowrap"
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
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl text-[var(--text-muted)] hover:text-sidebar-foreground hover:bg-[var(--bg-hover)] transition-all duration-200"
                  onClick={toggleSidebar}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Warm gradient separator below header */}
        <div
          className="mx-4 h-[2px] rounded-full"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(194,65,12,0.15), rgba(161,98,7,0.1), transparent)',
          }}
        />

        <ScrollArea className="flex-1 overflow-visible px-3">
          {/* Main Navigation */}
          <nav className="space-y-1 overflow-visible py-3">
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

          {/* Warm separator */}
          <div
            className="mx-2 h-[1.5px] rounded-full my-1"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(194,65,12,0.1), rgba(161,98,7,0.08), transparent)',
            }}
          />

          {/* When collapsed: show Spaces/Projects/Pages as icons */}
          {sidebarCollapsed && (
            <nav className="space-y-1 py-3">
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
              <div className="py-3">
                <SectionHeader title="Spaces" href="/spaces" />
                <div className="mt-1.5 space-y-0.5">
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
                    className="w-full justify-start text-sm text-[var(--text-disabled)] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.06)] h-9 rounded-xl transition-all duration-200"
                    asChild
                  >
                    <Link href="/spaces">
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Space
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Projects Section */}
              <div className="py-3">
                <SectionHeader title="Projects" href="/projects" />
                <div className="mt-1.5 space-y-0.5">
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
                    className="w-full justify-start text-sm text-[var(--text-disabled)] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.06)] h-9 rounded-xl transition-all duration-200"
                    asChild
                  >
                    <Link href="/projects">
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Project
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Pages Section */}
              <div className="py-3">
                <SectionHeader title="Pages" href="/pages" />
                <div className="mt-1.5 space-y-0.5">
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
                    className="w-full justify-start text-sm text-[var(--text-disabled)] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.06)] h-9 rounded-xl transition-all duration-200"
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
        <div className="p-3">
          {/* Warm gradient separator */}
          <div
            className="mx-1 mb-3 h-[1.5px] rounded-full"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(194,65,12,0.12), rgba(161,98,7,0.08), transparent)',
            }}
          />

          {/* Expand/collapse toggle */}
          {sidebarCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-10 mb-1.5 rounded-xl text-[var(--text-muted)] hover:text-sidebar-foreground hover:bg-[var(--bg-hover)] border border-transparent hover:border-[rgba(194,65,12,0.12)] transition-all duration-200"
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

// Section header component with link — Bloom: friendly normal case, no decorators
function SectionHeader({ title, href }: { title: string; href?: string }) {
  const content = (
    <h3 className="mb-1 px-3 text-[12px] font-medium text-[var(--text-muted)] tracking-wide">
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
  // Layer-specific active styles — Bloom: warm-tinted backgrounds + terracotta pill
  const getLayerStyles = () => {
    if (!isActive) return { bg: '', text: '', pill: '', activeBg: '' };

    switch (href) {
      case '/inbox':
        return {
          bg: 'bg-[rgba(96,165,250,0.08)]',
          text: 'text-[var(--layer-capture)]',
          pill: 'bg-[var(--layer-capture)]',
          activeBg: 'rgba(96,165,250,0.08)',
        };
      case '/review':
        return {
          bg: 'bg-[rgba(251,191,36,0.08)]',
          text: 'text-[var(--layer-process)]',
          pill: 'bg-[var(--layer-process)]',
          activeBg: 'rgba(251,191,36,0.08)',
        };
      case '/commit':
        return {
          bg: 'bg-[rgba(52,211,153,0.08)]',
          text: 'text-[var(--layer-commit)]',
          pill: 'bg-[var(--layer-commit)]',
          activeBg: 'rgba(52,211,153,0.08)',
        };
      default:
        return {
          bg: 'bg-[rgba(194,65,12,0.08)]',
          text: 'text-[#c2410c]',
          pill: 'bg-[#c2410c]',
          activeBg: 'rgba(194,65,12,0.08)',
        };
    }
  };

  const layerStyles = getLayerStyles();

  const content = (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200',
        isActive
          ? `${layerStyles.bg} font-medium ${layerStyles.text}`
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:scale-[1.01]',
        isCollapsed && 'justify-center px-2'
      )}
    >
      {/* Active pill indicator — rounded, layer-colored */}
      {isActive && !isCollapsed && (
        <motion.span
          layoutId="sidebar-active-pill"
          className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full', layerStyles.pill)}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      )}
      <Icon className={cn('h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200', isActive && layerStyles.text)} />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="rounded-full bg-[rgba(234,88,12,0.12)] px-2.5 py-1 text-[11px] font-medium text-[#c2410c] tabular-nums">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {shortcut && (
            <span className="text-[11px] text-[var(--text-disabled)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">{shortcut}</span>
          )}
        </>
      )}
      {/* Badge visible even when collapsed */}
      {isCollapsed && badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c2410c] text-[9px] font-bold text-white px-1 shadow-[0_2px_6px_rgba(194,65,12,0.3)]">
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
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200',
        isActive
          ? 'bg-[rgba(194,65,12,0.08)] text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:scale-[1.01]'
      )}
    >
      <div className={cn(
        'flex h-6 w-6 items-center justify-center rounded-xl transition-colors duration-200',
        colorOption?.bgSubtle || 'bg-[rgba(194,65,12,0.06)]'
      )}>
        <Icon className={cn('h-3.5 w-3.5', colorOption?.text || 'text-[var(--text-muted)]')} />
      </div>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}
