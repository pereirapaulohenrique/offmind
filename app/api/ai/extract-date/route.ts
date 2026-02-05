import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { EXTRACT_DATE_PROMPT } from '@/lib/ai/prompts';

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

    // Get request body
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Call AI to extract date
    const prompt = EXTRACT_DATE_PROMPT(text);
    const result = await callAIWithJSON<DateResponse>(prompt);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = 50;
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: 'extract_date',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { text },
      response: result,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error extracting date:', error);
    return NextResponse.json(
      { error: 'Failed to extract date' },
      { status: 500 }
    );
  }
}
