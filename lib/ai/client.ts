// AI Client using OpenRouter API
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function callAI(prompt: string, maxTokens: number = 500): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'OffMind',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-haiku',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter API error:', error);
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function callAIWithJSON<T>(prompt: string, maxTokens: number = 500): Promise<T> {
  const response = await callAI(prompt, maxTokens);

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, response];
  const jsonString = jsonMatch[1] || response;

  try {
    return JSON.parse(jsonString.trim()) as T;
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', response);
    throw new Error('AI response was not valid JSON');
  }
}

// Track usage for cost monitoring
export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export function calculateCost(inputTokens: number, outputTokens: number): number {
  // Claude 3.5 Haiku pricing via OpenRouter
  const inputCostPer1M = 0.25;
  const outputCostPer1M = 1.25;

  return (inputTokens * inputCostPer1M / 1_000_000) + (outputTokens * outputCostPer1M / 1_000_000);
}
