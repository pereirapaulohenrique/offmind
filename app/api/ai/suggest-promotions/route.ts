import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { SUGGEST_PROMOTIONS_PROMPT } from '@/lib/ai/prompts';

interface Promotion {
  item_id: string;
  confidence: number;
  reasoning: string;
}

interface PromotionsResponse {
  promotions: Promotion[];
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
    const { somedayItems, recentActivity } = await request.json();

    if (!somedayItems || somedayItems.length === 0) {
      return NextResponse.json({ error: 'Someday items are required' }, { status: 400 });
    }

    // Call AI
    const prompt = SUGGEST_PROMOTIONS_PROMPT(somedayItems, recentActivity || []);
    const result = await callAIWithJSON<PromotionsResponse>(prompt, 1000);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(JSON.stringify(result).length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: null,
      action: 'suggest_promotions',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { somedayItems: somedayItems.length, recentActivity: recentActivity?.length || 0 },
      response: result,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error suggesting promotions:', error);
    return NextResponse.json(
      { error: 'Failed to suggest promotions' },
      { status: 500 }
    );
  }
}
