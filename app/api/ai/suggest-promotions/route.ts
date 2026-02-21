import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { SUGGEST_PROMOTIONS_PROMPT } from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { suggestPromotionsSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

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

    const rateCheck = withRateLimit(user.id, AI_RATE_LIMIT, 'ai');
    if (!rateCheck.allowed) return rateCheck.response;

    // Get request body
    const body = await request.json();
    const validation = validateBody(suggestPromotionsSchema, body);
    if (!validation.success) return validation.response;
    const { somedayItems, recentActivity } = validation.data;

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
    Sentry.captureException(error);
    console.error('Error suggesting promotions:', error);
    return NextResponse.json(
      { error: 'Failed to suggest promotions' },
      { status: 500 }
    );
  }
}
