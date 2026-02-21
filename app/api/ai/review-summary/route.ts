import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { REVIEW_SUMMARY_PROMPT } from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { reviewSummarySchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

interface ReviewSummaryResponse {
  greeting: string;
  highlights: string[];
  concerns: string[];
  suggestion: string;
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
    const validation = validateBody(reviewSummarySchema, body);
    if (!validation.success) return validation.response;
    const {
      inboxCount,
      backlogCount,
      somedayCount,
      waitingCount,
      overdueCount,
      completedThisWeek,
      streakCount,
      topItems,
    } = validation.data;

    // Call AI
    const prompt = REVIEW_SUMMARY_PROMPT({
      inboxCount,
      backlogCount,
      somedayCount,
      waitingCount,
      overdueCount,
      completedThisWeek,
      streakCount,
      topItems,
    });
    const result = await callAIWithJSON<ReviewSummaryResponse>(prompt, 1000);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(JSON.stringify(result).length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: null,
      action: 'review_summary',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { inboxCount, backlogCount, somedayCount, waitingCount, overdueCount, completedThisWeek, streakCount, topItems },
      response: result,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error generating review summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate review summary' },
      { status: 500 }
    );
  }
}
