import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import { CLUSTER_ITEMS_PROMPT } from '@/lib/ai/prompts';

interface Cluster {
  theme: string;
  item_ids: string[];
  suggested_project_name: string;
  reasoning: string;
}

interface ClustersResponse {
  clusters: Cluster[];
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
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    // Call AI
    const prompt = CLUSTER_ITEMS_PROMPT(items);
    const result = await callAIWithJSON<ClustersResponse>(prompt, 1500);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(JSON.stringify(result).length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      item_id: null,
      action: 'cluster_items',
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { items: items.length },
      response: result,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error clustering items:', error);
    return NextResponse.json(
      { error: 'Failed to cluster items' },
      { status: 500 }
    );
  }
}
