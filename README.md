# Aurora - AI Receptionist Dashboard

A simple, modern dashboard for testing AI receptionist functionality with Google authentication powered by Supabase.

## Features

- 🔐 Google OAuth authentication via Supabase
- 🎨 Beautiful, modern UI with Tailwind CSS
- 📱 Responsive design for all devices
- 🤖 AI receptionist testing interface
- ⚡ Fast and lightweight (Next.js 14 + TypeScript)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oknakvgnwxlkvhwmocno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbmFrdmdud3hsa3Zod21vY25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTE5ODksImV4cCI6MjA3NjI2Nzk4OX0.RnSpDsGRs_Wu8KsJtz2Ijx4JhWXEAWBdCeH9RQciR5U
```

### 3. Configure Supabase Authentication

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your OAuth credentials from Google Cloud Console
5. Add authorized redirect URLs in Supabase (under Authentication > URL Configuration):
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
aurora-dashboard/
├── app/
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard page (protected)
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page with login
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── .env.local               # Environment variables (create this)
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## Key Files Explained

- **`app/page.tsx`**: Landing page with Google login button
- **`app/dashboard/page.tsx`**: Main dashboard where users test AI receptionist
- **`lib/supabase.ts`**: Supabase client setup
- **`app/globals.css`**: Global styles and Tailwind imports

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs in Google Console:
   - `https://oknakvgnwxlkvhwmocno.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Backend as a service (Auth, Database)
- **React**: UI library

## Support

For issues or questions, contact your development team.

## License

Proprietary - Aurora AI Receptionist Company

# dashboard
