import { createClient } from '@/lib/supabase/client';

/**
 * Soft delete an item by setting archived_at
 */
export async function softDeleteItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('items')
    .update({ archived_at: new Date().toISOString() } as any)
    .eq('id', itemId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Restore a soft-deleted item
 */
export async function restoreItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('items')
    .update({ archived_at: null, layer: 'capture', destination_id: null } as any)
    .eq('id', itemId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Permanently delete items that have been archived for more than 30 days
 */
export async function purgeOldItems(userId: string): Promise<{ count: number; error?: string }> {
  const supabase = createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('items')
    .delete()
    .eq('user_id', userId)
    .lt('archived_at', thirtyDaysAgo.toISOString())
    .select('id');

  if (error) return { count: 0, error: error.message };
  return { count: data?.length || 0 };
}
