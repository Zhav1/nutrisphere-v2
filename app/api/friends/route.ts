import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { FriendWithProfile, PendingRequest, FriendProfile } from '@/types/friend';

export const dynamic = 'force-dynamic';

// Create Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/friends
 * Fetch current user's friends list and pending requests
 */
export async function GET(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Create authenticated client with NO persistence to ensure fresh data
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch friendships where user is involved (excluding soft-deleted)
    console.log('[GET /api/friends] Fetching friendships for user:', userId);
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select(`
        *,
        sender:profiles!friendships_sender_id_fkey(*),
        receiver:profiles!friendships_receiver_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .is('deleted_at', null) // Exclude soft-deleted friendships
      .order('created_at', { ascending: false });

    console.log('[GET /api/friends] Supabase returned:', friendships?.length, 'friendships');
    console.log('[GET /api/friends] Friendship IDs:', friendships?.map(f => ({ id: f.id, status: f.status })));

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError);
      return NextResponse.json({ error: 'Failed to fetch friendships' }, { status: 500 });
    }

    // Get unique friend IDs (the other person in each friendship)
    const friendIds = new Set<string>();
    friendships?.forEach(f => {
      if (f.sender_id === userId) {
        friendIds.add(f.receiver_id);
      } else {
        friendIds.add(f.sender_id);
      }
    });

    // Fetch friend profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level, streak_days, recipes_cooked, recipes_saved, mood, health, friend_code, equipped_accessories, created_at, current_xp, max_xp')
      .in('id', Array.from(friendIds));

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Create profile lookup map (recipes_cooked is maintained by database trigger)
    const profileMap = new Map<string, FriendProfile>();
    profiles?.forEach(p => profileMap.set(p.id, p as FriendProfile));

    // Build friends list (accepted friendships)
    const friends: FriendWithProfile[] = [];
    const pendingIncoming: PendingRequest[] = [];
    const pendingOutgoing: FriendWithProfile[] = [];

    friendships?.forEach(f => {
      const isSender = f.sender_id === userId;
      const friendId = isSender ? f.receiver_id : f.sender_id;
      const friendProfile = profileMap.get(friendId);

      if (!friendProfile) return;

      const friendWithProfile: FriendWithProfile = {
        ...f,
        friend: friendProfile,
        is_sender: isSender
      };

      if (f.status === 'accepted') {
        friends.push(friendWithProfile);
      } else if (f.status === 'pending') {
        if (isSender) {
          // I sent this request, waiting for response
          pendingOutgoing.push(friendWithProfile);
        } else {
          // Someone sent me a request
          pendingIncoming.push({
            friendship_id: f.id,
            sender: friendProfile,
            created_at: f.created_at
          });
        }
      }
      // Rejected requests are not shown
    });

    // PERFORMANCE OPTIMIZATION: Batch-fetch ALL accessories in ONE query
    // This eliminates the N+1 problem where each FriendCard fetches accessories separately
    const allAccessoryIds = new Set<string>();
    
    // Collect accessory IDs from accepted friends
    friends.forEach(f => {
      if (f.friend.equipped_accessories) {
        Object.values(f.friend.equipped_accessories).forEach(id => {
          if (id) allAccessoryIds.add(id as string);
        });
      }
    });
    
    // Collect accessory IDs from pending incoming requests
    pendingIncoming.forEach(r => {
      if (r.sender.equipped_accessories) {
        Object.values(r.sender.equipped_accessories).forEach(id => {
          if (id) allAccessoryIds.add(id as string);
        });
      }
    });
    
    // Collect accessory IDs from pending outgoing requests
    pendingOutgoing.forEach(f => {
      if (f.friend.equipped_accessories) {
        Object.values(f.friend.equipped_accessories).forEach(id => {
          if (id) allAccessoryIds.add(id as string);
        });
      }
    });

    // Single query for ALL accessories
    let accessories = [];
    if (allAccessoryIds.size > 0) {
      const { data: accessoriesData, error: accessoriesError } = await supabase
        .from('accessories')
        .select('*')
        .in('id', Array.from(allAccessoryIds));
      
      if (accessoriesError) {
        console.error('Error fetching accessories:', accessoriesError);
        // Don't fail the entire request, just log the error
      } else {
        accessories = accessoriesData || [];
      }
    }

    // Create response with explicit no-cache headers to prevent any HTTP caching
    const response = NextResponse.json({
      friends,
      pending_incoming: pendingIncoming,
      pending_outgoing: pendingOutgoing,
      total_friends: friends.length,
      total_pending: pendingIncoming.length,
      accessories // NEW: Batch-fetched accessories
    });
    
    // Prevent all caching - critical for real-time friend data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Friends API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
