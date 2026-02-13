import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, calculateCost } from '@/lib/ai/client';
import { GENERATE_TITLE_PROMPT } from '@/lib/ai/prompts';

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch items where notes is null/empty AND title has content
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, title, notes')
      .eq('user_id', user.id)
      .or('notes.is.null,notes.eq.')
      .not('title', 'is', null)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Failed to fetch items for migration:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ migrated: 0, message: 'No items to migrate' });
    }

    // Process in batches of 5
    const BATCH_SIZE = 5;
    const results: { id: string; oldTitle: string; newTitle: string }[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const originalContent = item.title;

          if (!originalContent || originalContent.trim().length === 0) {
            return null;
          }

          try {
            // Generate a concise AI title from the content
            const prompt = GENERATE_TITLE_PROMPT(originalContent);
            const newTitle = (await callAI(prompt, 50)).trim().replace(/^["']|["']$/g, '');

            // Track token estimates
            const inputTokens = Math.ceil(prompt.length / 4);
            const outputTokens = Math.ceil(newTitle.length / 4);
            totalInputTokens += inputTokens;
            totalOutputTokens += outputTokens;

            // Update: title = AI generated, notes = original content
            const { error: updateError } = await supabase
              .from('items')
              .update({ title: newTitle, notes: originalContent } as any)
              .eq('id', item.id);

            if (updateError) {
              console.error(`Failed to update item ${item.id}:`, updateError);
              return null;
            }

            return { id: item.id, oldTitle: originalContent, newTitle };
          } catch (err) {
            console.error(`Failed to generate title for item ${item.id}:`, err);
            return null;
          }
        })
      );

      results.push(...batchResults.filter((r): r is NonNullable<typeof r> => r !== null));
    }

    // Log the bulk migration
    const costUsd = calculateCost(totalInputTokens, totalOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: 'migrate_titles',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      cost_usd: costUsd,
      request: { total_items: items.length },
      response: { migrated: results.length },
    } as any);

    return NextResponse.json({
      migrated: results.length,
      total: items.length,
      results,
    });
  } catch (error) {
    console.error('Error in migrate-titles:', error);
    return NextResponse.json(
      { error: 'Failed to migrate titles' },
      { status: 500 }
    );
  }
}
