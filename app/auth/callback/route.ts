import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/home';

  if (code) {
    const supabase = createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!sessionError && sessionData.user) {
      // Check if user has a profile, if not create one automatically
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', sessionData.user.id)
        .single();

      if (profileError || !existingProfile) {
        console.log('[CALLBACK] 📝 No profile found, creating new profile for:', sessionData.user.email);
        
        // Generate friend code (NS-XXXXXXXX format)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let friendCode = 'NS-';
        for (let i = 0; i < 8; i++) {
          friendCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Auto-create profile for OAuth user with friend code
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: sessionData.user.id,
            display_name: sessionData.user.user_metadata?.full_name || sessionData.user.email?.split('@')[0] || 'NutriUser',
            friend_code: friendCode,
          });

        if (createError) {
          console.error('[CALLBACK] ❌ Failed to create profile:', createError.message);
        } else {
          console.log('[CALLBACK] ✅ New profile created with friend code:', friendCode);
        }
      } else {
        console.log('[CALLBACK] ✅ Profile exists:', existingProfile.id);
      }
    }
  }

  // Redirect to intended destination
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Smart defaults if variable is not set
  if (!siteUrl) {
    if (process.env.NODE_ENV === 'development') {
      siteUrl = 'http://localhost:3000';
    } else {
      siteUrl = 'https://nutri-sphere.site';
    }
  }

  // Ensure siteUrl doesn't have trailing slash
  const baseUrl = siteUrl.replace(/\/$/, '');
  const redirectPath = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
  
  return NextResponse.redirect(new URL(redirectPath, baseUrl));
}
