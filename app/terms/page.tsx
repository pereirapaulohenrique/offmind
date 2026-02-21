import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to OffMind
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mb-10 text-sm text-muted-foreground">Last updated: February 20, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:space-y-1 [&_li]:leading-relaxed">

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using OffMind (&quot;the Service&quot;), provided by Paulo Pereira (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              OffMind is a productivity application that helps users capture, organize, and act on their thoughts and tasks. The Service includes a web application, browser extension, desktop application, Telegram bot integration, and AI-powered features.
            </p>
          </section>

          <section>
            <h2>3. Account Registration</h2>
            <ul>
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
              <li>One person or entity per account. Account sharing is not permitted.</li>
            </ul>
          </section>

          <section>
            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or to store illegal content.</li>
              <li>Attempt to gain unauthorized access to the Service or its systems.</li>
              <li>Interfere with or disrupt the Service&apos;s infrastructure.</li>
              <li>Use automated tools to scrape, crawl, or abuse the Service.</li>
              <li>Circumvent rate limits or other protective measures.</li>
              <li>Resell, sublicense, or redistribute the Service without authorization.</li>
            </ul>
          </section>

          <section>
            <h2>5. Intellectual Property</h2>
            <h3>Your Content</h3>
            <p>
              You retain full ownership of all content you create, upload, or store in OffMind. We do not claim any intellectual property rights over your content. You grant us a limited license to store, process, and display your content solely for the purpose of providing the Service.
            </p>

            <h3>Our Service</h3>
            <p>
              The OffMind application, its design, code, and branding are our intellectual property. These Terms do not grant you any right to use our trademarks, logos, or other brand features.
            </p>
          </section>

          <section>
            <h2>6. AI Features</h2>
            <ul>
              <li>AI features process your content to provide suggestions, summaries, and organizational assistance.</li>
              <li>AI outputs are provided as suggestions and should not be relied upon as authoritative.</li>
              <li>You retain ownership of content generated with AI assistance.</li>
              <li>AI processing is subject to rate limits (30 requests per minute for AI features).</li>
            </ul>
          </section>

          <section>
            <h2>7. Subscriptions and Payments</h2>
            <h3>Free Tier</h3>
            <p>
              OffMind offers a free trial period. Feature availability may be limited on the free tier.
            </p>

            <h3>Paid Plans</h3>
            <ul>
              <li>Paid subscriptions are billed through Stripe.</li>
              <li>Monthly subscriptions renew automatically unless canceled.</li>
              <li>Lifetime plans are a one-time payment with no recurring charges.</li>
              <li>You can manage your subscription from the Settings page.</li>
            </ul>

            <h3>Refunds</h3>
            <ul>
              <li>Monthly subscriptions: You may cancel at any time. No refunds for partial months.</li>
              <li>Lifetime plans: Refunds are available within 14 days of purchase if you have not extensively used the Service.</li>
            </ul>
          </section>

          <section>
            <h2>8. Service Availability</h2>
            <ul>
              <li>We aim to maintain high availability but do not guarantee uninterrupted service.</li>
              <li>We may perform maintenance that temporarily affects availability.</li>
              <li>We reserve the right to modify, suspend, or discontinue features with reasonable notice.</li>
            </ul>
          </section>

          <section>
            <h2>9. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-foreground/80">Privacy Policy</Link>, which describes how we collect, use, and protect your data.
            </p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law:
            </p>
            <ul>
              <li>The Service is provided &quot;as is&quot; without warranties of any kind, express or implied.</li>
              <li>We are not liable for any indirect, incidental, special, or consequential damages.</li>
              <li>Our total liability for any claim related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim.</li>
              <li>We are not responsible for data loss. You are encouraged to export your data regularly.</li>
            </ul>
          </section>

          <section>
            <h2>11. Account Termination</h2>
            <ul>
              <li>You may delete your account at any time from Settings.</li>
              <li>We may suspend or terminate your account for violations of these Terms.</li>
              <li>Upon account deletion, all your data will be permanently removed.</li>
              <li>We recommend exporting your data before deleting your account.</li>
            </ul>
          </section>

          <section>
            <h2>12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance. For significant changes, we will notify you via email or in-app notification.
            </p>
          </section>

          <section>
            <h2>13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Brazil. Any disputes shall be resolved in the courts of the State of S&atilde;o Paulo, Brazil.
            </p>
          </section>

          <section>
            <h2>14. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
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
