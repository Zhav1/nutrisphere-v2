// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SendFriendRequestBody } from '@/types/friend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/friends/request
 * Send a friend request to another user
 * Body: { receiver_id: string }
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

    const senderId = user.id;

    // Parse request body
    const body: SendFriendRequestBody = await request.json();
    const receiverId = body.receiver_id;

    if (!receiverId) {
      return NextResponse.json({ error: 'receiver_id is required' }, { status: 400 });
    }

    // Cannot friend yourself
    if (receiverId === senderId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if receiver exists
    const { data: receiver, error: receiverError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', receiverId)
      .single();

    if (receiverError || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing friendship in either direction
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .single();

    if (existingFriendship) {
      // CRITICAL: Handle soft-deleted friendships first!
      // If friendship was deleted (deleted_at is set), resurrect it as a new request
      if (existingFriendship.deleted_at) {
        console.log('[Friend Request] Found soft-deleted friendship, resurrecting as pending');
        const { data: resurrected, error: resurrectError } = await supabase
          .from('friendships')
          .update({ 
            status: 'pending', 
            sender_id: senderId,
            receiver_id: receiverId,
            deleted_at: null, // Clear the soft-delete
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingFriendship.id)
          .select()
          .single();

        if (resurrectError) {
          console.error('Error resurrecting friendship:', resurrectError);
          return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
        }

        // Fetch receiver profile for frontend
        const { data: receiverProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', receiverId)
          .single();

        return NextResponse.json({ 
          message: 'Friend request sent!',
          friendship: resurrected,
          receiver_profile: receiverProfile,
          status: 'pending'
        }, { status: 201 });
      }

      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ 
          error: 'Already friends', 
          status: 'accepted' 
        }, { status: 409 });
      }
      if (existingFriendship.status === 'pending') {
        // If they sent the request, auto-accept
        if (existingFriendship.sender_id === receiverId) {
          const { error: acceptError } = await supabase
            .from('friendships')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', existingFriendship.id);

          if (acceptError) {
            console.error('Error accepting friendship:', acceptError);
            return NextResponse.json({ error: 'Failed to accept request' }, { status: 500 });
          }

          return NextResponse.json({ 
            message: 'Friend request accepted! They already sent you a request.',
            status: 'accepted'
          });
        }

        // I already sent a request
        return NextResponse.json({ 
          error: 'Friend request already sent', 
          status: 'pending' 
        }, { status: 409 });
      }
      if (existingFriendship.status === 'rejected') {
        // Update existing rejected friendship to pending
        const { error: updateError } = await supabase
          .from('friendships')
          .update({ 
            status: 'pending', 
            sender_id: senderId,
            receiver_id: receiverId,
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingFriendship.id);

        if (updateError) {
          console.error('Error updating friendship:', updateError);
          return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
        }

        return NextResponse.json({ 
          message: 'Friend request sent!',
          status: 'pending'
        });
      }
    }

    // Create new friendship request
    const { data: newFriendship, error: insertError } = await supabase
      .from('friendships')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating friendship:', insertError);
      // Check for unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Request already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
    }

    // Fetch receiver's full profile for frontend
    const { data: receiverProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', receiverId)
      .single();

    if (profileError || !receiverProfile) {
      console.error('Error fetching receiver profile:', profileError);
    }

    return NextResponse.json({ 
      message: 'Friend request sent!',
      friendship: newFriendship,
      receiver_profile: receiverProfile, // Include full profile
      status: 'pending'
    }, { status: 201 });

  } catch (error) {
    console.error('Friend request API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
