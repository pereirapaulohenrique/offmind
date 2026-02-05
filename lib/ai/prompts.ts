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

export const BATCH_CATEGORIZE_PROMPT = (items: { id: string; title: string; notes?: string }[]) => `You are a productivity assistant. Categorize each item into the most appropriate destination.

DESTINATIONS:
- backlog: Concrete actions to take
- reference: Information to save
- incubating: Ideas to develop
- someday: Maybe later
- questions: Things to research
- waiting: Waiting for someone
- trash: Not important

ITEMS:
${items.map((item, i) => `${i + 1}. "${item.title}"${item.notes ? ` - ${item.notes}` : ''}`).join('\n')}

Respond with JSON array:
[
  {"item_id": "id", "destination": "slug", "confidence": 0.0-1.0},
  ...
]`;
