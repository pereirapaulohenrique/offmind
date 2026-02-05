import { format } from 'date-fns';

export const SUGGEST_DESTINATION_PROMPT = (title: string, notes?: string) => `You are a productivity assistant helping categorize tasks and thoughts.

Given the following item, suggest the most appropriate destination:

DESTINATIONS:
- backlog: Concrete actions to take, no specific date yet
- reference: Information to save and consult later
- incubating: Ideas that need more development/thinking
- someday: Things that might happen eventually, no commitment
- questions: Things to research or find answers to
- waiting: Delegated tasks or waiting for someone/something
- trash: Not important, can be forgotten

ITEM:
Title: ${title}
${notes ? `Notes: ${notes}` : ''}

Respond with JSON only:
{
  "destination": "slug",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

export const EXPAND_NOTE_PROMPT = (title: string, notes?: string) => `You are a writing assistant. Expand the following brief note into a more detailed version while preserving the original intent. Keep it concise but add helpful context.

Title: ${title}
${notes ? `Original note: ${notes}` : 'No notes provided'}

Provide only the expanded note, no explanation.`;

export const EXTRACT_DATE_PROMPT = (text: string) => `Extract any date or time information from the following text. Today is ${format(new Date(), 'yyyy-MM-dd')}.

Text: "${text}"

Respond with JSON only:
{
  "has_date": boolean,
  "date": "YYYY-MM-DD" or null,
  "time": "HH:MM" or null,
  "is_all_day": boolean,
  "cleaned_text": "text with date/time removed"
}

Examples:
"Call mom tomorrow at 3pm" → {"has_date": true, "date": "YYYY-MM-DD", "time": "15:00", "is_all_day": false, "cleaned_text": "Call mom"}
"Buy groceries" → {"has_date": false, "date": null, "time": null, "is_all_day": false, "cleaned_text": "Buy groceries"}
"Meeting next Monday" → {"has_date": true, "date": "YYYY-MM-DD", "time": null, "is_all_day": true, "cleaned_text": "Meeting"}`;

export const BATCH_CATEGORIZE_PROMPT = (
  items: { id: string; title: string; notes?: string }[],
  destinations: { slug: string; name: string }[]
) => `You are a productivity assistant. Categorize each item into the most appropriate destination.

AVAILABLE DESTINATIONS:
${destinations.map(d => `- ${d.slug}: ${d.name}`).join('\n')}

ITEMS:
${items.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}"${item.notes ? ` - ${item.notes}` : ''}`).join('\n')}

Respond with JSON array only:
[
  {"item_id": "actual-id", "destination": "slug", "confidence": 0.0-1.0, "reasoning": "brief reason"},
  ...
]`;

export const FIND_SIMILAR_PROMPT = (items: { id: string; title: string; notes?: string }[]) => `You are a productivity assistant. Find items that are similar or duplicates and could be merged.

ITEMS:
${items.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}"${item.notes ? ` - ${item.notes}` : ''}`).join('\n')}

Identify groups of similar items. Respond with JSON array only:
[
  {"item_id": "id", "similar_to": ["other-id"], "merge_suggestion": "suggested merged title", "confidence": 0.0-1.0, "reasoning": "why these are similar"},
  ...
]

Only include items that have similar counterparts. Empty array if no similarities found.`;

export const CLEANUP_PROMPT = (items: { id: string; title: string; notes?: string }[]) => `You are a productivity assistant. Identify items that might be outdated, irrelevant, or could be deleted.

ITEMS:
${items.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}"${item.notes ? ` - ${item.notes}` : ''}`).join('\n')}

Identify items that could be cleaned up. Respond with JSON array only:
[
  {"item_id": "id", "action": "delete" | "archive", "confidence": 0.0-1.0, "reasoning": "why this should be cleaned up"},
  ...
]

Only include items worth cleaning. Empty array if all items seem valid.`;

export const IMPROVE_TITLES_PROMPT = (items: { id: string; title: string; notes?: string }[]) => `You are a writing assistant. Improve the titles of these items to be clearer and more actionable.

ITEMS:
${items.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}"${item.notes ? ` (notes: ${item.notes})` : ''}`).join('\n')}

Respond with JSON array only:
[
  {"item_id": "id", "improved_title": "clearer title", "confidence": 0.0-1.0, "reasoning": "how it was improved"},
  ...
]

Only include items where the title could meaningfully be improved. Keep original if already good.`;

export const SUGGEST_SCHEDULE_PROMPT = (items: { id: string; title: string; notes?: string }[]) => `You are a productivity assistant helping schedule tasks. Today is ${format(new Date(), 'yyyy-MM-dd')}.

ITEMS:
${items.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}"${item.notes ? ` - ${item.notes}` : ''}`).join('\n')}

Suggest optimal scheduling for these items. Consider:
- Urgency implied by the title/notes
- Time of day (morning for focus work, afternoon for meetings)
- Logical ordering

Respond with JSON array only:
[
  {"item_id": "id", "suggested_date": "YYYY-MM-DD", "suggested_time": "HH:MM" or null, "confidence": 0.0-1.0, "reasoning": "why this timing"},
  ...
]`;

export const ENHANCE_WRITING_PROMPT = (content: string, action: 'continue' | 'improve' | 'summarize' | 'outline' | 'expand') => {
  const instructions: Record<typeof action, string> = {
    continue: 'Continue writing from where the text ends. Maintain the same style and tone.',
    improve: 'Improve the clarity, grammar, and flow of the text while preserving the meaning.',
    summarize: 'Provide a concise summary of the main points.',
    outline: 'Create a structured outline based on the content.',
    expand: 'Expand on the ideas with more detail and examples.',
  };

  return `You are a writing assistant. ${instructions[action]}

CONTENT:
${content}

Provide only the result, no explanation or meta-commentary.`;
};
