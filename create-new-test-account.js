// Create New Test Account Script
// This creates a new account that should work without email confirmation

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dkgkqcngqqknyznrsmnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ2txY25ncXFrbnl6bnJzbW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDAyNDQsImV4cCI6MjA3NTc3NjI0NH0.ffPfkyWedtVpiWo3jRsglRekPSPSYD7N-tqEB_erVL0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createNewTestAccount() {
  console.log('🔐 Creating new test account...')
  
  const testAccounts = [
    { email: 'demo@aurora.com', password: 'demo123' },
    { email: 'admin@aurora.com', password: 'admin123' },
    { email: 'user@aurora.com', password: 'user123' }
  ]
  
  for (const account of testAccounts) {
    try {
      console.log(`\n🔄 Trying to create account: ${account.email}`)
      
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })
      
      if (error) {
        console.log(`❌ Error creating ${account.email}:`, error.message)
        
        // Try to sign in instead
        console.log(`🔄 Trying to sign in with ${account.email}...`)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        })
        
        if (signInError) {
          console.log(`❌ Sign in failed for ${account.email}:`, signInError.message)
        } else {
          console.log(`✅ Successfully signed in with ${account.email}!`)
          console.log(`📧 Email: ${signInData.user?.email}`)
          console.log(`🔑 User ID: ${signInData.user?.id}`)
          console.log(`✅ Email confirmed: ${signInData.user?.email_confirmed_at ? 'Yes' : 'No'}`)
          return account
        }
      } else {
        console.log(`✅ Account created successfully: ${account.email}`)
        console.log(`📧 Email: ${data.user?.email}`)
        console.log(`🔑 User ID: ${data.user?.id}`)
        console.log(`📬 Email confirmation required: ${data.user?.email_confirmed_at ? 'No' : 'Yes'}`)
        
        if (data.user?.email_confirmed_at) {
          console.log(`🎉 Account is ready to use!`)
          return account
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error with ${account.email}:`, error)
    }
  }
  
  console.log('\n❌ All test accounts failed. Please check Supabase email confirmation settings.')
}

// Run the script
createNewTestAccount()
