'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, X, Link2, ShieldAlert, Search, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Item } from '@/types/database';

interface ItemRelation {
  id: string;
  source_item_id: string;
  target_item_id: string;
  relation_type: string;
  related_item: Item;
}

interface ItemRelationsSectionProps {
  itemId: string;
  userId: string;
}

export function ItemRelationsSection({ itemId, userId }: ItemRelationsSectionProps) {
  const [relations, setRelations] = useState<ItemRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingType, setAddingType] = useState<'related' | 'blocks'>('related');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch relations
  const fetchRelations = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get relations where this item is source
      const { data: sourceRelations } = await supabase
        .from('item_relations')
        .select('id, source_item_id, target_item_id, relation_type')
        .eq('source_item_id', itemId);

      // Get relations where this item is target
      const { data: targetRelations } = await supabase
        .from('item_relations')
        .select('id, source_item_id, target_item_id, relation_type')
        .eq('target_item_id', itemId);

      const allRelations = [...(sourceRelations || []), ...(targetRelations || [])];

      // Get all related item IDs
      const relatedItemIds = allRelations.map(r =>
        r.source_item_id === itemId ? r.target_item_id : r.source_item_id
      );

      if (relatedItemIds.length === 0) {
        setRelations([]);
        setIsLoading(false);
        return;
      }

      // Fetch related items
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .in('id', relatedItemIds);

      const itemMap = new Map((items || []).map((i: any) => [i.id, i]));

      const enriched: ItemRelation[] = allRelations
        .map(r => {
          const relatedId = r.source_item_id === itemId ? r.target_item_id : r.source_item_id;
          const relatedItem = itemMap.get(relatedId);
          if (!relatedItem) return null;
          return {
            id: r.id,
            source_item_id: r.source_item_id,
            target_item_id: r.target_item_id,
            relation_type: r.relation_type,
            related_item: relatedItem as Item,
          };
        })
        .filter(Boolean) as ItemRelation[];

      setRelations(enriched);
    } catch (err) {
      console.error('Failed to fetch relations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [itemId, supabase]);

  useEffect(() => {
    fetchRelations();
  }, [fetchRelations]);

  // Search for items
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const { data } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', userId)
            .neq('id', itemId)
            .ilike('title', `%${query}%`)
            .is('archived_at', null)
            .limit(10);

          // Filter out already-related items
          const existingIds = new Set(relations.map(r =>
            r.source_item_id === itemId ? r.target_item_id : r.source_item_id
          ));
          setSearchResults((data || []).filter((i: any) => !existingIds.has(i.id)) as Item[]);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [itemId, userId, supabase, relations],
  );

  // Add relation
  const addRelation = useCallback(
    async (targetId: string) => {
      try {
        const { error } = await supabase.from('item_relations').insert({
          user_id: userId,
          source_item_id: itemId,
          target_item_id: targetId,
          relation_type: addingType,
        });

        if (error) throw error;

        await fetchRelations();
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        toast.success(addingType === 'related' ? 'Relation added' : 'Dependency added');
      } catch (err: any) {
        if (err?.code === '23505') {
          toast.error('This relation already exists');
        } else {
          toast.error('Failed to add relation');
        }
      }
    },
    [itemId, userId, addingType, supabase, fetchRelations],
  );

  // Remove relation
  const removeRelation = useCallback(
    async (relationId: string) => {
      try {
        const { error } = await supabase
          .from('item_relations')
          .delete()
          .eq('id', relationId);

        if (error) throw error;
        setRelations(prev => prev.filter(r => r.id !== relationId));
        toast.success('Relation removed');
      } catch {
        toast.error('Failed to remove relation');
      }
    },
    [supabase],
  );

  // Focus search input when opening
  useEffect(() => {
    if (showSearch) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [showSearch]);

  // Split relations by type
  const relatedItems = relations.filter(r => r.relation_type === 'related');
  const blockedByItems = relations.filter(
    r => r.relation_type === 'blocks' && r.target_item_id === itemId,
  );
  const blocksItems = relations.filter(
    r => r.relation_type === 'blocks' && r.source_item_id === itemId,
  );

  const totalRelations = relations.length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Relations
          </h3>
          {totalRelations > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-semibold tabular-nums text-neutral-400">
              {totalRelations}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            setSearchQuery('');
            setSearchResults([]);
          }}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-lg transition-colors',
            showSearch
              ? 'bg-[#c2410c]/10 text-[#c2410c]'
              : 'text-neutral-600 hover:bg-white/[0.06] hover:text-neutral-300',
          )}
        >
          {showSearch ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Search UI */}
      {showSearch && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-3">
          {/* Type toggle */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setAddingType('related')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors',
                addingType === 'related'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-neutral-500 border border-transparent hover:text-neutral-300',
              )}
            >
              <Link2 className="h-3 w-3" />
              Related to
            </button>
            <button
              onClick={() => setAddingType('blocks')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors',
                addingType === 'blocks'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'text-neutral-500 border border-transparent hover:text-neutral-300',
              )}
            >
              <ShieldAlert className="h-3 w-3" />
              Blocks
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search items..."
              className={cn(
                'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 py-2 text-sm text-neutral-100',
                'placeholder:text-neutral-600 focus:border-[#c2410c]/40 focus:outline-none focus:ring-1 focus:ring-[#c2410c]/30',
              )}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600 animate-spin" />
            )}
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
              {searchResults.map(item => (
                <button
                  key={item.id}
                  onClick={() => addRelation(item.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-white/[0.04] border-b border-white/[0.04] last:border-b-0"
                >
                  <span className="truncate flex-1 text-left">{item.title}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
                </button>
              ))}
            </div>
          )}

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <p className="text-xs text-neutral-600 text-center py-2">
              No items found
            </p>
          )}
        </div>
      )}

      {/* Relations display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
        </div>
      ) : totalRelations === 0 && !showSearch ? (
        <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] px-4 py-6 text-center">
          <Link2 className="mx-auto h-5 w-5 text-neutral-700" />
          <p className="mt-2 text-xs text-neutral-600">
            No relations yet. Link related items or set dependencies.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Blocked by */}
          {blockedByItems.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-400/70">
                Blocked by
              </p>
              <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] overflow-hidden">
                {blockedByItems.map(rel => (
                  <RelationRow
                    key={rel.id}
                    relation={rel}
                    currentItemId={itemId}
                    onRemove={removeRelation}
                    accent="red"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Blocks */}
          {blocksItems.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">
                Blocks
              </p>
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] overflow-hidden">
                {blocksItems.map(rel => (
                  <RelationRow
                    key={rel.id}
                    relation={rel}
                    currentItemId={itemId}
                    onRemove={removeRelation}
                    accent="amber"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Related */}
          {relatedItems.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-blue-400/70">
                Related
              </p>
              <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.03] overflow-hidden">
                {relatedItems.map(rel => (
                  <RelationRow
                    key={rel.id}
                    relation={rel}
                    currentItemId={itemId}
                    onRemove={removeRelation}
                    accent="blue"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Relation row subcomponent
function RelationRow({
  relation,
  currentItemId,
  onRemove,
  accent,
}: {
  relation: ItemRelation;
  currentItemId: string;
  onRemove: (id: string) => void;
  accent: 'red' | 'amber' | 'blue';
}) {
  const item = relation.related_item;
  const accentColors = {
    red: 'hover:bg-red-500/[0.05]',
    amber: 'hover:bg-amber-500/[0.05]',
    blue: 'hover:bg-blue-500/[0.05]',
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] last:border-b-0 transition-colors',
        accentColors[accent],
      )}
    >
      <Link
        href={`/items/${item.id}`}
        className="flex-1 min-w-0 truncate text-sm text-neutral-200 hover:text-white transition-colors"
      >
        {item.title}
      </Link>
      {item.is_completed && (
        <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
          Done
        </span>
      )}
      <button
        onClick={() => onRemove(relation.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-neutral-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
