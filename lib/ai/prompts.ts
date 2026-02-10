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

export const SUGGEST_SUBTASKS_PROMPT = (
  title: string,
  notes?: string,
  existingSubtasks?: string[]
) => `You are a productivity assistant helping break down complex tasks into actionable subtasks.

TASK:
Title: ${title}
${notes ? `Notes: ${notes}` : ''}
${existingSubtasks && existingSubtasks.length > 0 ? `\nExisting subtasks (suggest NEW ones that complement these):\n${existingSubtasks.map((s, i) => `- ${s}`).join('\n')}` : ''}

Break this task into 3-8 specific, actionable subtasks. Each subtask should be a concrete next action, not vague or abstract.

Respond with JSON only:
{
  "subtasks": [
    { "title": "specific action", "sort_order": 1 },
    ...
  ],
  "reasoning": "brief explanation of how you broke this down"
}`;

export const REVIEW_SUMMARY_PROMPT = (data: {
  inboxCount: number;
  backlogCount: number;
  somedayCount: number;
  waitingCount: number;
  overdueCount: number;
  completedThisWeek: number;
  streakCount: number;
  topItems: { title: string; destination: string; age_days: number }[];
}) => `You are a supportive productivity coach generating a personalized weekly review summary.

CURRENT STATE:
- Inbox: ${data.inboxCount} items waiting to be processed
- Backlog: ${data.backlogCount} actionable items
- Someday/Maybe: ${data.somedayCount} items
- Waiting For: ${data.waitingCount} items
- Overdue: ${data.overdueCount} items
- Completed this week: ${data.completedThisWeek} items
- Current streak: ${data.streakCount} days

TOP ITEMS BY AGE:
${data.topItems.map(item => `- "${item.title}" (${item.destination}, ${item.age_days} days old)`).join('\n')}

Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')}.

Generate a personalized, encouraging weekly review summary. Reference the actual numbers. Be concise but personal.

Respond with JSON only:
{
  "greeting": "personalized greeting acknowledging their week",
  "highlights": ["positive observation 1", "positive observation 2", ...],
  "concerns": ["concern or area to address 1", ...],
  "suggestion": "one specific actionable suggestion for next week"
}`;

export const CLUSTER_ITEMS_PROMPT = (
  items: { id: string; title: string; notes?: string; destination?: string }[]
) => `You are a productivity assistant. Analyze these items and identify thematic clusters that could become projects.

ITEMS:
${items.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}"${item.notes ? ` - ${item.notes}` : ''}${item.destination ? ` (${item.destination})` : ''}`).join('\n')}

Identify groups of 3 or more related items that share a common theme and could be organized into a project. Only include high-confidence groupings.

Respond with JSON only:
{
  "clusters": [
    {
      "theme": "description of the common theme",
      "item_ids": ["id1", "id2", "id3"],
      "suggested_project_name": "concise project name",
      "reasoning": "why these items belong together"
    },
    ...
  ]
}

Return an empty clusters array if no meaningful groupings are found.`;

export const SUGGEST_PROMOTIONS_PROMPT = (
  somedayItems: { id: string; title: string; notes?: string; created_at: string; maturity?: string }[],
  recentActivity: string[]
) => `You are a productivity assistant. Review these someday/incubating items and suggest which ones are ready to be promoted to the backlog for active work.

SOMEDAY/INCUBATING ITEMS:
${somedayItems.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}"${item.notes ? ` - ${item.notes}` : ''} (created: ${item.created_at}${item.maturity ? `, maturity: ${item.maturity}` : ''})`).join('\n')}

RECENT ACTIVITY (for context on what the user is currently focused on):
${recentActivity.length > 0 ? recentActivity.map(a => `- ${a}`).join('\n') : '- No recent activity available'}

Today is ${format(new Date(), 'yyyy-MM-dd')}.

Consider:
- How long the item has been incubating
- Its maturity level
- Whether it relates to recent activity and current focus
- Whether it seems actionable now

Respond with JSON only:
{
  "promotions": [
    {
      "item_id": "id",
      "confidence": 0.0-1.0,
      "reasoning": "why this item is ready for promotion"
    },
    ...
  ]
}

Only include items you are reasonably confident should be promoted. Empty array if none are ready.`;

export const DRAFT_PAGE_PROMPT = (
  title: string,
  notes?: string,
  subtasks?: string[],
  destinationSlug?: string
) => `You are a writing assistant helping create a well-structured document page for a productivity app.

ITEM DETAILS:
Title: ${title}
${notes ? `Notes: ${notes}` : ''}
${subtasks && subtasks.length > 0 ? `\nSubtasks:\n${subtasks.map(s => `- ${s}`).join('\n')}` : ''}
${destinationSlug ? `Context: This item is in the "${destinationSlug}" destination.` : ''}

Draft a comprehensive, well-structured page based on this information. The document should:
- Start with a clear overview/purpose section
- Include relevant headings and subheadings
- Use bullet points for lists and action items
- Have an "Action Items" or "Next Steps" section
- Be practical and actionable
- Be between 800-1500 words

Write the document in plain text with markdown formatting (headings with #, bullets with -, bold with **). Do not include any meta-commentary or explanation — just the document content.`;

export const STALE_ITEMS_PROMPT = (
  items: { id: string; title: string; destination: string; age_days: number; has_subtasks: boolean }[]
) => `You are a productivity assistant. Review these items and identify which ones have gone stale and need attention.

ITEMS:
${items.map((item, i) => `${i + 1}. [ID: ${item.id}] "${item.title}" (${item.destination}, ${item.age_days} days old, ${item.has_subtasks ? 'has subtasks' : 'no subtasks'})`).join('\n')}

Today is ${format(new Date(), 'yyyy-MM-dd')}.

For each stale item, suggest an action:
- "archive": Item is no longer relevant, archive it
- "schedule": Item is still valid, needs a specific date to get done
- "promote": Item should be moved to a more active destination
- "complete": Item is likely already done, mark it complete

Respond with JSON only:
{
  "stale": [
    {
      "item_id": "id",
      "action": "archive" | "schedule" | "promote" | "complete",
      "confidence": 0.0-1.0,
      "reasoning": "why this action is recommended"
    },
    ...
  ]
}

Only include items that genuinely seem stale. Empty array if all items seem fine.`;
