import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createUserProfile } from '@/lib/user-profile';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(`${origin}/signin?error=oauth_callback_error`);
      }

      if (data.user) {
        // Create user profile if it doesn't exist
        await createUserProfile(data.user);
        
        // Redirect to dashboard after successful authentication
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/signin?error=oauth_callback_error`);
    }
  }

  // If no code, redirect to signin
  return NextResponse.redirect(`${origin}/signin`);
}
