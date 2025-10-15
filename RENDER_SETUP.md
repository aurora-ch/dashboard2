# Render Deployment Setup

## Environment Variables Required

To deploy successfully on Render, you need to set these environment variables in your Render dashboard:

### Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Get this from your Supabase project settings
   - Format: `https://your-project-id.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Get this from your Supabase project settings
   - This is the public anon key (safe to expose)

3. **NEXT_PUBLIC_SITE_URL**
   - Set to: `https://aurora-dashboard.onrender.com`
   - This is already configured in render.yaml

### Optional Environment Variables

4. **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
   - For Google Maps integration (if using)

5. **VAPI_API_KEY**
   - For Vapi integration (if using)

## How to Set Environment Variables in Render

1. Go to your Render dashboard
2. Navigate to your `aurora-dashboard` service
3. Go to the "Environment" tab
4. Add each environment variable with its value
5. Click "Save Changes"
6. Redeploy your service

## Current Status

The app will now work even without environment variables (using fallback values), but for full functionality you should configure the Supabase environment variables.

## Testing

After setting the environment variables:
1. The OAuth flow should work properly
2. The dashboard should load without errors
3. User profiles will be created in your Supabase database
