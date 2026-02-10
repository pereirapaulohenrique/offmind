import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { SUGGEST_SUBTASKS_PROMPT } from '@/lib/ai/prompts';

interface SubtaskSuggestion {
  title: string;
  sort_order: number;
}

interface SubtasksResponse {
  subtasks: SubtaskSuggestion[];
  reasoning: string;
}

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
    const { itemId, title, notes, existingSubtasks } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Call AI
    const prompt = SUGGEST_SUBTASKS_PROMPT(title, notes, existingSubtasks);
    const result = await callAIWithJSON<SubtasksResponse>(prompt, 1000);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(JSON.stringify(result).length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: itemId || null,
      action: 'suggest_subtasks',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { itemId, title, notes, existingSubtasks },
      response: result,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error suggesting subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to suggest subtasks' },
      { status: 500 }
    );
  }
}
