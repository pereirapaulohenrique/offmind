import { z } from 'zod';

// --- Shared ---

const uuid = z.string().uuid();
const optionalUuid = z.string().uuid().optional().nullable();

// --- Capture ---

export const captureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must not exceed 500 characters'),
  notes: z.string().max(5000, 'Notes must not exceed 5000 characters').optional().nullable(),
  source: z.string().optional().nullable(),
  project_id: optionalUuid,
  space_id: optionalUuid,
  page_id: optionalUuid,
});

export const extensionCaptureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  notes: z.string().max(5000).optional().nullable(),
  source: z.enum(['desktop', 'extension']).optional().nullable(),
  project_id: optionalUuid,
  space_id: optionalUuid,
  page_id: optionalUuid,
});

// --- AI Routes ---

export const brainstormSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
});

export const bulkProcessSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    notes: z.string().optional().nullable(),
    destination_id: z.string().optional().nullable(),
    layer: z.string().optional().nullable(),
  })).min(1, 'Items array must not be empty'),
  action: z.enum(['categorize', 'merge', 'cleanup', 'improve', 'schedule']),
  destinations: z.array(z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
  })).optional().nullable(),
}).refine(
  (data) => data.action !== 'categorize' || (data.destinations && data.destinations.length > 0),
  { message: 'Destinations are required for categorize action', path: ['destinations'] }
);

export const clusterItemsSchema = z.object({
  items: z.array(z.any()).min(1, 'Items array must not be empty'),
});

export const draftPageSchema = z.object({
  itemId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  notes: z.any().optional(),
  subtasks: z.any().optional(),
  destinationSlug: z.string().optional(),
});

export const enhanceWritingSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  action: z.enum(['continue', 'improve', 'summarize', 'outline', 'expand']),
});

export const expandNotesSchema = z.object({
  notes: z.string().min(1, 'Notes are required'),
  title: z.string().optional(),
});

export const extractDateSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

export const generateTitleSchema = z.object({
  itemId: z.string().optional(),
  text: z.string().min(1, 'Text is required'),
});

export const reviewSummarySchema = z.object({
  inboxCount: z.number().optional().default(0),
  backlogCount: z.number().optional().default(0),
  somedayCount: z.number().optional().default(0),
  waitingCount: z.number().optional().default(0),
  overdueCount: z.number().optional().default(0),
  completedThisWeek: z.number().optional().default(0),
  streakCount: z.number().optional().default(0),
  topItems: z.array(z.any()).optional().default([]),
});

export const smartCaptureSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

export const staleItemsSchema = z.object({
  items: z.array(z.any()).min(1, 'Items array must not be empty'),
});

export const suggestDestinationSchema = z.object({
  itemId: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional().nullable(),
});

export const suggestPromotionsSchema = z.object({
  somedayItems: z.array(z.any()).min(1, 'Someday items must not be empty'),
  recentActivity: z.array(z.any()).optional(),
});

export const suggestSubtasksSchema = z.object({
  itemId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  notes: z.any().optional(),
  existingSubtasks: z.array(z.any()).optional(),
});

// --- Stripe ---

export const createCheckoutSchema = z.object({
  plan: z.string().min(1, 'Plan is required'),
});

// --- Telegram ---

export const telegramWebhookSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      first_name: z.string().optional(),
      username: z.string().optional(),
    }).passthrough(),
    chat: z.object({
      id: z.number(),
    }).passthrough(),
    text: z.string().optional(),
    date: z.number(),
  }).passthrough().optional(),
}).passthrough();

// --- Waitlist ---

export const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
});
