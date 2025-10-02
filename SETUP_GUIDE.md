# TUG Lobbies - Supabase & Discord Setup Guide

## 🗄️ Step 1: Set Up Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for database to initialize

2. **Run the Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL to create all tables and policies

3. **Get Your Supabase Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon/public key
   - Update your `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 🎮 Step 2: Configure Discord OAuth

1. **Create a Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Name it "TUG Lobbies"

2. **Configure OAuth2**
   - Go to OAuth2 → General
   - Add Redirect URL: `http://localhost:5173/auth/callback` (development)
   - Copy Client ID and update `.env`:
   ```
   VITE_DISCORD_CLIENT_ID=your_discord_client_id_here
   ```

3. **Add Bot to Your Server**
   - Go to OAuth2 → URL Generator
   - Select "bot" and "applications.commands" scopes
   - Select permissions: Send Messages, Read Messages, Manage Roles
   - Use the generated URL to add bot to your server

## 🔧 Step 3: Environment Configuration

Update your `.env` file with actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Discord Configuration  
VITE_DISCORD_CLIENT_ID=your-discord-client-id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

## 🚀 Step 4: Test the Integration

1. **Start your development server**
2. **Navigate to the Discord tab** in your app
3. **Click "Link Discord"** to test OAuth flow
4. **Verify database records** in Supabase dashboard

## 🛠️ Troubleshooting

### Common Issues:

1. **"relation does not exist" error**
   - Make sure you ran the SQL schema in Supabase
   - Check that tables were created in the database

2. **Discord OAuth errors**
   - Verify redirect URI matches exactly
   - Check client ID is correct
   - Ensure bot has proper permissions

3. **Supabase connection issues**
   - Verify project URL and anon key
   - Check network connectivity
   - Ensure CORS is configured in Supabase

## 📊 Verification Checklist

- [ ] Supabase tables created successfully
- [ ] Environment variables configured
- [ ] Discord OAuth application created
- [ ] Bot added to Discord server
- [ ] Authentication flow works
- [ ] Database records are being created