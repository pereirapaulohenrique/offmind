import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, calculateCost } from '@/lib/ai/client';
import { GENERATE_TITLE_PROMPT } from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { generateTitleSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateCheck = withRateLimit(user.id, AI_RATE_LIMIT, 'ai');
    if (!rateCheck.allowed) return rateCheck.response;

    const body = await request.json();
    const validation = validateBody(generateTitleSchema, body);
    if (!validation.success) return validation.response;
    const { itemId, text } = validation.data;

    const prompt = GENERATE_TITLE_PROMPT(text);
    const title = (await callAI(prompt, 50)).trim().replace(/^["']|["']$/g, '');

    // Update the item's title in the database
    if (itemId) {
      await supabase
        .from('items')
        .update({ title } as any)
        .eq('id', itemId);
    }

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = 20;
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: itemId || null,
      action: 'generate_title',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { text: text.slice(0, 200) },
      response: { title },
    } as any);

    return NextResponse.json({ title });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
