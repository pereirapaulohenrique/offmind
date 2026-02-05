// Re-export all types
export * from './database';

// Custom Field Definition
export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'longtext' | 'number' | 'date' | 'dropdown' | 'multiselect' | 'checkbox' | 'url';
  options?: string[]; // for dropdown/multiselect
  required?: boolean;
  default?: string | number | boolean;
}

// AI Response types
export interface AISuggestionResponse {
  destination: string;
  confidence: number;
  reasoning: string;
}

export interface AIDateExtractionResponse {
  has_date: boolean;
  date: string | null;
  time: string | null;
  is_all_day: boolean;
  cleaned_text: string;
}

export interface AIExpandResponse {
  expanded_notes: string;
}

// Subscription status
export interface SubscriptionStatus {
  active: boolean;
  type: 'trial' | 'monthly' | 'annual' | 'lifetime' | 'expired_trial' | string;
  daysRemaining?: number;
}

// View types
export type ViewType = 'list' | 'kanban' | 'table';

// Filter types
export interface ItemFilters {
  destinationId?: string;
  spaceId?: string;
  projectId?: string;
  layer?: string;
  search?: string;
  isCompleted?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Sort types
export interface ItemSort {
  field: 'created_at' | 'updated_at' | 'title' | 'scheduled_at' | 'sort_order';
  direction: 'asc' | 'desc';
}
