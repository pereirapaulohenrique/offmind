export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          settings: Json;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          settings?: Json;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          settings?: Json;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          plan: string;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          plan?: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          plan?: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      destinations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          is_default: boolean;
          is_system: boolean;
          sort_order: number;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          icon?: string;
          color?: string;
          is_default?: boolean;
          is_system?: boolean;
          sort_order?: number;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          color?: string;
          is_default?: boolean;
          is_system?: boolean;
          sort_order?: number;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      spaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          space_id: string | null;
          name: string;
          description: string | null;
          icon: string;
          color: string;
          status: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          name: string;
          description?: string | null;
          icon?: string;
          color?: string;
          status?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          space_id?: string | null;
          name?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          status?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          layer: string;
          destination_id: string | null;
          scheduled_at: string | null;
          duration_minutes: number | null;
          is_all_day: boolean;
          space_id: string | null;
          project_id: string | null;
          custom_values: Json;
          waiting_for: string | null;
          waiting_since: string | null;
          is_completed: boolean;
          completed_at: string | null;
          source: string;
          sort_order: number;
          attachments: Json;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          layer?: string;
          destination_id?: string | null;
          scheduled_at?: string | null;
          duration_minutes?: number | null;
          is_all_day?: boolean;
          space_id?: string | null;
          project_id?: string | null;
          custom_values?: Json;
          waiting_for?: string | null;
          waiting_since?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          source?: string;
          sort_order?: number;
          attachments?: Json;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          notes?: string | null;
          layer?: string;
          destination_id?: string | null;
          scheduled_at?: string | null;
          duration_minutes?: number | null;
          is_all_day?: boolean;
          space_id?: string | null;
          project_id?: string | null;
          custom_values?: Json;
          waiting_for?: string | null;
          waiting_since?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          source?: string;
          sort_order?: number;
          attachments?: Json;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: Json;
          space_id: string | null;
          project_id: string | null;
          item_id: string | null;
          icon: string;
          cover_image: string | null;
          is_favorite: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: Json;
          space_id?: string | null;
          project_id?: string | null;
          item_id?: string | null;
          icon?: string;
          cover_image?: string | null;
          is_favorite?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: Json;
          space_id?: string | null;
          project_id?: string | null;
          item_id?: string | null;
          icon?: string;
          cover_image?: string | null;
          is_favorite?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_logs: {
        Row: {
          id: string;
          user_id: string;
          item_id: string | null;
          action: string;
          model: string;
          input_tokens: number | null;
          output_tokens: number | null;
          cost_usd: number | null;
          request: Json | null;
          response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id?: string | null;
          action: string;
          model: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          cost_usd?: number | null;
          request?: Json | null;
          response?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string | null;
          action?: string;
          model?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          cost_usd?: number | null;
          request?: Json | null;
          response?: Json | null;
          created_at?: string;
        };
      };
      telegram_connections: {
        Row: {
          id: string;
          user_id: string;
          telegram_user_id: number;
          telegram_username: string | null;
          telegram_first_name: string | null;
          is_active: boolean;
          connected_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          telegram_user_id: number;
          telegram_username?: string | null;
          telegram_first_name?: string | null;
          is_active?: boolean;
          connected_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          telegram_user_id?: number;
          telegram_username?: string | null;
          telegram_first_name?: string | null;
          is_active?: boolean;
          connected_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience type aliases
export type Profile = Tables<'profiles'>;
export type Subscription = Tables<'subscriptions'>;
export type Destination = Tables<'destinations'>;
export type Space = Tables<'spaces'>;
export type Project = Tables<'projects'>;
export type Item = Tables<'items'>;
export type Page = Tables<'pages'>;
export type AILog = Tables<'ai_logs'>;
export type TelegramConnection = Tables<'telegram_connections'>;
export type Contact = Tables<'contacts'>;

// Attachment type for items
export interface Attachment {
  id: string;
  type: 'image' | 'audio';
  url: string;
  filename: string;
  size: number;
  duration?: number; // seconds, for audio
  created_at: string;
}
