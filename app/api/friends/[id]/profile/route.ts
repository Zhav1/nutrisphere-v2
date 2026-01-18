// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { FriendProfile } from '@/types/friend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/friends/[id]/profile
 * Get detailed profile of a friend
 * Only accessible if friendship is accepted
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: friendshipId } = await params;
    
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

    // Fetch the friendship
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Verify user is part of this friendship
    if (friendship.sender_id !== userId && friendship.receiver_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to view this profile' }, { status: 403 });
    }

    // Must be accepted to view full profile
    if (friendship.status !== 'accepted') {
      return NextResponse.json({ error: 'Can only view accepted friends\' profiles' }, { status: 403 });
    }

    // Get the friend's profile (the other person)
    const friendId = friendship.sender_id === userId ? friendship.receiver_id : friendship.sender_id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level, streak_days, recipes_cooked, recipes_saved, mood, health, friend_code, equipped_accessories, created_at, current_xp, max_xp')
      .eq('id', friendId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Return friend profile (recipes_cooked maintained by database trigger)
    return NextResponse.json({
      profile: profile as FriendProfile,
      friendship_id: friendshipId
    });

  } catch (error) {
    console.error('Friend profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
