import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

function getPostHogClient(): PostHog | null {
  if (client) return client;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) return null;

  client = new PostHog(key, { host });
  return client;
}

export function trackServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const ph = getPostHogClient();
  if (!ph) return;

  ph.capture({
    distinctId: userId,
    event,
    properties,
  });
}

export async function shutdownPostHog() {
  if (client) {
    await client.shutdown();
    client = null;
  }
}
