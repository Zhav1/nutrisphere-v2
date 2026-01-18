/**
 * Friend-related TypeScript types
 * Used across API routes, hooks, and components
 */

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Raw friendship record from database
 */
export interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Public profile information visible to friends/searchers
 * Note: Does NOT include sensitive data like email, wallet_balance, total_savings_rp
 */
export interface FriendProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  streak_days: number;
  recipes_cooked: number;
  recipes_saved: number; // NEW: count of saved recipes
  mood: 'happy' | 'neutral' | 'sick';
  health: number;
  friend_code: string;
  equipped_accessories: Record<string, string> | null;
  created_at: string;
  // XP info for progress display
  current_xp: number;
  max_xp: number;
}

/**
 * Friendship with friend's profile data attached
 * Used for displaying friend list
 */
export interface FriendWithProfile extends Friendship {
  friend: FriendProfile;
  // Indicates if current user is the sender
  is_sender: boolean;
}

/**
 * Search result for user lookup
 */
export interface UserSearchResult {
  id: string;
  display_name: string | null;
  level: number;
  friend_code: string;
  mood: 'happy' | 'neutral' | 'sick';
  // Existing friendship status with the searcher
  friendship_status: FriendshipStatus | 'none';
  // If there's a pending request, who sent it
  pending_direction?: 'incoming' | 'outgoing';
}

/**
 * Pending friend request (for incoming requests section)
 */
export interface PendingRequest {
  friendship_id: string;
  sender: FriendProfile;
  created_at: string;
}

/**
 * API request/response types
 */
export interface SendFriendRequestBody {
  receiver_id: string;
}

export interface RespondToRequestBody {
  action: 'accept' | 'reject';
}

export interface SearchUsersQuery {
  q: string; // Search query (email or friend_code)
}
