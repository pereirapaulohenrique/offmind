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

// Navigation items
const mainNav = [
  { href: '/capture', label: 'Capture', icon: '📥', shortcut: '⌘1' },
  { href: '/process', label: 'Process', icon: '🔄', shortcut: '⌘2' },
  { href: '/commit', label: 'Commit', icon: '📅', shortcut: '⌘3' },
];

const bottomNav = [
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

interface SidebarProps {
  inboxCount?: number;
  spaces?: { id: string; name: string; icon: string; color: string }[];
  projects?: { id: string; name: string; icon: string; color: string }[];
  pages?: { id: string; title: string; icon: string }[];
}

export function Sidebar({ inboxCount = 0, spaces = [], projects = [], pages = [] }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();

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
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-3">
          <Link href="/capture" className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-semibold text-sidebar-foreground overflow-hidden whitespace-nowrap"
                >
                  MindBase
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground"
              onClick={toggleSidebar}
            >
              <span className="text-sm">◀</span>
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 px-2">
          {/* Main Navigation */}
          <nav className="space-y-1 py-2">
            {mainNav.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                isCollapsed={sidebarCollapsed}
                badge={item.href === '/capture' && inboxCount > 0 ? inboxCount : undefined}
              />
            ))}
          </nav>

          <Separator className="my-2" />

          {/* Spaces Section */}
          {!sidebarCollapsed && (
            <div className="py-2">
              <SectionHeader title="Spaces" />
              <div className="space-y-1">
                {spaces.map((space) => (
                  <NavItem
                    key={space.id}
                    href={`/process?space=${space.id}`}
                    label={space.name}
                    icon={space.icon}
                    isActive={false}
                    isCollapsed={false}
                  />
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="/spaces">
                    <span className="mr-2">+</span> Add Space
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Projects Section */}
          {!sidebarCollapsed && (
            <div className="py-2">
              <SectionHeader title="Projects" />
              <div className="space-y-1">
                {projects.map((project) => (
                  <NavItem
                    key={project.id}
                    href={`/process?project=${project.id}`}
                    label={project.name}
                    icon={project.icon}
                    isActive={false}
                    isCollapsed={false}
                  />
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="/projects">
                    <span className="mr-2">+</span> Add Project
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Pages Section */}
          {!sidebarCollapsed && (
            <div className="py-2">
              <SectionHeader title="Pages" />
              <div className="space-y-1">
                {pages.slice(0, 5).map((page) => (
                  <NavItem
                    key={page.id}
                    href={`/pages/${page.id}`}
                    label={page.title}
                    icon={page.icon}
                    isActive={pathname === `/pages/${page.id}`}
                    isCollapsed={false}
                  />
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="/pages">
                    <span className="mr-2">+</span> New Page
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="border-t border-border p-2">
          {bottomNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname.startsWith(item.href)}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10"
              onClick={toggleSidebar}
            >
              <span className="text-sm">▶</span>
            </Button>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  );
}

// Section header component
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {title}
    </h3>
  );
}

// Navigation item component
interface NavItemProps {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
  isCollapsed: boolean;
  shortcut?: string;
  badge?: number;
}

function NavItem({ href, label, icon, isActive, isCollapsed, shortcut, badge }: NavItemProps) {
  const content = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <span className="text-base">{icon}</span>
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {shortcut && (
            <span className="text-xs text-muted-foreground">{shortcut}</span>
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
