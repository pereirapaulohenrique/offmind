import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: items },
      { data: destinations },
      { data: spaces },
      { data: projects },
      { data: pages },
      { data: contacts },
      { data: subscriptions },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('destinations').select('*').eq('user_id', user.id).order('sort_order'),
      supabase.from('spaces').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('projects').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('pages').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('contacts').select('*').eq('user_id', user.id).order('name'),
      supabase.from('subscriptions').select('*').eq('user_id', user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profile || null,
      items: items || [],
      destinations: destinations || [],
      spaces: spaces || [],
      projects: projects || [],
      pages: pages || [],
      contacts: contacts || [],
      subscriptions: subscriptions || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="offmind-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
