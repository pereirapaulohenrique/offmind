import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithJSON, calculateCost } from '@/lib/ai/client';
import {
  BATCH_CATEGORIZE_PROMPT,
  FIND_SIMILAR_PROMPT,
  CLEANUP_PROMPT,
  IMPROVE_TITLES_PROMPT,
  SUGGEST_SCHEDULE_PROMPT,
} from '@/lib/ai/prompts';
import { validateBody } from '@/lib/validations/validate';
import { bulkProcessSchema } from '@/lib/validations/schemas';
import { withRateLimit } from '@/lib/api-utils';
import { AI_RATE_LIMIT } from '@/lib/rate-limit';

type BulkAction = 'categorize' | 'merge' | 'cleanup' | 'improve' | 'schedule';

interface BulkItem {
  id: string;
  title: string;
  notes?: string | null;
  destination_id?: string | null;
  layer?: string | null;
}

interface DestinationInfo {
  id: string;
  slug: string;
  name: string;
}

interface BulkSuggestion {
  itemId: string;
  itemTitle: string;
  suggestion: string;
  destinationSlug?: string;
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

    // Rate limit
    const rateCheck = withRateLimit(user.id, AI_RATE_LIMIT, 'ai');
    if (!rateCheck.allowed) return rateCheck.response;

    // Validate request body
    const body = await request.json();
    const validation = validateBody(bulkProcessSchema, body);
    if (!validation.success) return validation.response;
    const { items, action, destinations } = validation.data;

    // Build prompt based on action
    let prompt: string;
    const itemsForPrompt = items.map(item => ({
      id: item.id,
      title: item.title,
      notes: item.notes ?? undefined,
    }));

    switch (action) {
      case 'categorize':
        prompt = BATCH_CATEGORIZE_PROMPT(itemsForPrompt, destinations!);
        break;
      case 'merge':
        prompt = FIND_SIMILAR_PROMPT(itemsForPrompt);
        break;
      case 'cleanup':
        prompt = CLEANUP_PROMPT(itemsForPrompt);
        break;
      case 'improve':
        prompt = IMPROVE_TITLES_PROMPT(itemsForPrompt);
        break;
      case 'schedule':
        prompt = SUGGEST_SCHEDULE_PROMPT(itemsForPrompt);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Call AI
    const result = await callAIWithJSON<any[]>(prompt, 2000);

    // Transform results to consistent format
    const suggestions: BulkSuggestion[] = transformResults(result, items, action, destinations ?? undefined);

    // Log AI usage
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(JSON.stringify(result).length / 4);
    const costUsd = calculateCost(estimatedInputTokens, estimatedOutputTokens);

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      action: `bulk_${action}`,
      model: 'claude-3-5-haiku-20241022',
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      cost_usd: costUsd,
      request: { items: items.length, action },
      response: { suggestions: suggestions.length },
    } as any);

    return NextResponse.json({ suggestions });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error in bulk AI processing:', error);
    return NextResponse.json(
      { error: 'Failed to process items' },
      { status: 500 }
    );
  }
}

function transformResults(
  result: any[],
  items: BulkItem[],
  action: BulkAction,
  destinations?: DestinationInfo[]
): BulkSuggestion[] {
  if (!Array.isArray(result)) return [];

  const itemMap = new Map(items.map(item => [item.id, item]));

  return result.flatMap(r => {
    const item = itemMap.get(r.item_id);
    if (!item) return [];

    let suggestion = '';
    let destinationSlug: string | undefined;

    switch (action) {
      case 'categorize': {
        const dest = destinations?.find(d => d.slug === r.destination);
        suggestion = `Move to ${dest?.name || r.destination}`;
        destinationSlug = r.destination;
        break;
      }
      case 'merge':
        suggestion = r.merge_suggestion || `Merge with similar items`;
        break;
      case 'cleanup':
        suggestion = r.action === 'delete' ? 'Delete this item' : 'Archive this item';
        break;
      case 'improve':
        suggestion = r.improved_title || item.title;
        break;
      case 'schedule': {
        const time = r.suggested_time ? ` at ${r.suggested_time}` : '';
        suggestion = `Schedule for ${r.suggested_date}${time}`;
        break;
      }
    }

    return [{
      itemId: r.item_id as string,
      itemTitle: item.title,
      suggestion,
      destinationSlug,
      confidence: (r.confidence || 0.5) as number,
      reasoning: (r.reasoning || '') as string,
    }];
  });
}
