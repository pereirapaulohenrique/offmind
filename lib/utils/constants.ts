// App Constants
export const APP_NAME = 'MindBase';
export const APP_DESCRIPTION = 'The calm productivity system for overthinkers';

// Layers
export const LAYERS = {
  CAPTURE: 'capture',
  PROCESS: 'process',
  COMMIT: 'commit',
} as const;

export type Layer = (typeof LAYERS)[keyof typeof LAYERS];

// Default Destinations
export const DEFAULT_DESTINATIONS = [
  { slug: 'backlog', name: 'Backlog', icon: '📋', color: 'blue' },
  { slug: 'reference', name: 'Reference', icon: '📚', color: 'purple' },
  { slug: 'incubating', name: 'Incubating', icon: '💡', color: 'yellow' },
  { slug: 'someday', name: 'Someday', icon: '🌙', color: 'gray' },
  { slug: 'questions', name: 'Questions', icon: '❓', color: 'pink' },
  { slug: 'waiting', name: 'Waiting', icon: '⏳', color: 'orange' },
  { slug: 'trash', name: 'Trash', icon: '🗑️', color: 'red' },
] as const;

// Subscription Plans
export const PLANS = {
  trial: {
    name: 'Trial',
    days: 14,
    priceId: null,
  },
  monthly: {
    name: 'Monthly',
    price: 7,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    interval: 'month' as const,
  },
  annual: {
    name: 'Annual',
    price: 59,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || '',
    interval: 'year' as const,
  },
  lifetime: {
    name: 'Lifetime',
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || '',
    type: 'one_time' as const,
  },
} as const;

// Keyboard Shortcuts
export const SHORTCUTS = {
  commandPalette: 'mod+k',
  newItem: 'mod+n',
  newPage: 'mod+shift+n',
  toggleSidebar: 'mod+\\',
  goToCapture: 'mod+1',
  goToProcess: 'mod+2',
  goToCommit: 'mod+3',
  openSettings: 'mod+,',
  escape: 'escape',
} as const;

// Item Sources
export const ITEM_SOURCES = {
  WEB: 'web',
  TELEGRAM: 'telegram',
  EXTENSION: 'extension',
  API: 'api',
} as const;

export type ItemSource = (typeof ITEM_SOURCES)[keyof typeof ITEM_SOURCES];

// Field Types for Custom Fields
export const FIELD_TYPES = {
  TEXT: 'text',
  LONGTEXT: 'longtext',
  NUMBER: 'number',
  DATE: 'date',
  DROPDOWN: 'dropdown',
  MULTISELECT: 'multiselect',
  CHECKBOX: 'checkbox',
  URL: 'url',
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];
