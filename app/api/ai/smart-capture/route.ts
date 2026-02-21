import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { SUGGEST_DESTINATION_PROMPT, EXTRACT_DATE_PROMPT } from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { smartCaptureSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

interface CategorizeResponse {
  destination: string;
  confidence: number;
  reasoning: string;
}

interface DateResponse {
  has_date: boolean;
  date: string | null;
  time: string | null;
  is_all_day: boolean;
  cleaned_text: string;
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
    const validation = validateBody(smartCaptureSchema, body);
    if (!validation.success) return validation.response;
    const { text } = validation.data;

    // First, extract any date from the text
    const datePrompt = EXTRACT_DATE_PROMPT(text);
    const dateResult = await callAIWithJSON<DateResponse>(datePrompt);

    // Use the cleaned text for categorization
    const titleText = dateResult.cleaned_text || text;

    // Suggest destination
    const destPrompt = SUGGEST_DESTINATION_PROMPT(titleText);
    const suggestion = await callAIWithJSON<CategorizeResponse>(destPrompt);

    // Get the destination ID for the suggested slug
    const { data: destination } = await supabase
      .from('destinations')
      .select('id, name, icon, slug')
      .eq('user_id', user.id)
      .eq('slug', suggestion.destination)
      .single();

    // Determine layer based on whether we have a date
    let layer = 'capture';
    let scheduled_at = null;

    if (dateResult.has_date && dateResult.date) {
      layer = 'commit';
      if (dateResult.time) {
        scheduled_at = `${dateResult.date}T${dateResult.time}:00`;
      } else {
        scheduled_at = `${dateResult.date}T09:00:00`;
      }
    } else if (destination) {
      layer = 'process';
    }

    // Create the item
    const { data: item, error: insertError } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        title: titleText,
        layer,
        destination_id: destination?.id || null,
        scheduled_at,
        is_all_day: dateResult.is_all_day,
        source: 'ai-capture',
      } as any)
      .select()
      .single();

    if (insertError) throw insertError;

    // Log AI usage
    const estimatedInputTokens = Math.ceil((datePrompt.length + destPrompt.length) / 4);
    const estimatedOutputTokens = 100;
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: item?.id || null,
      action: 'smart_capture',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { text },
      response: { suggestion, dateResult },
    } as any);

    return NextResponse.json({
      id: item?.id,
      title: titleText,
      destination: destination?.name || suggestion.destination,
      scheduled_at,
      layer,
      confidence: suggestion.confidence,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error in smart capture:', error);
    return NextResponse.json(
      { error: 'Failed to capture item' },
      { status: 500 }
    );
  }
}
