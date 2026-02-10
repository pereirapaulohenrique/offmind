import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, calculateCost } from '@/lib/ai/client';
import { DRAFT_PAGE_PROMPT } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { itemId, title, notes, subtasks, destinationSlug } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Call AI (plain text response, not JSON)
    const prompt = DRAFT_PAGE_PROMPT(title, notes, subtasks, destinationSlug);
    const content = await callAI(prompt, 2000);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(content.length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: itemId || null,
      action: 'draft_page',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { itemId, title, notes, subtasks, destinationSlug },
      response: { content },
    } as any);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error drafting page:', error);
    return NextResponse.json(
      { error: 'Failed to draft page' },
      { status: 500 }
    );
  }
}
