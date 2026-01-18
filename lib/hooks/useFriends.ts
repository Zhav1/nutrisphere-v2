import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { 
  FriendWithProfile, 
  PendingRequest, 
  UserSearchResult,
  FriendProfile
} from '@/types/friend';
import type { Accessory } from '@/types/accessory';

/**
 * Helper to get auth token for API calls
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * API response types
 */
interface FriendsListResponse {
  friends: FriendWithProfile[];
  pending_incoming: PendingRequest[];
  pending_outgoing: FriendWithProfile[];
  total_friends: number;
  total_pending: number;
  accessories: Accessory[]; // Batch-fetched accessories for all friends
}

interface SearchResponse {
  results: UserSearchResult[];
}

interface FriendProfileResponse {
  profile: FriendProfile;
  friendship_id: string;
}

/**
 * Hook to fetch friends list and pending requests
 * Uses cache-first architecture - cache is trusted as source of truth
 */
export function useFriendsList() {
  return useQuery({
    queryKey: ['friends', 'list'],
    queryFn: async (): Promise<FriendsListResponse> => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store' // Prevent Next.js from caching
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch friends');
      }

      return res.json();
    },
    // Cache strategy: 
    // - Short staleTime (30s) so data is considered fresh for a bit
    // - Refetch on mount ensures page refresh gets fresh data
    // - Realtime subscription handles live updates between refreshes
    staleTime: 30 * 1000, // 30 seconds - rely on Realtime for live updates
    refetchOnWindowFocus: false, // Avoid jarring refetches when switching tabs
    refetchOnMount: 'always', // CRITICAL: Always fetch fresh on page load/refresh
  });
}

/**
 * Lightweight hook for pending request counts (for badges)
 * Derives from useFriendsList cache to avoid extra API calls
 */
export function usePendingRequestsCount() {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['friends', 'pending-count'],
    queryFn: async (): Promise<{ incoming: number; outgoing: number; hasPending: boolean }> => {
      // Try to get from cache first
      const cachedData = queryClient.getQueryData<FriendsListResponse>(['friends', 'list']);
      
      if (cachedData) {
        return {
          incoming: cachedData.pending_incoming.length,
          outgoing: cachedData.pending_outgoing.length,
          hasPending: cachedData.pending_incoming.length > 0 || cachedData.pending_outgoing.length > 0
        };
      }
      
      // Fallback: fetch from API
      const token = await supabase.auth.getSession().then(s => s.data.session?.access_token);
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (!res.ok) throw new Error('Failed to fetch pending counts');
      
      const data: FriendsListResponse = await res.json();
      return {
        incoming: data.pending_incoming.length,
        outgoing: data.pending_outgoing.length,
        hasPending: data.pending_incoming.length > 0 || data.pending_outgoing.length > 0
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to search for users
 */
export function useSearchUsers() {
  return useMutation({
    mutationFn: async (query: string): Promise<SearchResponse> => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/friends/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ q: query }),
        cache: 'no-store'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Search failed');
      }

      return res.json();
    }
    // NOTE: Removed onSuccess invalidation - it was causing stale data to reappear
    // Friends list is now managed by:
    // 1. refetchOnMount: 'always' for fresh data on page load
    // 2. Realtime subscription for live updates
  });
}

/**
 * Hook to send a friend request
 * Note: Search modal handles local status update, so we just need to mark cache stale
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiverId: string) => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ receiver_id: receiverId }),
        cache: 'no-store'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send request');
      }

      return res.json();
    },
    // Add optimistic update using API response
    onSuccess: (data) => {
      console.log('[Optimistic] Send request - updating cache with API data:', data);
      
      queryClient.setQueryData<FriendsListResponse>(['friends', 'list'], (old) => {
        if (!old || !data.friendship || !data.receiver_profile) {
          console.warn('[Optimistic] Missing data for cache update:', { 
            hasFriendship: !!data.friendship, 
            hasProfile: !!data.receiver_profile 
          });
          return old;
        }
        
        // Add to pending_outgoing
        const newOutgoing: FriendWithProfile = {
          id: data.friendship.id,
          sender_id: data.friendship.sender_id,
          receiver_id: data.friendship.receiver_id,
          status: 'pending',
          created_at: data.friendship.created_at,
          updated_at: data.friendship.updated_at,
          is_sender: true,
          friend: data.receiver_profile // Profile from API response
        };
        
        const friendshipId = data.friendship.id;
        
        // CRITICAL: Clean up ALL lists first to prevent duplicates
        // This handles resurrection where the same ID might be in other lists
        const cleanedFriends = old.friends.filter(f => f.id !== friendshipId);
        const cleanedIncoming = old.pending_incoming.filter(r => r.friendship_id !== friendshipId);
        const cleanedOutgoing = old.pending_outgoing.filter(p => p.id !== friendshipId);
        
        console.log('[Optimistic] Send request - cleaned up before add:', {
          friendsRemoved: old.friends.length - cleanedFriends.length,
          incomingRemoved: old.pending_incoming.length - cleanedIncoming.length,
          outgoingRemoved: old.pending_outgoing.length - cleanedOutgoing.length
        });
        
        return {
          ...old,
          friends: cleanedFriends,
          pending_incoming: cleanedIncoming,
          pending_outgoing: [newOutgoing, ...cleanedOutgoing],
          total_friends: cleanedFriends.length,
          total_pending: cleanedIncoming.length + 1
        };
      });
    }
  });
}

/**
 * Hook to respond to a friend request (accept/reject)
 * Uses cache-first optimistic updates - NO refetch needed
 */
export function useRespondToRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendshipId, action }: { friendshipId: string; action: 'accept' | 'reject' }) => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action }),
        cache: 'no-store'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to respond to request');
      }

      return res.json();
    },
    // OPTIMISTIC UPDATE: Immediately update cache before API completes
    onMutate: async ({ friendshipId, action }) => {
      // Cancel any in-flight refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['friends', 'list'] });

      // Snapshot current state for rollback
      const previousData = queryClient.getQueryData<FriendsListResponse>(['friends', 'list']);

      if (previousData) {
        // Find the request we're responding to
        const request = previousData.pending_incoming.find(r => r.friendship_id === friendshipId);
        
        if (request) {
          const newData: FriendsListResponse = {
            ...previousData,
            // Always remove from pending
            pending_incoming: previousData.pending_incoming.filter(r => r.friendship_id !== friendshipId),
            total_pending: Math.max(0, previousData.total_pending - 1),
            // If accepting, add to friends
            friends: action === 'accept' 
              ? [...previousData.friends, {
                  id: friendshipId,
                  sender_id: request.sender.id,
                  receiver_id: '', // Current user - will be filled on next fetch if needed
                  status: 'accepted' as const,
                  created_at: request.created_at,
                  updated_at: new Date().toISOString(),
                  is_sender: false,
                  friend: request.sender // We already have the full FriendProfile!
                }]
              : previousData.friends,
            total_friends: action === 'accept' ? previousData.total_friends + 1 : previousData.total_friends,
            // Keep accessories as-is
            accessories: previousData.accessories
          };
          
          console.log('[Optimistic] Accept/Reject - updating cache:', {
            action,
            friendshipId,
            prevPending: previousData.pending_incoming.length,
            newPending: newData.pending_incoming.length,
            prevFriends: previousData.friends.length,
            newFriends: newData.friends.length
          });
          
          queryClient.setQueryData<FriendsListResponse>(['friends', 'list'], newData);
        }
      }

      return { previousData };
    },
    // On error: rollback only for genuine failures, NOT for "already responded"
    onError: (err, _vars, context) => {
      const errorMessage = err instanceof Error ? err.message : '';
      // Don't rollback if action already succeeded on a previous click
      if (errorMessage.toLowerCase().includes('already')) {
        return; // Keep the optimistic state - action was successful
      }
      // Rollback for genuine failures
      if (context?.previousData) {
        queryClient.setQueryData(['friends', 'list'], context.previousData);
      }
    },
    // SUCCESS: Trust optimistic update completely!
    // Do NOT refetch or invalidate - Supabase API is stale.
    // Realtime subscription will handle the server-side confirmation updating.
    onSuccess: () => {
       // Intentional no-op: Logic is handled by optimistic update + Realtime
    },
    onSettled: () => {
      // Only invalidating counts is safe as it's less critical/visible
      queryClient.invalidateQueries({ 
        queryKey: ['friends', 'pending-count'],
        refetchType: 'none'
      });
    }
  });
}

/**
 * Hook to remove a friend
 * Uses cache-first optimistic updates - NO refetch needed
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove friend');
      }

      return res.json();
    },
    // OPTIMISTIC UPDATE: Immediately remove from cache
    onMutate: async (friendshipId) => {
      await queryClient.cancelQueries({ queryKey: ['friends', 'list'] });

      const previousData = queryClient.getQueryData<FriendsListResponse>(['friends', 'list']);

      if (previousData) {
        const newData = {
          ...previousData,
          friends: previousData.friends.filter(f => f.id !== friendshipId),
          total_friends: Math.max(0, previousData.total_friends - 1)
        };
        
        console.log('[Optimistic] Remove friend - updating cache:', {
          friendshipId,
          prevFriends: previousData.friends.length,
          newFriends: newData.friends.length
        });
        
        queryClient.setQueryData<FriendsListResponse>(['friends', 'list'], newData);
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['friends', 'list'], context.previousData);
      }
    },
    // SUCCESS: Trust optimistic update completely!
    onSuccess: () => {
       // Intentional no-op
    }
  });
}

/**
 * Hook to fetch a friend's detailed profile
 */
export function useFriendProfile(friendshipId: string | null) {
  return useQuery({
    queryKey: ['friends', 'profile', friendshipId],
    queryFn: async (): Promise<FriendProfileResponse> => {
      if (!friendshipId) throw new Error('No friendship ID');

      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`/api/friends/${friendshipId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }

      return res.json();
    },
    enabled: !!friendshipId,
    staleTime: 60 * 1000 // 1 minute
  });
}

/**
 * Hook for Supabase Realtime subscription on friendships table
 * Enables cross-user sync - when any user modifies friendships,
 * all connected clients will have their cache invalidated
 * 
 * Use this hook in the friends page component to enable real-time updates
 */
export function useFriendshipRealtimeSync(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      console.log('[Realtime] Hook called but userId is null, skipping subscription');
      return;
    }

    console.log('[Realtime] Initializing subscriptions for user:', userId);

    // Realtime doesn't support or() filters!
    // Need separate subscriptions for sender_id and receiver_id
    
    // Shared event handler for both subscriptions
    const handleFriendshipChange = async (payload: any) => {
      console.log('[Realtime] Friendship changed:', payload.eventType, payload);
      
      const newRecord = payload.new as any;
      const eventType = payload.eventType;

      // Special case: Incoming pending request needs sender profile
      // This handles BOTH new requests (INSERT) AND resurrected requests (UPDATE with deleted_at cleared)
      const isNewIncomingRequest = (
        eventType === 'INSERT' && 
        newRecord?.status === 'pending' && 
        newRecord?.receiver_id === userId
      );
      
      // For resurrected requests, Supabase Realtime may not include payload.old
      // So we use a simpler condition: UPDATE with pending status, no deleted_at,
      // and the request isn't already in our cache (to avoid reprocessing)
      const isResurrectedIncomingRequest = (
        eventType === 'UPDATE' && 
        newRecord?.status === 'pending' && 
        newRecord?.receiver_id === userId &&
        !newRecord?.deleted_at // deleted_at is cleared (not soft-deleted)
      );
      
      if (isNewIncomingRequest || isResurrectedIncomingRequest) {
        console.log('[Realtime] New/resurrected incoming request, fetching sender profile immediately', {
          isNew: isNewIncomingRequest,
          isResurrected: isResurrectedIncomingRequest
        });
        
        // Fetch sender profile immediately (no delay!)
        const { data: senderProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, level, streak_days, recipes_cooked, recipes_saved, mood, health, friend_code, equipped_accessories, created_at, current_xp, max_xp')
          .eq('id', newRecord.sender_id)
          .single();
        
        if (senderProfile && !profileError) {
          console.log('[Realtime] Got sender profile, updating cache immediately');
          
          // Add to cache immediately with sender profile
          queryClient.setQueryData<FriendsListResponse>(['friends', 'list'], (old) => {
            if (!old) return old;
            
            const friendshipId = newRecord.id;
            
            // CRITICAL: Clean up ALL lists first to prevent duplicates
            // This handles resurrection where the same ID might be in other lists
            const cleanedFriends = old.friends.filter(f => f.id !== friendshipId);
            const cleanedIncoming = old.pending_incoming.filter(r => r.friendship_id !== friendshipId);
            const cleanedOutgoing = old.pending_outgoing.filter(p => p.id !== friendshipId);
            
            console.log('[Realtime] Cleaned up before add:', {
              friendsRemoved: old.friends.length - cleanedFriends.length,
              incomingRemoved: old.pending_incoming.length - cleanedIncoming.length,
              outgoingRemoved: old.pending_outgoing.length - cleanedOutgoing.length
            });
            
            const newRequest: PendingRequest = {
              friendship_id: newRecord.id,
              sender: senderProfile as FriendProfile,
              created_at: newRecord.created_at
            };
            
            console.log('[Realtime] Added incoming request to cache:', {
              prevPending: cleanedIncoming.length,
              newPending: cleanedIncoming.length + 1
            });
            
            return {
              ...old,
              friends: cleanedFriends,
              pending_incoming: [newRequest, ...cleanedIncoming],
              pending_outgoing: cleanedOutgoing,
              total_friends: cleanedFriends.length,
              total_pending: cleanedIncoming.length + 1
            };
          });
          return;
        }
        
        // Fallback: refetch immediately if profile fetch failed
        console.log('[Realtime] Profile fetch failed, falling back to refetch');
        await queryClient.refetchQueries({ queryKey: ['friends', 'list'] });
        return;
      }
      
      const queryKey = ['friends', 'list'];
      await queryClient.cancelQueries({ queryKey });
      
      queryClient.setQueryData<FriendsListResponse>(queryKey, (old) => {
        if (!old) {
          console.log('[Realtime] No cached data to update');
          return old;
        }
        
        console.log('[Realtime] Current cache:', {
          friends: old.friends.length,
          pendingIncoming: old.pending_incoming.length,
          pendingOutgoing: old.pending_outgoing.length
        });
        
        const oldRecord = payload.old as any;

        const newData = { ...old };
        
        // Handle soft deletes (UPDATE with deleted_at set)
        if (eventType === 'UPDATE' && newRecord.deleted_at) {
          const id = newRecord.id;
          newData.friends = newData.friends.filter(f => f.id !== id);
          newData.pending_incoming = newData.pending_incoming.filter(r => r.friendship_id !== id);
          newData.pending_outgoing = newData.pending_outgoing.filter(f => f.id !== id);
          console.log('[Realtime] After soft DELETE (UPDATE), new counts:', {
            friends: newData.friends.length,
            pendingIncoming: newData.pending_incoming.length,
            pendingOutgoing: newData.pending_outgoing.length
          });
        }
        // Handle hard deletes (original DELETE events, if any)
        else if (eventType === 'DELETE') {
          const id = oldRecord.id;
          newData.friends = newData.friends.filter(f => f.id !== id);
          newData.pending_incoming = newData.pending_incoming.filter(r => r.friendship_id !== id);
          newData.pending_outgoing = newData.pending_outgoing.filter(f => f.id !== id);
          console.log('[Realtime] After DELETE, new counts:', {
            friends: newData.friends.length,
            pendingIncoming: newData.pending_incoming.length,
            pendingOutgoing: newData.pending_outgoing.length
          });
        } 
        else if (eventType === 'INSERT' || eventType === 'UPDATE') {
          if (newRecord.status === 'accepted') {
            const pendingReq = newData.pending_incoming.find(r => r.friendship_id === newRecord.id);
            if (pendingReq) {
              const newFriend: FriendWithProfile = {
                ...pendingReq.sender,
                id: newRecord.id,
                sender_id: newRecord.sender_id,
                receiver_id: newRecord.receiver_id,
                status: 'accepted',
                is_sender: newRecord.sender_id === userId,
                friend: pendingReq.sender,
                created_at: newRecord.created_at,
                updated_at: newRecord.updated_at
              };
              
              newData.pending_incoming = newData.pending_incoming.filter(r => r.friendship_id !== newRecord.id);
              if (!newData.friends.some(f => f.id === newRecord.id)) {
                newData.friends = [newFriend, ...newData.friends];
              }
            } else {
              const outgoingReq = newData.pending_outgoing.find(r => r.id === newRecord.id);
              if (outgoingReq) {
                const newFriend: FriendWithProfile = {
                  ...outgoingReq,
                  status: 'accepted',
                  updated_at: newRecord.updated_at
                };
                
                newData.pending_outgoing = newData.pending_outgoing.filter(r => r.id !== newRecord.id);
                if (!newData.friends.some(f => f.id === newRecord.id)) {
                  newData.friends = [newFriend, ...newData.friends];
                }
              }
            }
          }
        }
        
        newData.total_friends = newData.friends.length;
        newData.total_pending = newData.pending_incoming.length;
        
        console.log('[Realtime] Cache updated, final counts:', {
          friends: newData.total_friends,
          pending: newData.total_pending
        });
        
        return newData;
      });
    };

    // Subscribe to events where user is SENDER
    const channelSender = supabase
      .channel(`friendships-sender-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `sender_id=eq.${userId}`
        },
        handleFriendshipChange
      )
      .subscribe((status) => {
        console.log('[Realtime] Sender subscription status:', status);
      });

    // Subscribe to events where user is RECEIVER
    const channelReceiver = supabase
      .channel(`friendships-receiver-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `receiver_id=eq.${userId}`
        },
        handleFriendshipChange
      )
      .subscribe((status) => {
        console.log('[Realtime] Receiver subscription status:', status);
      });

    // Cleanup both channels on unmount
    return () => {
      console.log('[Realtime] Unsubscribing from both channels');
      supabase.removeChannel(channelSender);
      supabase.removeChannel(channelReceiver);
    };
  }, [userId, queryClient]);
}
