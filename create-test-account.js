// Quick Test Account Creation Script
// This will help you create a test account to access the dashboard

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dkgkqcngqqknyznrsmnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ2txY25ncXFrbnl6bnJzbW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDAyNDQsImV4cCI6MjA3NTc3NjI0NH0.ffPfkyWedtVpiWo3jRsglRekPSPSYD7N-tqEB_erVL0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestAccount() {
  console.log('🔐 Creating test account...')
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@aurora.com',
      password: 'testpassword123',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    
    if (error) {
      console.error('❌ Error creating account:', error.message)
      
      // Try to sign in instead
      console.log('🔄 Trying to sign in with existing account...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@aurora.com',
        password: 'testpassword123',
      })
      
      if (signInError) {
        console.error('❌ Sign in failed:', signInError.message)
      } else {
        console.log('✅ Successfully signed in!')
        console.log('📧 Email:', signInData.user?.email)
        console.log('🔑 User ID:', signInData.user?.id)
      }
    } else {
      console.log('✅ Account created successfully!')
      console.log('📧 Email:', data.user?.email)
      console.log('🔑 User ID:', data.user?.id)
      console.log('📬 Check your email for confirmation (if email confirmation is enabled)')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
createTestAccount()
