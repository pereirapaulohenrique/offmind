'use client';

import { useEffect } from 'react';
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
  { href: '/home', label: 'Home', icon: Home, shortcut: '\u2318 0' },
  { href: '/inbox', label: 'Inbox', icon: Inbox, shortcut: '\u2318 1' },
  { href: '/review', label: 'Review', icon: ArrowRight, shortcut: '\u2318 2' },
  { href: '/commit', label: 'Commit', icon: Calendar, shortcut: '\u2318 3' },
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
        transition={{ type: "spring", stiffness: 600, damping: 40 }}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden"
        style={{
          background: 'var(--bg-inset)',
          borderRight: '1px solid rgba(0,212,255,0.08)',
        }}
      >
        {/* HUD corner accents */}
        <div className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: 'rgba(0,212,255,0.2)' }} />
        <div className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: 'rgba(0,212,255,0.2)' }} />
        <div className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: 'rgba(0,212,255,0.2)' }} />
        <div className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: 'rgba(0,212,255,0.2)' }} />

        {/* Scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-50"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2.5">
            <OffMindLogo size={28} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-baseline gap-1.5 overflow-hidden whitespace-nowrap"
                >
                  <span className="text-[14px] font-semibold tracking-tight text-sidebar-foreground">
                    OffMind
                  </span>
                  <span
                    className="font-mono text-[9px] leading-none"
                    style={{ color: 'rgba(0,212,255,0.35)' }}
                  >
                    v2.1
                  </span>
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
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--text-muted)] hover:text-sidebar-foreground"
                  onClick={toggleSidebar}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thin luminous separator below logo */}
        <div className="mx-3 h-px" style={{ background: 'rgba(0,212,255,0.1)' }} />

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

          {/* Luminous separator */}
          <div className="mx-2 my-2 h-px" style={{ background: 'rgba(0,212,255,0.08)' }} />

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
                    className="w-full justify-start font-mono text-[11px] text-[var(--text-disabled)] hover:text-[rgba(0,212,255,0.7)] h-7"
                    asChild
                  >
                    <Link href="/spaces">
                      <Plus className="h-3 w-3 mr-2" /> Add Space
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
                    className="w-full justify-start font-mono text-[11px] text-[var(--text-disabled)] hover:text-[rgba(0,212,255,0.7)] h-7"
                    asChild
                  >
                    <Link href="/projects">
                      <Plus className="h-3 w-3 mr-2" /> Add Project
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
                    className="w-full justify-start font-mono text-[11px] text-[var(--text-disabled)] hover:text-[rgba(0,212,255,0.7)] h-7"
                    asChild
                  >
                    <Link href="/pages">
                      <Plus className="h-3 w-3 mr-2" /> New Page
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </ScrollArea>

        {/* Bottom Navigation */}
        <div
          className="p-2"
          style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}
        >
          {/* Expand/collapse toggle */}
          {sidebarCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-8 mb-1 text-[var(--text-muted)] hover:text-[rgba(0,212,255,0.8)]"
                  style={{
                    border: '1px solid rgba(0,212,255,0.12)',
                    borderRadius: '4px',
                  }}
                  onClick={toggleSidebar}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
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
              shortcut={item.href === '/settings' ? '\u2318 ,' : undefined}
            />
          ))}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

// Section header component with link — Neural: monospace, uppercase, cyan dot
function SectionHeader({ title, href }: { title: string; href?: string }) {
  const content = (
    <h3
      className="mb-1 flex items-center gap-1.5 px-3 font-mono text-[10px] uppercase"
      style={{
        letterSpacing: '0.15em',
        color: 'rgba(0,212,255,0.4)',
      }}
    >
      <span
        className="inline-block h-1 w-1 rounded-full flex-shrink-0"
        style={{ background: 'rgba(0,212,255,0.5)' }}
      />
      {title}
    </h3>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-colors hover:brightness-125">
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
  // Layer-specific active styles — Neural: left border bar + tinted bg
  const getLayerStyles = () => {
    if (!isActive) return { bg: '', text: '', borderColor: '' };

    switch (href) {
      case '/inbox':
        return {
          bg: 'bg-[rgba(0,212,255,0.06)]',
          text: 'text-[var(--layer-capture)]',
          borderColor: 'var(--layer-capture)',
        };
      case '/review':
        return {
          bg: 'bg-[rgba(0,212,255,0.06)]',
          text: 'text-[var(--layer-process)]',
          borderColor: 'var(--layer-process)',
        };
      case '/commit':
        return {
          bg: 'bg-[rgba(0,212,255,0.06)]',
          text: 'text-[var(--layer-commit)]',
          borderColor: 'var(--layer-commit)',
        };
      default:
        return {
          bg: 'bg-[rgba(0,212,255,0.06)]',
          text: 'text-[var(--accent-base)]',
          borderColor: 'var(--accent-base)',
        };
    }
  };

  const layerStyles = getLayerStyles();

  const content = (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 rounded px-3 py-1.5 text-[12px] transition-all duration-100',
        isActive
          ? `${layerStyles.bg} font-medium ${layerStyles.text}`
          : 'text-[var(--text-secondary)] hover:bg-[rgba(0,212,255,0.04)] hover:text-[var(--text-primary)]',
        isCollapsed && 'justify-center px-2'
      )}
      style={isActive ? {
        borderLeft: `2px solid ${layerStyles.borderColor}`,
        paddingLeft: '10px',
      } : {
        borderLeft: '2px solid transparent',
        paddingLeft: '10px',
      }}
    >
      {/* Hover left border hint (non-active) */}
      {!isActive && !isCollapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-100"
          style={{ background: 'rgba(0,212,255,0.3)' }}
        />
      )}
      <Icon className={cn('h-4 w-4 flex-shrink-0', isActive && layerStyles.text)} />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className="font-mono tabular-nums rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                color: 'rgba(0,212,255,0.9)',
                border: '1px solid rgba(0,212,255,0.2)',
                background: 'rgba(0,212,255,0.06)',
                boxShadow: '0 0 6px rgba(0,212,255,0.1)',
              }}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {shortcut && (
            <kbd
              className="font-mono text-[10px] leading-none px-1.5 py-0.5 rounded"
              style={{
                color: 'rgba(0,212,255,0.35)',
                border: '1px solid rgba(0,212,255,0.1)',
                background: 'rgba(0,212,255,0.03)',
              }}
            >
              {shortcut}
            </kbd>
          )}
        </>
      )}
      {/* Collapsed badge: tiny neon dot */}
      {isCollapsed && badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
          style={{
            background: '#00d4ff',
            boxShadow: '0 0 6px rgba(0,212,255,0.6)',
          }}
        />
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <div className="relative overflow-visible">
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 font-mono text-[11px]">
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-medium font-mono"
                style={{
                  color: '#00d4ff',
                  border: '1px solid rgba(0,212,255,0.3)',
                  background: 'rgba(0,212,255,0.1)',
                }}
              >
                {badge}
              </span>
            )}
            {shortcut && (
              <kbd
                className="font-mono text-[10px]"
                style={{ color: 'rgba(0,212,255,0.5)' }}
              >
                {shortcut}
              </kbd>
            )}
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
        'group flex items-center gap-2.5 rounded px-3 py-1.5 text-[12px] transition-all duration-100',
        isActive
          ? 'bg-[rgba(0,212,255,0.06)] text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[rgba(0,212,255,0.04)] hover:text-[var(--text-primary)]'
      )}
      style={isActive ? {
        borderLeft: '2px solid rgba(0,212,255,0.3)',
        paddingLeft: '10px',
      } : {
        borderLeft: '2px solid transparent',
        paddingLeft: '10px',
      }}
    >
      <div className={cn(
        'flex h-5 w-5 items-center justify-center',
        colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
      )}
      style={{ borderRadius: '4px' }}
      >
        <Icon className={cn('h-3 w-3', colorOption?.text || 'text-[var(--text-muted)]')} />
      </div>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}
