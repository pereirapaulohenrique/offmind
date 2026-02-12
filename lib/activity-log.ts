import { createClient } from '@/lib/supabase/client';

export type ActivityAction =
  | 'created'
  | 'routed'
  | 'scheduled'
  | 'completed'
  | 'uncompleted'
  | 'archived'
  | 'unarchived'
  | 'field_changed'
  | 'note_added';

/**
 * Fire-and-forget activity logger — never blocks user actions.
 * Logs significant actions on items for ATS-style lifecycle tracking.
 */
export function logActivity(params: {
  itemId: string;
  userId: string;
  action: ActivityAction;
  note?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const supabase = createClient();
    void supabase
      .from('item_activities')
      .insert({
        item_id: params.itemId,
        user_id: params.userId,
        action: params.action,
        note: params.note || null,
        metadata: params.metadata || null,
      } as any)
      .then(null, (e: unknown) => console.error('Activity log failed:', e));
  } catch {
    // Never block caller
  }
}
