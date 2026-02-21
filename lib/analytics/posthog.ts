import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) return;

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: false, // We capture manually in the provider
    capture_pageleave: true,
  });

  initialized = true;
}

export { posthog };
