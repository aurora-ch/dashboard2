# Aurora Dashboard Setup Guide

## Prerequisites

Before running the application, you need to set up the required environment variables.

## Environment Setup

### 1. Create Environment File

Copy the example environment file and configure it with your actual values:

```bash
cp .env.example .env.local
```

### 2. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy your Project URL and anon/public key
5. Update `.env.local` with these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create the required tables and policies

### 4. Optional: Configure Additional Services

#### Vapi (AI Receptionist)
If you plan to use the AI receptionist functionality:
```env
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_URL=your_webhook_url
```

#### Google Maps
For location services:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Troubleshooting

### "Invalid supabaseUrl" Error
This error occurs when the Supabase environment variables are not properly configured. Make sure:
- `.env.local` file exists in the project root
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- The values are correct (no extra spaces, proper URL format)

### Database Connection Issues
- Verify your Supabase project is active
- Check that the database schema has been applied
- Ensure RLS policies are properly configured

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and Supabase client configuration
- `supabase-schema.sql` - Database schema for Supabase
