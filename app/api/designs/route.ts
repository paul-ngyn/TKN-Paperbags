import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAuthenticatedSupabase(request: NextRequest) {
  // Try to get auth token from Authorization header first
  const authHeader = request.headers.get('authorization');
  let accessToken = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.split(' ')[1];
  }
  
  if (!accessToken) {
    // Fallback to cookies (remove excessive logging)
    const cookieStore = await cookies();
    const authCookies = cookieStore.getAll().filter(cookie => 
      cookie.name.includes('sb-') && cookie.name.includes('auth-token')
    );
    
    for (const cookie of authCookies) {
      if (!cookie.name.includes('.') || cookie.name.endsWith('.0')) {
        accessToken = cookie.value;
        break;
      }
    }
  }
  
  if (!accessToken) {
    throw new Error('No authentication token found');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Authentication failed');
  }

  return { supabase, user };
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase(request);

    const { data: designs, error } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
    }

    return NextResponse.json({ designs: designs || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase(request);

    const body = await request.json();
    const { name, description, dimensions, logos, preview_image } = body;

    if (!name || !dimensions || !logos) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Saving design for user:', user.id);

    const { data: design, error } = await supabase
      .from('designs')
      .insert({
        user_id: user.id,
        name,
        description,
        dimensions,
        logos,
        preview_image
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save design' }, { status: 500 });
    }

    return NextResponse.json({ design }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}