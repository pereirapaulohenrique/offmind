import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { SUGGEST_DESTINATION_PROMPT } from '@/lib/ai/prompts';

interface SuggestionResponse {
  destination: string;
  confidence: number;
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
    const { itemId, title, notes } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Call AI
    const prompt = SUGGEST_DESTINATION_PROMPT(title, notes);
    const suggestion = await callAIWithJSON<SuggestionResponse>(prompt);

    // Get the destination ID for the suggested slug
    const { data: destination } = await supabase
      .from('destinations')
      .select('id, name, icon, slug')
      .eq('user_id', user.id)
      .eq('slug', suggestion.destination)
      .single();

    // Log the AI usage (estimate tokens since we don't have exact counts)
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = 50;
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: itemId || null,
      action: 'suggest_destination',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { title, notes },
      response: suggestion,
    } as any);

    return NextResponse.json({
      destination: destination || null,
      destinationSlug: suggestion.destination,
      confidence: suggestion.confidence,
      reasoning: suggestion.reasoning,
    });
  } catch (error) {
    console.error('Error suggesting destination:', error);
    return NextResponse.json(
      { error: 'Failed to suggest destination' },
      { status: 500 }
    );
  }
}
