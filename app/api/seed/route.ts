import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Seed API Route — Populates a test user's account with realistic mock data
// POST /api/seed?clean=true  (clean=true wipes existing data first)
// ============================================================================

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function hoursFromNow(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

/** Returns an ISO string for today at a specific hour (24h format) offset by `dayOffset` days. */
function atHour(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// TipTap JSON helpers
// ---------------------------------------------------------------------------
function tiptapDoc(...content: Record<string, unknown>[]): Record<string, unknown> {
  return { type: 'doc', content };
}

function h1(text: string): Record<string, unknown> {
  return { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text }] };
}

function h2(text: string): Record<string, unknown> {
  return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] };
}

function h3(text: string): Record<string, unknown> {
  return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text }] };
}

function p(text: string): Record<string, unknown> {
  return { type: 'paragraph', content: [{ type: 'text', text }] };
}

function bulletList(items: string[]): Record<string, unknown> {
  return {
    type: 'bulletList',
    content: items.map((text) => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    })),
  };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // -- Authenticate --
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized — you must be logged in.' }, { status: 401 });
    }

    // -- Optional: clean existing data --
    const url = new URL(request.url);
    const clean = url.searchParams.get('clean') === 'true';

    if (clean) {
      // Delete in reverse FK order to avoid constraint violations
      await supabase.from('item_relations').delete().eq('user_id', user.id);
      await supabase.from('subtasks').delete().eq('user_id', user.id);
      await supabase.from('pages').delete().eq('user_id', user.id);
      await supabase.from('items').delete().eq('user_id', user.id);
      await supabase.from('projects').delete().eq('user_id', user.id);
      await supabase.from('spaces').delete().eq('user_id', user.id);
      await supabase.from('contacts').delete().eq('user_id', user.id);
    }

    // ====================================================================
    // 1. CONTACTS (5)
    // ====================================================================
    const { data: contacts, error: contactsErr } = await supabase
      .from('contacts')
      .insert([
        { user_id: user.id, name: 'Sarah Chen', email: 'sarah@company.com', notes: 'Design lead at our agency' },
        { user_id: user.id, name: 'Marcus Rivera', email: 'marcus@client.co', notes: 'Client project manager' },
        { user_id: user.id, name: 'Alex Thompson', email: 'alex@startup.io', notes: 'Co-founder, potential partner' },
        { user_id: user.id, name: 'Jamie Lee', email: 'jamie@freelance.dev', notes: 'Freelance developer' },
        { user_id: user.id, name: 'Priya Patel', email: 'priya@venture.capital', notes: 'VC contact from networking event' },
      ])
      .select();

    if (contactsErr) {
      throw new Error(`Failed to create contacts: ${contactsErr.message}`);
    }

    // Build a name->id map for contacts
    const contactMap: Record<string, string> = {};
    for (const c of contacts || []) {
      contactMap[c.name] = c.id;
    }

    // ====================================================================
    // 2. SPACES (3)
    // ====================================================================
    const { data: spaces, error: spacesErr } = await supabase
      .from('spaces')
      .insert([
        { user_id: user.id, name: 'Work', icon: 'Briefcase', color: '#6366f1', sort_order: 0 },
        { user_id: user.id, name: 'Personal', icon: 'Home', color: '#22c55e', sort_order: 1 },
        { user_id: user.id, name: 'Side Project', icon: 'Rocket', color: '#f59e0b', sort_order: 2 },
      ])
      .select();

    if (spacesErr) {
      throw new Error(`Failed to create spaces: ${spacesErr.message}`);
    }

    // Build a name->id map for spaces
    const spaceMap: Record<string, string> = {};
    for (const s of spaces || []) {
      spaceMap[s.name] = s.id;
    }

    // ====================================================================
    // 3. PROJECTS (5) — linked to spaces
    // ====================================================================
    const { data: projects, error: projectsErr } = await supabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          space_id: spaceMap['Work'],
          name: 'Website Redesign',
          description: 'Complete overhaul of company website',
          status: 'active',
          icon: 'Globe',
          color: '#3b82f6',
          sort_order: 0,
        },
        {
          user_id: user.id,
          space_id: spaceMap['Work'],
          name: 'Q1 Marketing Campaign',
          description: 'Launch multi-channel campaign',
          status: 'active',
          icon: 'Megaphone',
          color: '#ec4899',
          sort_order: 1,
        },
        {
          user_id: user.id,
          space_id: spaceMap['Personal'],
          name: 'Home Renovation',
          description: 'Kitchen and bathroom updates',
          status: 'active',
          icon: 'Hammer',
          color: '#f97316',
          sort_order: 2,
        },
        {
          user_id: user.id,
          space_id: spaceMap['Side Project'],
          name: 'OffMind Mobile App',
          description: 'React Native mobile companion',
          status: 'active',
          icon: 'Smartphone',
          color: '#8b5cf6',
          sort_order: 3,
        },
        {
          user_id: user.id,
          space_id: spaceMap['Personal'],
          name: 'Investment Research',
          description: 'Portfolio diversification analysis',
          status: 'active',
          icon: 'TrendingUp',
          color: '#10b981',
          sort_order: 4,
        },
      ])
      .select();

    if (projectsErr) {
      throw new Error(`Failed to create projects: ${projectsErr.message}`);
    }

    // Build a name->id map for projects
    const projMap: Record<string, string> = {};
    for (const pr of projects || []) {
      projMap[pr.name] = pr.id;
    }

    // ====================================================================
    // 4. DESTINATIONS — fetch user's existing destinations (created at onboarding)
    // ====================================================================
    const { data: destinations } = await supabase
      .from('destinations')
      .select('*')
      .eq('user_id', user.id);

    const destMap: Record<string, string> = {};
    for (const d of destinations || []) {
      destMap[d.slug] = d.id;
    }

    // Validate that critical destinations exist
    const requiredDests = ['backlog', 'waiting', 'someday', 'incubating', 'reference', 'questions'];
    const missingDests = requiredDests.filter((slug) => !destMap[slug]);
    if (missingDests.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required destinations: ${missingDests.join(', ')}. Complete onboarding first.`,
        },
        { status: 400 }
      );
    }

    // ====================================================================
    // 5. ITEMS — across ALL destinations
    // ====================================================================

    // We collect all items in groups so we can reference IDs later for subtasks, pages, relations.
    // Each insert returns the created rows with their auto-generated IDs.

    // ---- 5a. INBOX items (layer: 'capture', no destination) ----
    const { data: inboxItems, error: inboxErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Research GraphQL vs REST for new API',
          notes: 'Need to decide before sprint planning next week',
          layer: 'capture',
          source: 'web',
          created_at: hoursAgo(2),
        },
        {
          user_id: user.id,
          title: 'Book team offsite venue',
          notes: 'Check Airbnb and boutique hotels. Budget ~$5000 for 3 days',
          layer: 'capture',
          source: 'web',
          created_at: daysAgo(1),
        },
        {
          user_id: user.id,
          title: 'Listen to Tim Ferriss podcast ep 682',
          layer: 'capture',
          source: 'web',
          created_at: hoursAgo(3),
        },
        {
          user_id: user.id,
          title: 'Buy birthday gift for Mom',
          notes: 'She mentioned wanting a new Kindle',
          layer: 'capture',
          source: 'web',
          created_at: hoursAgo(5),
        },
        {
          user_id: user.id,
          title: 'Review insurance renewal documents',
          layer: 'capture',
          source: 'web',
          created_at: daysAgo(1),
        },
      ])
      .select();

    if (inboxErr) {
      throw new Error(`Failed to create inbox items: ${inboxErr.message}`);
    }

    // ---- 5b. BACKLOG items (layer: 'process', destination: backlog) ----
    const { data: backlogItems, error: backlogErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Finalize homepage wireframes',
          notes: "Sarah's design needs my review and feedback",
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Work'],
          project_id: projMap['Website Redesign'],
          custom_values: { priority: 'High', effort: 'Medium (< 4h)' },
          source: 'web',
          created_at: daysAgo(5),
        },
        {
          user_id: user.id,
          title: 'Write blog post about AI in productivity',
          notes: 'Include real examples from OffMind development',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Side Project'],
          custom_values: { priority: 'Medium', effort: 'Large (> 4h)' },
          source: 'web',
          created_at: daysAgo(10),
        },
        {
          user_id: user.id,
          title: 'Set up CI/CD pipeline',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Side Project'],
          project_id: projMap['OffMind Mobile App'],
          custom_values: { priority: 'High', effort: 'Medium (< 4h)' },
          source: 'web',
          created_at: daysAgo(7),
        },
        {
          user_id: user.id,
          title: 'Prepare quarterly review slides',
          notes: 'Due Friday. Include Q4 metrics and Q1 projections',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Work'],
          custom_values: { priority: 'Urgent', effort: 'Small (< 1h)' },
          source: 'web',
          created_at: daysAgo(3),
        },
        {
          user_id: user.id,
          title: 'Research kitchen cabinet suppliers',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Personal'],
          project_id: projMap['Home Renovation'],
          custom_values: { priority: 'Low', effort: 'Small (< 1h)' },
          source: 'web',
          created_at: daysAgo(14),
        },
        {
          user_id: user.id,
          title: 'Update team documentation',
          notes: 'Onboarding docs and API documentation',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Work'],
          project_id: projMap['Website Redesign'],
          custom_values: { priority: 'Medium', effort: 'Medium (< 4h)' },
          source: 'web',
          created_at: daysAgo(20), // stale for AI detection
        },
        {
          user_id: user.id,
          title: 'Fix Stripe webhook error handling',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Side Project'],
          project_id: projMap['OffMind Mobile App'],
          custom_values: { priority: 'High', effort: 'Quick (< 15min)' },
          source: 'web',
          created_at: daysAgo(2),
        },
        {
          user_id: user.id,
          title: 'Order ergonomic keyboard',
          notes: 'Logitech MX Keys or Keychron Q1',
          layer: 'process',
          destination_id: destMap['backlog'],
          custom_values: { priority: 'Low', effort: 'Quick (< 15min)' },
          source: 'web',
          created_at: daysAgo(18), // stale
        },
      ])
      .select();

    if (backlogErr) {
      throw new Error(`Failed to create backlog items: ${backlogErr.message}`);
    }

    // Build title->id map from backlog items for subtasks / relations later
    const backlogMap: Record<string, string> = {};
    for (const item of backlogItems || []) {
      backlogMap[item.title] = item.id;
    }

    // ---- 5c. SCHEDULED items (layer: 'commit', has scheduled_at) ----
    const { data: scheduledItems, error: scheduledErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Team standup meeting',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: hoursFromNow(2),
          duration_minutes: 30,
          is_all_day: false,
          space_id: spaceMap['Work'],
          custom_values: { recurrence: 'weekdays' },
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Dentist appointment',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: atHour(1, 10, 0),
          duration_minutes: 60,
          is_all_day: false,
          space_id: spaceMap['Personal'],
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Sprint planning session',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: atHour(2, 14, 0),
          duration_minutes: 120,
          is_all_day: false,
          space_id: spaceMap['Work'],
          project_id: projMap['Website Redesign'],
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Call Alex about partnership',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: atHour(3, 11, 0),
          duration_minutes: 45,
          is_all_day: false,
          space_id: spaceMap['Side Project'],
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Gym workout',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: atHour(0, 18, 0),
          duration_minutes: 60,
          is_all_day: false,
          space_id: spaceMap['Personal'],
          custom_values: { recurrence: 'daily' },
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Weekly team sync',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: atHour(5, 15, 0),
          duration_minutes: 60,
          is_all_day: false,
          space_id: spaceMap['Work'],
          custom_values: { recurrence: 'weekly' },
          source: 'web',
        },
      ])
      .select();

    if (scheduledErr) {
      throw new Error(`Failed to create scheduled items: ${scheduledErr.message}`);
    }

    // ---- 5d. OVERDUE items (scheduled in the past, not completed) ----
    const { data: overdueItems, error: overdueErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Submit expense report',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: daysAgo(3),
          is_all_day: true,
          space_id: spaceMap['Work'],
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Reply to investor email',
          notes: 'Priya asked about traction metrics',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: atHour(-2, 9, 0),
          is_all_day: false,
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Review pull request #47',
          layer: 'commit',
          destination_id: destMap['backlog'],
          scheduled_at: atHour(-1, 16, 0),
          is_all_day: false,
          space_id: spaceMap['Side Project'],
          project_id: projMap['OffMind Mobile App'],
          source: 'web',
        },
      ])
      .select();

    if (overdueErr) {
      throw new Error(`Failed to create overdue items: ${overdueErr.message}`);
    }

    // ---- 5e. WAITING FOR items (layer: 'process', destination: waiting) ----
    const { data: waitingItems, error: waitingErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Design mockups from Sarah',
          notes: 'Homepage and about page designs',
          layer: 'process',
          destination_id: destMap['waiting'],
          space_id: spaceMap['Work'],
          project_id: projMap['Website Redesign'],
          waiting_for: 'Sarah Chen',
          waiting_since: daysAgo(5),
          custom_values: { follow_up_date: daysFromNow(2) },
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Contract review from legal',
          notes: 'NDA and service agreement',
          layer: 'process',
          destination_id: destMap['waiting'],
          waiting_for: 'Legal department',
          waiting_since: daysAgo(10),
          custom_values: { follow_up_date: daysAgo(1) }, // overdue follow-up
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'API pricing proposal from Marcus',
          layer: 'process',
          destination_id: destMap['waiting'],
          space_id: spaceMap['Work'],
          waiting_for: 'Marcus Rivera',
          waiting_since: daysAgo(3),
          custom_values: { follow_up_date: daysFromNow(4) },
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Feedback on pitch deck',
          notes: 'Sent deck last Tuesday, follow up needed',
          layer: 'process',
          destination_id: destMap['waiting'],
          space_id: spaceMap['Side Project'],
          waiting_for: 'Priya Patel',
          waiting_since: daysAgo(7),
          custom_values: { follow_up_date: daysAgo(1) }, // overdue follow-up
          source: 'web',
        },
      ])
      .select();

    if (waitingErr) {
      throw new Error(`Failed to create waiting items: ${waitingErr.message}`);
    }

    // ---- 5f. SOMEDAY/MAYBE items (layer: 'process', destination: someday) ----
    const { data: somedayItems, error: somedayErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Learn Rust programming',
          notes: 'Might be useful for performance-critical components',
          layer: 'process',
          destination_id: destMap['someday'],
          custom_values: { maturity: 'Raw Idea', revisit_date: daysFromNow(30) },
          source: 'web',
          created_at: daysAgo(45),
        },
        {
          user_id: user.id,
          title: 'Write a book about productivity for ADHD minds',
          notes: 'Have outline and 3 chapter drafts. Maybe ready to commit?',
          layer: 'process',
          destination_id: destMap['someday'],
          custom_values: { maturity: 'Developing', revisit_date: daysFromNow(14) },
          source: 'web',
          created_at: daysAgo(60),
        },
        {
          user_id: user.id,
          title: 'Take ceramics class',
          layer: 'process',
          destination_id: destMap['someday'],
          space_id: spaceMap['Personal'],
          custom_values: { maturity: 'Raw Idea' },
          source: 'web',
          created_at: daysAgo(30),
        },
        {
          user_id: user.id,
          title: 'Build Chrome extension for OffMind',
          notes: 'All specs ready, just need to find time',
          layer: 'process',
          destination_id: destMap['someday'],
          space_id: spaceMap['Side Project'],
          custom_values: { maturity: 'Ready to Act', revisit_date: daysFromNow(3) },
          source: 'web',
          created_at: daysAgo(20),
        },
        {
          user_id: user.id,
          title: 'Plan trip to Japan',
          notes: 'Cherry blossom season April. Research flights and Airbnb',
          layer: 'process',
          destination_id: destMap['someday'],
          space_id: spaceMap['Personal'],
          custom_values: { maturity: 'Developing', revisit_date: daysFromNow(60) },
          source: 'web',
          created_at: daysAgo(40),
        },
      ])
      .select();

    if (somedayErr) {
      throw new Error(`Failed to create someday items: ${somedayErr.message}`);
    }

    // Build title->id map for someday items (need for pages)
    const somedayMap: Record<string, string> = {};
    for (const item of somedayItems || []) {
      somedayMap[item.title] = item.id;
    }

    // ---- 5g. INCUBATING items (layer: 'process', destination: incubating) ----
    const { data: incubatingItems, error: incubatingErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'AI-powered meeting note taker',
          notes: 'Could use Whisper API + GPT for real-time transcription and action item extraction',
          layer: 'process',
          destination_id: destMap['incubating'],
          space_id: spaceMap['Side Project'],
          custom_values: { stage: 'Exploring' },
          source: 'web',
          created_at: daysAgo(25),
        },
        {
          user_id: user.id,
          title: 'Redesign team onboarding process',
          notes: 'Current process takes 2 weeks, should be 3 days. Draft plan ready.',
          layer: 'process',
          destination_id: destMap['incubating'],
          space_id: spaceMap['Work'],
          custom_values: { stage: 'Developing' },
          source: 'web',
          created_at: daysAgo(15),
        },
        {
          user_id: user.id,
          title: 'Personal finance dashboard',
          notes: 'Plaid API integration, track spending, investments, goals',
          layer: 'process',
          destination_id: destMap['incubating'],
          space_id: spaceMap['Personal'],
          custom_values: { stage: 'Seed' },
          source: 'web',
          created_at: daysAgo(35),
        },
      ])
      .select();

    if (incubatingErr) {
      throw new Error(`Failed to create incubating items: ${incubatingErr.message}`);
    }

    // Build title->id map for incubating items (need for relations)
    const incubatingMap: Record<string, string> = {};
    for (const item of incubatingItems || []) {
      incubatingMap[item.title] = item.id;
    }

    // ---- 5h. REFERENCE items (layer: 'process', destination: reference) ----
    const { data: referenceItems, error: referenceErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'GTD methodology notes',
          notes: 'Key principles: capture everything, clarify actionability, organize by context, review weekly, engage',
          layer: 'process',
          destination_id: destMap['reference'],
          custom_values: { source_url: 'https://gettingthingsdone.com', category: 'Productivity' },
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'React Server Components best practices',
          notes: "Always prefer server components. Use 'use client' only for interactivity.",
          layer: 'process',
          destination_id: destMap['reference'],
          custom_values: { source_url: 'https://react.dev/reference/rsc', category: 'Development' },
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Tax deductions checklist 2025',
          notes: 'Home office, software subscriptions, professional development, health insurance',
          layer: 'process',
          destination_id: destMap['reference'],
          custom_values: { category: 'Finance' },
          source: 'web',
        },
      ])
      .select();

    if (referenceErr) {
      throw new Error(`Failed to create reference items: ${referenceErr.message}`);
    }

    // ---- 5i. QUESTIONS items (layer: 'process', destination: questions) ----
    const { data: questionItems, error: questionsErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Should we migrate to Next.js 15 or wait?',
          notes: 'New router improvements look promising but breaking changes concern me',
          layer: 'process',
          destination_id: destMap['questions'],
          custom_values: { possible_answer: 'Wait for stable release, current app works fine on 14' },
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Best approach for real-time sync in mobile app?',
          notes: 'Options: Supabase Realtime, Firebase, custom WebSocket',
          layer: 'process',
          destination_id: destMap['questions'],
          space_id: spaceMap['Side Project'],
          project_id: projMap['OffMind Mobile App'],
          custom_values: { research_links: 'https://supabase.com/docs/guides/realtime' },
          source: 'web',
        },
      ])
      .select();

    if (questionsErr) {
      throw new Error(`Failed to create questions items: ${questionsErr.message}`);
    }

    // ---- 5j. COMPLETED items (is_completed: true, completed_at within last 7 days) ----
    const { data: completedItems, error: completedErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Deploy staging environment',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Side Project'],
          project_id: projMap['OffMind Mobile App'],
          is_completed: true,
          completed_at: daysAgo(1),
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Send weekly newsletter',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Work'],
          is_completed: true,
          completed_at: daysAgo(2),
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Buy groceries',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Personal'],
          is_completed: true,
          completed_at: hoursAgo(5),
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Review Sarah\'s design proposal',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Work'],
          project_id: projMap['Website Redesign'],
          is_completed: true,
          completed_at: daysAgo(3),
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Update Supabase to latest version',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Side Project'],
          is_completed: true,
          completed_at: daysAgo(4),
          source: 'web',
        },
      ])
      .select();

    if (completedErr) {
      throw new Error(`Failed to create completed items: ${completedErr.message}`);
    }

    // Build title->id map for completed items (need for relations)
    const completedMap: Record<string, string> = {};
    for (const item of completedItems || []) {
      completedMap[item.title] = item.id;
    }

    // ---- 5k. ARCHIVED items ----
    const { data: archivedItems, error: archivedErr } = await supabase
      .from('items')
      .insert([
        {
          user_id: user.id,
          title: 'Old marketing plan (deprecated)',
          layer: 'process',
          destination_id: destMap['backlog'],
          space_id: spaceMap['Work'],
          archived_at: daysAgo(10),
          source: 'web',
        },
        {
          user_id: user.id,
          title: 'Research competitor X',
          notes: 'No longer relevant, they pivoted',
          layer: 'process',
          destination_id: destMap['reference'],
          archived_at: daysAgo(7),
          source: 'web',
        },
      ])
      .select();

    if (archivedErr) {
      throw new Error(`Failed to create archived items: ${archivedErr.message}`);
    }

    // ====================================================================
    // Build a combined title->id map from waiting items (need for relations)
    // ====================================================================
    const waitingMap: Record<string, string> = {};
    for (const item of waitingItems || []) {
      waitingMap[item.title] = item.id;
    }

    // ====================================================================
    // 6. SUBTASKS
    // ====================================================================

    // -- Subtasks for "Finalize homepage wireframes" --
    const wireframesItemId = backlogMap['Finalize homepage wireframes'];

    const { data: wireframeSubtasks, error: wireframeSErr } = await supabase
      .from('subtasks')
      .insert([
        {
          item_id: wireframesItemId,
          user_id: user.id,
          title: "Review Sarah's initial mockup",
          is_completed: true,
          completed_at: daysAgo(3),
          sort_order: 0,
        },
        {
          item_id: wireframesItemId,
          user_id: user.id,
          title: 'Annotate feedback on Figma',
          is_completed: true,
          completed_at: daysAgo(2),
          sort_order: 1,
        },
        {
          item_id: wireframesItemId,
          user_id: user.id,
          title: 'Schedule review meeting',
          is_completed: false,
          sort_order: 2,
        },
        {
          item_id: wireframesItemId,
          user_id: user.id,
          title: 'Approve final version',
          is_completed: false,
          sort_order: 3,
        },
      ])
      .select();

    if (wireframeSErr) {
      throw new Error(`Failed to create wireframe subtasks: ${wireframeSErr.message}`);
    }

    // -- Subtasks for "Set up CI/CD pipeline" --
    const cicdItemId = backlogMap['Set up CI/CD pipeline'];

    const { data: cicdSubtasks, error: cicdSErr } = await supabase
      .from('subtasks')
      .insert([
        {
          item_id: cicdItemId,
          user_id: user.id,
          title: 'Choose CI provider (GitHub Actions vs CircleCI)',
          is_completed: true,
          completed_at: daysAgo(5),
          sort_order: 0,
        },
        {
          item_id: cicdItemId,
          user_id: user.id,
          title: 'Write build workflow YAML',
          is_completed: false,
          sort_order: 1,
        },
        {
          item_id: cicdItemId,
          user_id: user.id,
          title: 'Add test automation step',
          is_completed: false,
          sort_order: 2,
        },
        {
          item_id: cicdItemId,
          user_id: user.id,
          title: 'Configure deployment triggers',
          is_completed: false,
          sort_order: 3,
        },
        {
          item_id: cicdItemId,
          user_id: user.id,
          title: 'Set up staging environment',
          is_completed: true,
          completed_at: daysAgo(1),
          sort_order: 4,
        },
      ])
      .select();

    if (cicdSErr) {
      throw new Error(`Failed to create CI/CD subtasks: ${cicdSErr.message}`);
    }

    // -- Subtasks for "Prepare quarterly review slides" --
    const quarterlyItemId = backlogMap['Prepare quarterly review slides'];

    const { data: quarterlySubtasks, error: quarterlySErr } = await supabase
      .from('subtasks')
      .insert([
        {
          item_id: quarterlyItemId,
          user_id: user.id,
          title: 'Pull Q4 revenue data',
          is_completed: false,
          sort_order: 0,
        },
        {
          item_id: quarterlyItemId,
          user_id: user.id,
          title: 'Create visualization charts',
          is_completed: false,
          sort_order: 1,
        },
        {
          item_id: quarterlyItemId,
          user_id: user.id,
          title: 'Write executive summary',
          is_completed: false,
          sort_order: 2,
        },
        {
          item_id: quarterlyItemId,
          user_id: user.id,
          title: 'Get manager review',
          is_completed: false,
          sort_order: 3,
        },
      ])
      .select();

    if (quarterlySErr) {
      throw new Error(`Failed to create quarterly subtasks: ${quarterlySErr.message}`);
    }

    // -- Subtasks for "Research kitchen cabinet suppliers" --
    const kitchenItemId = backlogMap['Research kitchen cabinet suppliers'];

    const { data: kitchenSubtasks, error: kitchenSErr } = await supabase
      .from('subtasks')
      .insert([
        {
          item_id: kitchenItemId,
          user_id: user.id,
          title: 'Get 3 quotes from local suppliers',
          is_completed: false,
          sort_order: 0,
        },
        {
          item_id: kitchenItemId,
          user_id: user.id,
          title: 'Check IKEA kitchen planner',
          is_completed: true,
          completed_at: daysAgo(10),
          sort_order: 1,
        },
        {
          item_id: kitchenItemId,
          user_id: user.id,
          title: 'Visit Home Depot showroom',
          is_completed: false,
          sort_order: 2,
        },
      ])
      .select();

    if (kitchenSErr) {
      throw new Error(`Failed to create kitchen subtasks: ${kitchenSErr.message}`);
    }

    const totalSubtasks =
      (wireframeSubtasks?.length || 0) +
      (cicdSubtasks?.length || 0) +
      (quarterlySubtasks?.length || 0) +
      (kitchenSubtasks?.length || 0);

    // ====================================================================
    // 7. PAGES (3)
    // ====================================================================

    // -- Page 1: linked to "Finalize homepage wireframes" --
    const page1Content = tiptapDoc(
      h1('Homepage Redesign - Design Review Notes'),
      p("Review of Sarah's initial wireframe concepts for the new homepage."),
      h2('Key Decisions'),
      bulletList([
        'Hero section: Full-bleed gradient with product screenshot',
        'Navigation: Sticky top bar with floating CTA',
        'Social proof: Testimonial carousel below fold',
      ]),
      h2('Feedback'),
      p(
        'Overall direction is strong. Need to refine the color contrast for accessibility and ensure the mobile layout works at smaller breakpoints. The illustration style should match our brand guidelines — warm, organic, hand-drawn feel rather than generic tech vectors.'
      ),
      h2('Next Steps'),
      bulletList([
        'Finalize color palette',
        'Mobile responsive breakpoints',
        'A/B test hero copy',
      ])
    );

    const { data: page1, error: page1Err } = await supabase
      .from('pages')
      .insert({
        user_id: user.id,
        title: 'Homepage Wireframes - Design Review',
        content: page1Content,
        space_id: spaceMap['Work'],
        project_id: projMap['Website Redesign'],
        item_id: wireframesItemId,
        icon: 'FileText',
        sort_order: 0,
      })
      .select()
      .single();

    if (page1Err) {
      throw new Error(`Failed to create page 1: ${page1Err.message}`);
    }

    // -- Page 2: standalone in Side Project space --
    const page2Content = tiptapDoc(
      h1('OffMind Mobile App - Technical Architecture'),
      p(
        'This document outlines the technical architecture for the OffMind React Native mobile app, our companion to the web application.'
      ),
      h2('Stack'),
      bulletList([
        'React Native with Expo (managed workflow)',
        'Supabase for backend (shared with web app)',
        'Zustand for state management',
        'React Navigation for routing',
        'expo-notifications for push notifications',
      ]),
      h2('Key Features (MVP)'),
      bulletList([
        'Quick capture with text, voice, and image',
        'Inbox view with swipe-to-process',
        'Today view with scheduled items',
        'Offline-first with Supabase Realtime sync',
        'Push notifications for scheduled items and follow-ups',
      ]),
      h2('Authentication'),
      p(
        'Share Supabase auth session with web app via deep linking. Support biometric unlock for returning users.'
      ),
      h2('Offline Strategy'),
      p(
        'Use MMKV for fast local storage. Queue mutations when offline and replay on reconnect. Conflict resolution: last-write-wins with timestamp comparison.'
      ),
      h3('Sync Flow'),
      bulletList([
        '1. App opens → load from local cache immediately',
        '2. Start Supabase Realtime subscription',
        '3. Fetch delta changes since last sync timestamp',
        '4. Merge remote changes into local state',
        '5. Push any queued local mutations',
      ])
    );

    const { data: page2, error: page2Err } = await supabase
      .from('pages')
      .insert({
        user_id: user.id,
        title: 'OffMind Mobile App - Technical Architecture',
        content: page2Content,
        space_id: spaceMap['Side Project'],
        project_id: projMap['OffMind Mobile App'],
        icon: 'FileCode',
        sort_order: 1,
      })
      .select()
      .single();

    if (page2Err) {
      throw new Error(`Failed to create page 2: ${page2Err.message}`);
    }

    // -- Page 3: linked to "Write a book about productivity for ADHD minds" --
    const bookItemId = somedayMap['Write a book about productivity for ADHD minds'];

    const page3Content = tiptapDoc(
      h1('Book Outline: Productivity for ADHD Minds'),
      p(
        'A practical guide to getting things done when your brain is wired differently. Not another neurotypical productivity book repackaged.'
      ),
      h2('Part 1: Understanding Your ADHD Brain'),
      bulletList([
        'Chapter 1: Why traditional productivity systems fail us',
        'Chapter 2: The ADHD advantage — hyperfocus, creativity, urgency',
        'Chapter 3: Dopamine, motivation, and the myth of laziness',
      ]),
      h2('Part 2: Building Your System'),
      bulletList([
        'Chapter 4: Capture everything (because you WILL forget)',
        'Chapter 5: The 2-minute rule and why it works for ADHD',
        'Chapter 6: External scaffolding — tools, environments, routines',
        'Chapter 7: Time blindness and calendar blocking',
      ]),
      h2('Part 3: Sustaining Momentum'),
      bulletList([
        'Chapter 8: Dealing with the novelty trap',
        'Chapter 9: Accountability systems that actually work',
        'Chapter 10: Self-compassion as a productivity tool',
        'Chapter 11: When to push through vs. when to pivot',
      ]),
      h2('Notes'),
      p(
        'Working title. Target audience: adults diagnosed or self-identified with ADHD who have tried and abandoned multiple productivity systems. Tone: empathetic, practical, no-BS. Include real stories and scientific backing.'
      )
    );

    const { data: page3, error: page3Err } = await supabase
      .from('pages')
      .insert({
        user_id: user.id,
        title: 'Book Outline: Productivity for ADHD Minds',
        content: page3Content,
        item_id: bookItemId,
        icon: 'BookOpen',
        sort_order: 2,
      })
      .select()
      .single();

    if (page3Err) {
      throw new Error(`Failed to create page 3: ${page3Err.message}`);
    }

    // ====================================================================
    // 8. ITEM RELATIONS (3)
    // ====================================================================

    const relations = [];

    // Relation 1: "Set up CI/CD pipeline" BLOCKS "Deploy staging environment"
    const cicdId = backlogMap['Set up CI/CD pipeline'];
    const deployId = completedMap['Deploy staging environment'];
    if (cicdId && deployId) {
      relations.push({
        user_id: user.id,
        source_item_id: cicdId,
        target_item_id: deployId,
        relation_type: 'blocks',
      });
    }

    // Relation 2: "Finalize homepage wireframes" RELATED TO "Design mockups from Sarah"
    const wireframesId = backlogMap['Finalize homepage wireframes'];
    const mockupsId = waitingMap['Design mockups from Sarah'];
    if (wireframesId && mockupsId) {
      relations.push({
        user_id: user.id,
        source_item_id: wireframesId,
        target_item_id: mockupsId,
        relation_type: 'related',
      });
    }

    // Relation 3: "Write blog post about AI in productivity" RELATED TO "AI-powered meeting note taker"
    const blogId = backlogMap['Write blog post about AI in productivity'];
    const aiNoteId = incubatingMap['AI-powered meeting note taker'];
    if (blogId && aiNoteId) {
      relations.push({
        user_id: user.id,
        source_item_id: blogId,
        target_item_id: aiNoteId,
        relation_type: 'related',
      });
    }

    let relationsCreated = 0;
    if (relations.length > 0) {
      const { data: relData, error: relErr } = await supabase
        .from('item_relations')
        .insert(relations)
        .select();

      if (relErr) {
        throw new Error(`Failed to create item relations: ${relErr.message}`);
      }
      relationsCreated = relData?.length || 0;
    }

    // ====================================================================
    // 9. UPDATE PROFILE STREAK
    // ====================================================================
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    await supabase
      .from('profiles')
      .update({
        settings: {
          review_streak: { count: 3, last_review: daysAgo(7) },
        },
        onboarding_completed: true,
        full_name: profile?.full_name || 'Test User',
      })
      .eq('id', user.id);

    // ====================================================================
    // RESPONSE SUMMARY
    // ====================================================================
    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      user_id: user.id,
      cleaned: clean,
      created: {
        contacts: contacts?.length || 0,
        spaces: spaces?.length || 0,
        projects: projects?.length || 0,
        items: {
          inbox: inboxItems?.length || 0,
          backlog: backlogItems?.length || 0,
          scheduled: scheduledItems?.length || 0,
          overdue: overdueItems?.length || 0,
          waiting: waitingItems?.length || 0,
          someday: somedayItems?.length || 0,
          incubating: incubatingItems?.length || 0,
          reference: referenceItems?.length || 0,
          questions: questionItems?.length || 0,
          completed: completedItems?.length || 0,
          archived: archivedItems?.length || 0,
        },
        subtasks: totalSubtasks,
        pages: [page1, page2, page3].filter(Boolean).length,
        relations: relationsCreated,
      },
    });
  } catch (error: unknown) {
    console.error('Seed API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Seed failed', message },
      { status: 500 }
    );
  }
}
