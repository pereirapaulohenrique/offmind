'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCaptureTargetStore } from '@/stores/capture-target';

interface ContextData {
  spaces: Array<{ id: string; name: string; icon: string; color: string }>;
  projects: Array<{ id: string; name: string; icon: string; color: string }>;
  pages: Array<{ id: string; title: string; icon: string }>;
}

export function useCaptureContext(data: ContextData) {
  const pathname = usePathname();
  const { captureTarget, setCaptureTarget } = useCaptureTargetStore();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Only auto-set when the path actually changes
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    // Don't override a manually-set target
    if (captureTarget) return;

    const projectMatch = pathname.match(/^\/projects\/([a-f0-9-]+)/);
    if (projectMatch) {
      const project = data.projects.find((p) => p.id === projectMatch[1]);
      if (project) {
        setCaptureTarget({
          type: 'project',
          id: project.id,
          name: project.name,
          icon: project.icon,
          color: project.color,
        });
        return;
      }
    }

    const spaceMatch = pathname.match(/^\/spaces\/([a-f0-9-]+)/);
    if (spaceMatch) {
      const space = data.spaces.find((s) => s.id === spaceMatch[1]);
      if (space) {
        setCaptureTarget({
          type: 'space',
          id: space.id,
          name: space.name,
          icon: space.icon,
          color: space.color,
        });
        return;
      }
    }

    const pageMatch = pathname.match(/^\/pages\/([a-f0-9-]+)/);
    if (pageMatch) {
      const page = data.pages.find((p) => p.id === pageMatch[1]);
      if (page) {
        setCaptureTarget({
          type: 'page',
          id: page.id,
          name: page.title,
          icon: page.icon,
        });
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}
