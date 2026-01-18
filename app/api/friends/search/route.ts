// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { UserSearchResult } from '@/types/friend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/friends/search
 * Search for users by email or friend_code
 * Body: { q: string }
 */
export async function POST(request: Request) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Create authenticated client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Parse request body
    const body = await request.json();
    const query = body.q?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query too short' }, { status: 400 });
    }

    // Search profiles by friend_code (exact match, case-insensitive)
    // OR by display_name (partial match)
    // We avoid exposing email search for privacy
    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, display_name, level, friend_code, mood')
      .or(`friend_code.ilike.${query},display_name.ilike.%${query}%`)
      .neq('id', userId) // Exclude self
      .limit(20);

    if (searchError) {
      console.error('Search error:', searchError);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Get existing friendships with these users (excluding soft-deleted)
    const profileIds = profiles.map(p => p.id);
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.in.(${profileIds.join(',')}),receiver_id.in.(${profileIds.join(',')})`)
      .is('deleted_at', null); // FIX: Exclude soft-deleted friendships

    // Build friendship status map
    const statusMap = new Map<string, { status: string; direction?: 'incoming' | 'outgoing' }>();
    friendships?.forEach(f => {
      let otherId: string;
      let direction: 'incoming' | 'outgoing' | undefined;
      
      if (f.sender_id === userId) {
        otherId = f.receiver_id;
        direction = f.status === 'pending' ? 'outgoing' : undefined;
      } else if (f.receiver_id === userId) {
        otherId = f.sender_id;
        direction = f.status === 'pending' ? 'incoming' : undefined;
      } else {
        return; // Not involving current user
      }

      statusMap.set(otherId, { status: f.status, direction });
    });

    // Build search results
    const results: UserSearchResult[] = profiles.map(p => {
      const friendshipInfo = statusMap.get(p.id);
      return {
        id: p.id,
        display_name: p.display_name,
        level: p.level,
        friend_code: p.friend_code,
        mood: p.mood,
        friendship_status: (friendshipInfo?.status as UserSearchResult['friendship_status']) || 'none',
        pending_direction: friendshipInfo?.direction
      };
    });

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
