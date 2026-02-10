'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Item, Page } from '@/types/database';

// ---------------------------------------------------------------------------
// Destination-aware page templates
// ---------------------------------------------------------------------------

function getDestinationTemplate(destinationSlug: string, title: string, notes: string | null): any {
  const baseDoc = (content: any[]) => ({
    type: 'doc',
    content,
  });

  const heading = (text: string, level: number = 1) => ({
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text }],
  });

  const paragraph = (text?: string) => text
    ? { type: 'paragraph', content: [{ type: 'text', text }] }
    : { type: 'paragraph' };

  const bulletList = (items: string[]) => ({
    type: 'bulletList',
    content: items.map(item => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
    })),
  });

  switch (destinationSlug) {
    case 'commit':
      return baseDoc([
        heading(`Meeting Notes: ${title}`),
        paragraph(notes || undefined),
        heading('Attendees', 2),
        bulletList(['Add attendees...']),
        heading('Agenda', 2),
        bulletList(['Topic 1', 'Topic 2']),
        heading('Notes', 2),
        paragraph(),
        heading('Action Items', 2),
        bulletList(['Action 1']),
        heading('Decisions', 2),
        paragraph(),
      ]);

    case 'backlog':
      return baseDoc([
        heading(`Task Brief: ${title}`),
        paragraph(notes || undefined),
        heading('Objective', 2),
        paragraph('What needs to be accomplished?'),
        heading('Context', 2),
        paragraph('Why is this important?'),
        heading('Requirements', 2),
        bulletList(['Requirement 1', 'Requirement 2']),
        heading('Acceptance Criteria', 2),
        bulletList(['Criteria 1']),
        heading('Notes', 2),
        paragraph(),
      ]);

    case 'questions':
      return baseDoc([
        heading(`Research: ${title}`),
        paragraph(notes || undefined),
        heading('Question', 2),
        paragraph(title),
        heading('Hypothesis', 2),
        paragraph('What do I think the answer might be?'),
        heading('Research', 2),
        paragraph(),
        heading('Sources', 2),
        bulletList(['Source 1']),
        heading('Conclusion', 2),
        paragraph(),
      ]);

    case 'reference':
      return baseDoc([
        heading(title),
        paragraph(notes || undefined),
        heading('Summary', 2),
        paragraph(),
        heading('Key Points', 2),
        bulletList(['Point 1']),
        heading('Related Topics', 2),
        paragraph(),
      ]);

    default:
      // Default: just title + notes
      return baseDoc([
        heading(title),
        ...(notes ? [paragraph(notes)] : []),
        paragraph(),
      ]);
  }
}

interface LinkedPageSectionProps {
  item: Item;
  linkedPage: Page | null;
  userId: string;
  destinationSlug?: string;
  onPageCreated?: (pageId: string) => void;
}

export function LinkedPageSection({
  item,
  linkedPage,
  userId,
  destinationSlug,
  onPageCreated,
}: LinkedPageSectionProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreatePage() {
    setIsCreating(true);

    try {
      const supabase = createClient();

      // Build initial TipTap document from item data using destination template
      const tiptapDoc = getDestinationTemplate(destinationSlug || '', item.title, item.notes);

      const { data: newPage, error } = await supabase
        .from('pages')
        .insert({
          user_id: userId,
          title: item.title,
          content: tiptapDoc,
          item_id: item.id,
          space_id: item.space_id,
          project_id: item.project_id,
        })
        .select()
        .single();

      if (error) throw error;

      onPageCreated?.(newPage.id);
      router.push(`/pages/${newPage.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create page';
      toast.error('Could not create page', { description: message });
    } finally {
      setIsCreating(false);
    }
  }

  // ----------------------------------------------------------------
  // Linked page exists — show clickable card
  // ----------------------------------------------------------------
  if (linkedPage) {
    return (
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Linked Page
        </h3>
        <Link
          href={`/pages/${linkedPage.id}`}
          className={cn(
            'group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4',
            'transition-all duration-200 hover:border-[#c2410c]/30 hover:bg-[#c2410c]/[0.04]'
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c2410c]/10 text-lg">
            {linkedPage.icon || '\uD83D\uDCC4'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white/90 group-hover:text-white">
              {linkedPage.title}
            </p>
            <p className="text-xs text-white/30">
              Last updated{' '}
              {new Date(linkedPage.updated_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-[#c2410c]" />
        </Link>
      </section>
    );
  }

  // ----------------------------------------------------------------
  // No linked page — show "Start a Page" button
  // ----------------------------------------------------------------
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
        Page
      </h3>
      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
            <FileText className="h-5 w-5 text-white/20" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/50">
              Expand this item into a full page with rich text editing.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={isCreating}
            onClick={handleCreatePage}
            className="shrink-0 gap-1.5 rounded-xl bg-[#c2410c]/10 text-[#c2410c] hover:bg-[#c2410c]/20"
          >
            {isCreating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {isCreating ? 'Creating...' : 'Start a Page'}
          </Button>
        </div>
      </div>
    </section>
  );
}
