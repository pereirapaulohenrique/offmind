import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to OffMind
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mb-10 text-sm text-muted-foreground">Last updated: February 20, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:space-y-1 [&_li]:leading-relaxed">

          <section>
            <h2>1. Introduction</h2>
            <p>
              OffMind (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a productivity application operated by Paulo Pereira as a sole proprietorship. This Privacy Policy explains how we collect, use, and protect your personal information when you use OffMind at offmind.ai and related services.
            </p>
            <p>
              By using OffMind, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2>2. Data We Collect</h2>
            <h3>Account Information</h3>
            <ul>
              <li>Email address (required for account creation)</li>
              <li>Full name (optional, if provided)</li>
              <li>Authentication tokens managed by Supabase Auth</li>
            </ul>

            <h3>Content You Create</h3>
            <ul>
              <li>Items (tasks, thoughts, notes) you capture</li>
              <li>Pages and documents you write</li>
              <li>Projects, spaces, and organizational structures</li>
              <li>File attachments (images, audio recordings)</li>
              <li>Custom fields and metadata</li>
            </ul>

            <h3>Usage Data</h3>
            <ul>
              <li>Feature usage patterns (anonymized)</li>
              <li>Error reports for debugging</li>
              <li>AI feature usage logs (prompts and responses, for cost tracking)</li>
            </ul>

            <h3>Payment Information</h3>
            <ul>
              <li>Stripe processes all payments. We store your Stripe customer ID and subscription status but never see or store your credit card details.</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To provide and maintain the OffMind service</li>
              <li>To process your content with AI features (destination suggestions, title generation, smart capture, etc.)</li>
              <li>To send transactional emails (account verification, subscription receipts)</li>
              <li>To monitor and fix errors in the application</li>
              <li>To improve the service based on anonymized usage patterns</li>
            </ul>
          </section>

          <section>
            <h2>4. AI Processing</h2>
            <p>
              When you use AI-powered features, your content (item titles, notes, and related context) is sent to third-party AI providers through OpenRouter for processing. Specifically:
            </p>
            <ul>
              <li>We use Anthropic&apos;s Claude models (via OpenRouter) for AI features</li>
              <li>Only the specific content relevant to each AI action is sent</li>
              <li>AI providers do not use your data to train their models</li>
              <li>We log AI usage (action type, estimated token counts, cost) for billing and monitoring purposes</li>
            </ul>
          </section>

          <section>
            <h2>5. Third-Party Services</h2>
            <p>We use the following third-party services to operate OffMind:</p>
            <ul>
              <li><strong>Supabase</strong> - Database, authentication, and file storage. Your data is stored in Supabase-managed PostgreSQL databases.</li>
              <li><strong>Vercel</strong> - Application hosting and deployment.</li>
              <li><strong>Stripe</strong> - Payment processing. Stripe&apos;s privacy policy applies to payment data.</li>
              <li><strong>OpenRouter / Anthropic</strong> - AI processing for smart features.</li>
              <li><strong>Resend</strong> - Transactional email delivery.</li>
              <li><strong>Sentry</strong> - Error monitoring and performance tracking.</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <ul>
              <li>Your account data and content are retained as long as your account is active.</li>
              <li>Soft-deleted items are retained for 30 days before permanent deletion.</li>
              <li>AI usage logs are retained for billing reconciliation.</li>
              <li>If you delete your account, all associated data is permanently removed.</li>
            </ul>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> - Export all your data at any time from Settings.</li>
              <li><strong>Rectification</strong> - Edit or correct your data within the application.</li>
              <li><strong>Deletion</strong> - Delete your account and all associated data from Settings.</li>
              <li><strong>Portability</strong> - Download your data in a standard format (JSON).</li>
              <li><strong>Object</strong> - Contact us to opt out of specific data processing.</li>
            </ul>
          </section>

          <section>
            <h2>8. LGPD Compliance (Brazil)</h2>
            <p>
              If you are located in Brazil, you have additional rights under the Lei Geral de Prote&ccedil;&atilde;o de Dados (LGPD), including the right to information about data sharing with third parties, the right to anonymization, and the right to revoke consent. To exercise these rights, contact us at the email below.
            </p>
          </section>

          <section>
            <h2>9. GDPR Compliance (European Union)</h2>
            <p>
              If you are located in the European Economic Area, your data processing is based on legitimate interest (providing the service you signed up for) and consent (for AI features and analytics). You may withdraw consent at any time without affecting the lawfulness of prior processing.
            </p>
          </section>

          <section>
            <h2>10. Security</h2>
            <ul>
              <li>All data is transmitted over HTTPS/TLS.</li>
              <li>File attachments are stored in private storage buckets with signed URLs.</li>
              <li>Database access is controlled by Row Level Security (RLS) policies.</li>
              <li>API routes are protected by authentication and rate limiting.</li>
            </ul>
          </section>

          <section>
            <h2>11. Cookies</h2>
            <p>
              OffMind uses essential cookies for authentication session management. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2>12. Children&apos;s Privacy</h2>
            <p>
              OffMind is not intended for children under 16. We do not knowingly collect data from children under 16.
            </p>
          </section>

          <section>
            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2>14. Contact</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p>
              <strong>Email:</strong> hello@getoffmind.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
