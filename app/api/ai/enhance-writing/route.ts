import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI, calculateCost } from '@/lib/ai/client';
import { ENHANCE_WRITING_PROMPT } from '@/lib/ai/prompts';

type EnhanceAction = 'continue' | 'improve' | 'summarize' | 'outline' | 'expand';

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
    const { content, action } = await request.json() as {
      content: string;
      action: EnhanceAction;
    };

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!action || !['continue', 'improve', 'summarize', 'outline', 'expand'].includes(action)) {
      return NextResponse.json({ error: 'Valid action is required' }, { status: 400 });
    }

    // Build prompt and call AI
    const prompt = ENHANCE_WRITING_PROMPT(content, action);
    const result = await callAI(prompt, 1500);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(result.length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: `enhance_${action}`,
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { content_length: content.length, action },
      response: { result_length: result.length },
    } as any);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in enhance writing:', error);
    return NextResponse.json(
      { error: 'Failed to enhance writing' },
      { status: 500 }
    );
  }
}
