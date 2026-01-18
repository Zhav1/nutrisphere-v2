import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recipes
 * Fetches all saved recipes for authenticated user
 * Optional query: ?favorite=true to filter favorites only
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.error('[GET RECIPES] ❌ No auth token');
      return errorResponse('Unauthorized', 401);
    }
    
    // Create Supabase client with token
    const supabase = createApiClient(token);
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[GET RECIPES] ❌ Auth failed');
      return errorResponse('Unauthorized', 401);
    }

    console.log('[GET RECIPES] ✅ User:', user.email);
    
    // Check for favorite filter
    const { searchParams } = new URL(request.url);
    const favoriteOnly = searchParams.get('favorite') === 'true';

    // Query builder
    let query = supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (favoriteOnly) {
      query = query.eq('is_favorite', true);
    }

    const { data: recipes, error } = await query;

    if (error) {
      console.error('[GET RECIPES] DB error:', error);
      throw error;
    }

    // DEBUG: Also get total count to compare
    const { count: totalCount } = await supabase
      .from('saved_recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    console.log('[GET RECIPES] ✅ Found', recipes?.length || 0, 'recipes, DB total count:', totalCount, 'user_id:', user.id);

    return successResponse({
      recipes: recipes || [],
    });

  } catch (error: any) {
    console.error('[GET RECIPES] ❌ Error:', error);
    return errorResponse(error?.message || 'Failed to fetch recipes', 500);
  }
}
