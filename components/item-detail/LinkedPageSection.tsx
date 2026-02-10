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

interface LinkedPageSectionProps {
  item: Item;
  linkedPage: Page | null;
  userId: string;
  onPageCreated?: (pageId: string) => void;
}

export function LinkedPageSection({
  item,
  linkedPage,
  userId,
  onPageCreated,
}: LinkedPageSectionProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreatePage() {
    setIsCreating(true);

    try {
      const supabase = createClient();

      // Build initial TipTap document from item data
      const tiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: item.title }],
          },
          ...(item.notes
            ? [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: item.notes }],
                },
              ]
            : []),
          { type: 'paragraph' },
        ],
      };

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
