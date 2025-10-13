# Aurora Dashboard - AI Receptionist Platform

A modern dashboard for managing AI receptionists for small businesses. Built with Next.js, Supabase, and integrated with Google Places API and Vapi.

## Features

- 🔐 **Authentication**: Email magic link + Google OAuth
- 🏢 **Business Setup**: Google Places Autocomplete integration
- 🤖 **AI Receptionist**: Create and manage Vapi agents
- 📊 **Dashboard**: Daily metrics, call summaries, status monitoring
- 📞 **Call Logs**: View conversations with text and audio
- ⚙️ **Settings**: Fallback contacts, custom notes, opening hours
- 🎨 **Modern UI**: Glassmorphism design with dark/light themes

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **Integrations**: Google Places API, Vapi API, n8n webhooks
- **Styling**: Glassmorphism effects, responsive design

## Quick Start

### 1. Clone and Install

```bash
cd "/Users/Eric.AELLEN/Documents/A - projets pro/AURORA/dashboard /1.0/aurora-dashboard"
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Vapi API
VAPI_API_KEY=your_vapi_api_key

# n8n Webhook (already configured)
N8N_WEBHOOK_URL=https://n8n.goreview.fr/webhook/623986cb-0aac-4af5-8135-d6da55814b95
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of supabase-schema.sql and run in Supabase
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/signin`.

## Project Structure

```
aurora-dashboard/
├── app/
│   ├── (app)/                 # Protected dashboard routes
│   │   ├── dashboard/         # Main dashboard with metrics
│   │   ├── logs/             # Call logs and conversations
│   │   ├── receptionist/     # AI receptionist setup
│   │   ├── settings/         # Account settings
│   │   └── layout.tsx        # Dashboard layout with sidebar
│   ├── (auth)/               # Authentication routes
│   │   └── signin/           # Sign in page
│   ├── api/                  # API routes
│   │   ├── call/             # Trigger n8n webhook for calls
│   │   └── create-agent/     # Create Vapi agent via n8n
│   └── layout.tsx            # Root layout with theme provider
├── components/
│   ├── google-places-autocomplete.tsx  # Google Places integration
│   ├── theme-toggle.tsx      # Dark/light theme toggle
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase-browser.ts   # Client-side Supabase
│   ├── supabase-server.ts    # Server-side Supabase
│   └── utils.ts              # Utility functions
└── supabase-schema.sql       # Database schema
```

## Key Features Explained

### 🔐 Authentication
- Email magic link authentication
- Google OAuth integration
- Protected routes with middleware
- User profiles linked to organizations

### 🏢 Business Setup
- Google Places Autocomplete for business search
- Automatic business information extraction
- Integration with your existing n8n workflow
- Vapi agent creation and management

### 📊 Dashboard
- Real-time metrics (handled/missed calls, duration, cost)
- AI receptionist status monitoring
- Daily call summaries with filtering
- Action tracking and call outcomes

### 📞 Call Logs
- Complete conversation transcripts
- Audio playback and download
- Call filtering by date and status
- Integration with Vapi API for detailed logs

### ⚙️ Settings
- Business information management
- Fallback contact configuration
- Custom notes for AI context
- Opening hours setup
- Real-time settings sync

## API Endpoints

### POST `/api/create-agent`
Creates a Vapi agent via n8n webhook.

**Request:**
```json
{
  "name": "Business Name",
  "address": "Business Address",
  "website": "https://business.com",
  "phone": "+1234567890",
  "place_id": "google_place_id",
  "types": "business_type"
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "vapi_agent_id",
  "message": "Agent created successfully"
}
```

### POST `/api/call`
Triggers a call via n8n webhook.

**Request:**
```json
{
  "agentId": "vapi_agent_id"
}
```

## Database Schema

The database includes tables for:
- `organizations` - Business organizations
- `receptionist_settings` - AI receptionist configuration
- `call_logs` - Call history and transcripts
- `daily_metrics` - Cached daily statistics
- `user_profiles` - User account information

## Integration Workflow

1. **User signs up** → Creates organization and profile
2. **Business setup** → Google Places search → n8n webhook → Vapi agent creation
3. **Call management** → n8n webhook → Vapi API → Call logs stored
4. **Dashboard** → Real-time metrics and call summaries
5. **Settings** → Fallback contacts and custom notes

## Development

### Adding New Features
1. Create new pages in `app/(app)/`
2. Add API routes in `app/api/`
3. Update database schema if needed
4. Add components in `components/`

### Styling
- Uses Tailwind CSS with glassmorphism effects
- Dark/light theme support via next-themes
- Responsive design with mobile-first approach

### Database Changes
- Update `supabase-schema.sql`
- Run migrations in Supabase
- Update TypeScript interfaces

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Other Platforms
- Ensure Node.js 18+ support
- Set all environment variables
- Configure Supabase CORS settings

## Troubleshooting

### Common Issues

1. **Google Places not loading**
   - Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Enable Places API in Google Cloud Console

2. **Supabase auth errors**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check Supabase project settings

3. **n8n webhook failures**
   - Verify `N8N_WEBHOOK_URL` is correct
   - Check n8n workflow is active

4. **Database connection issues**
   - Run the SQL schema in Supabase
   - Check RLS policies are enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private project for Aurora AI Receptionist platform.

## Support

For issues or questions, contact the development team.