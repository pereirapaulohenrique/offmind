import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, calculateCost } from '@/lib/ai/client';
import { EXPAND_NOTE_PROMPT } from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { expandNotesSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

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

    // Rate limit
    const rateCheck = withRateLimit(user.id, AI_RATE_LIMIT, 'ai');
    if (!rateCheck.allowed) return rateCheck.response;

    // Validate request body
    const body = await request.json();
    const validation = validateBody(expandNotesSchema, body);
    if (!validation.success) return validation.response;
    const { notes, title: validatedTitle } = validation.data;
    const title = validatedTitle || 'Note';

    // Call AI to expand notes
    const prompt = EXPAND_NOTE_PROMPT(title, notes);
    const expanded = await callAI(prompt, 1000);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(expanded.length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: 'expand_notes',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { notes, title },
      response: { expanded },
    } as any);

    return NextResponse.json({ expanded });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error expanding notes:', error);
    return NextResponse.json(
      { error: 'Failed to expand notes' },
      { status: 500 }
    );
  }
}
