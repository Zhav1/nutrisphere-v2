// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { RespondToRequestBody } from '@/types/friend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * PATCH /api/friends/[id]
 * Accept or reject a friend request
 * Body: { action: 'accept' | 'reject' }
 */
export async function PATCH(
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

    // Parse request body
    const body: RespondToRequestBody = await request.json();
    const { action } = body;

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "accept" or "reject"' }, { status: 400 });
    }


    // Fetch the friendship
    console.log('[PATCH] Looking up friendship:', friendshipId, 'for user:', userId);
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      console.error('[PATCH] Friendship lookup failed:', { fetchError, friendship, friendshipId });
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }
    console.log('[PATCH] Found friendship:', friendship);

    // Reject if friendship was soft-deleted
    if (friendship.deleted_at) {
      return NextResponse.json({ error: 'This friendship no longer exists' }, { status: 404 });
    }

    // Only receiver can accept/reject
    if (friendship.receiver_id !== userId) {
      return NextResponse.json({ error: 'Only the recipient can respond to this request' }, { status: 403 });
    }

    // Must be pending
    if (friendship.status !== 'pending') {
      return NextResponse.json({ error: 'This request has already been responded to' }, { status: 400 });
    }

    // Update friendship status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    console.log('[PATCH] Updating friendship status to:', newStatus);
    const { data: updated, error: updateError } = await supabase
      .from('friendships')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .select()
      .single();

    console.log('[PATCH] Update result:', { updated, error: updateError });

    if (updateError) {
      console.error('[PATCH] Error updating friendship:', updateError);
      return NextResponse.json({ error: 'Failed to update friendship' }, { status: 500 });
    }

    if (!updated) {
      console.error('[PATCH] No rows updated - RLS may be blocking');
      return NextResponse.json({ error: 'Failed to update - permission denied' }, { status: 403 });
    }

    console.log('[PATCH] Successfully updated friendship to:', updated.status);
    return NextResponse.json({ 
      message: action === 'accept' ? 'Friend request accepted!' : 'Friend request rejected',
      friendship: updated
    });

  } catch (error) {
    console.error('Friendship PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/friends/[id]
 * Remove a friendship (unfriend)
 */
export async function DELETE(
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

    // Fetch the friendship to verify ownership
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Already soft-deleted
    if (friendship.deleted_at) {
      return NextResponse.json({ error: 'Friendship already removed' }, { status: 404 });
    }

    // Only participants can delete
    if (friendship.sender_id !== userId && friendship.receiver_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this friendship' }, { status: 403 });
    }

    // Delete the friendship
    console.log('[DELETE] Attempting to soft-delete friendship:', friendshipId);

    // Soft delete: UPDATE instead of DELETE to trigger Realtime UPDATE events
    const { error: deleteError } = await supabase
      .from('friendships')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', friendshipId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (deleteError) {
      console.error('[DELETE] Soft-delete failed:', deleteError);
      return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
    }

    console.log('[DELETE] Successfully soft-deleted friendship:', friendshipId);
    return NextResponse.json({ message: 'Friend removed successfully' });

  } catch (error) {
    console.error('Friendship DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
