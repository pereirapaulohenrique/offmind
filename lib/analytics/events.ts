import { posthog } from './posthog';

// Typed event tracking functions for key product events

export function trackSignup(method: 'email' | 'google' | 'github') {
  posthog.capture('signup', { method });
}

export function trackOnboardingCompleted(destinationsCount: number) {
  posthog.capture('onboarding_completed', { destinations_count: destinationsCount });
}

export function trackFirstCapture(source: string) {
  posthog.capture('first_capture', { source });
}

export function trackItemCaptured(source: string, hasAttachments: boolean) {
  posthog.capture('item_captured', { source, has_attachments: hasAttachments });
}

export function trackItemProcessed(destinationSlug: string) {
  posthog.capture('item_processed', { destination_slug: destinationSlug });
}

export function trackItemScheduled(isAllDay: boolean) {
  posthog.capture('item_scheduled', { is_all_day: isAllDay });
}

export function trackSubscriptionStarted(plan: string) {
  posthog.capture('subscription_started', { plan });
}

export function trackAIFeatureUsed(action: string) {
  posthog.capture('ai_feature_used', { action });
}

export function trackPageCreated() {
  posthog.capture('page_created');
}

export function trackProjectCreated() {
  posthog.capture('project_created');
}

export function trackSearchUsed(hasResults: boolean) {
  posthog.capture('search_used', { has_results: hasResults });
}
