# Render Deployment Setup

## 🚀 Quick Setup Using Secret Files (RECOMMENDED)

The easiest way to configure your Render deployment is using Secret Files.

### Step 1: Upload Secret File

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Select your `aurora-dashboard` service
3. Navigate to the **"Environment"** tab
4. Scroll down to the **"Secret Files"** section
5. Click **"Add Secret File"**
6. Configure the secret file:
   - **Filename**: `.env`
   - **Contents**: Copy and paste the contents from `.env.render` file in your project
7. Click **"Save Changes"**
8. **Redeploy** your service

### Step 2: Verify Deployment

After redeployment:
- Your app will automatically load environment variables from the `.env` secret file
- Test Google OAuth login
- Verify dashboard loads correctly

---

## 📋 Alternative: Manual Environment Variables

If you prefer to set environment variables manually instead of using Secret Files:

### Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://kqdiickzowoffpleavfh.supabase.co`
   - Get this from your Supabase project settings

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon key
   - Get this from your Supabase project settings

3. **NEXT_PUBLIC_SITE_URL**
   - Value: `https://aurora-dashboard.onrender.com`
   - This is already configured in render.yaml

### Optional Environment Variables

4. **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
   - For Google Maps/Places integration

5. **VAPI_API_KEY**
   - For Vapi AI receptionist integration

6. **N8N_WEBHOOK_URL**
   - For n8n workflow integration

### How to Set Manual Environment Variables

1. Go to your Render dashboard
2. Navigate to your `aurora-dashboard` service
3. Go to the "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable with its key and value
6. Click "Save Changes"
7. Redeploy your service

---

## 🔐 Security Notes

- **Secret Files** are more secure than environment variables for sensitive data
- Secret files are accessible at `/etc/secrets/.env` at runtime
- Never commit `.env.render` to your repository (it's in .gitignore)
- Only use the `anon` key in the frontend (never use `service_role` key)

---

## 📦 Files Included for Render

- `.env.render` - Secret file template with your Supabase credentials
- `render.yaml` - Render service configuration

---

## 🧪 Testing After Deployment

After setting up and redeploying:

1. ✅ **OAuth Login**: Test Google sign-in flow
2. ✅ **Dashboard**: Verify metrics and data load correctly
3. ✅ **Database**: Ensure user profiles are created in Supabase
4. ✅ **API Routes**: Test agent creation and call logging

---

## 🐛 Troubleshooting

### "Configuration Required" Error

If you see this error:
- Verify the Secret File was uploaded correctly
- Check the filename is exactly `.env` (not `.env.local`)
- Ensure the file contents match the format in `.env.render`
- Redeploy after making changes

### Database Connection Issues

- Verify Supabase URL and key are correct
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

### OAuth Not Working

- Check that redirect URLs are configured in Supabase
- Verify `NEXT_PUBLIC_SITE_URL` matches your Render URL
- Ensure Google OAuth is enabled in Supabase
