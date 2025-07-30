import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAuthenticatedSupabase() {
  const cookieStore = await cookies();
  
  // Get the auth token from cookies (adjust the cookie name based on your Supabase project)
  const authCookies = cookieStore.getAll().filter(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  );
  
  let accessToken = null;
  for (const cookie of authCookies) {
    if (!cookie.name.includes('.') || cookie.name.endsWith('.0')) {
      accessToken = cookie.value;
      break;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    const { id } = await params;

    const { data: design, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    return NextResponse.json({ design });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    const { id } = await params;

    const body = await request.json();
    const { name, description, dimensions, logos, preview_image } = body;

    const { data: design, error } = await supabase
      .from('designs')
      .update({
        name,
        description,
        dimensions,
        logos,
        preview_image
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
    }

    return NextResponse.json({ design });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    const { id } = await params;

    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}