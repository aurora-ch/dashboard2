import { createSupabaseBrowserClient } from "./supabase-browser";

export async function createUserProfile(user: { id: string; user_metadata?: { full_name?: string; avatar_url?: string; picture?: string }; email?: string }) {
  const supabase = createSupabaseBrowserClient();
  
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = createSupabaseBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}
