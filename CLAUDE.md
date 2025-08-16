# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 hackathon template with Supabase authentication, AI integration (Claude API), and shadcn/ui components. Built for rapid prototyping with TypeScript, Tailwind CSS, and production-ready infrastructure.

## Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Component management
npm run ui-add       # Add new shadcn/ui components

# Quick deployment
npm run deploy       # Git add, commit, push (for auto-deploy)
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with CSS variables for theming
- **Auth**: Supabase Auth with email/password and GitHub OAuth
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: Anthropic Claude API with streaming responses
- **Components**: shadcn/ui component library
- **State Management**: React hooks with Supabase real-time subscriptions

### Directory Structure
- `app/` - Next.js app router pages and API routes
  - `(auth)/` - Public authentication pages (login, signup, forgot-password, reset-password)
  - `(dashboard)/` - Protected dashboard area with sidebar layout
  - `api/ai/` - Claude AI endpoint with streaming support
  - `auth/callback/` - OAuth callback handler
- `components/` - React components
  - `ui/` - shadcn/ui components (pre-installed)
  - `auth-button.tsx` - Dynamic auth state button
  - `providers.tsx` - Theme and toast providers
- `hooks/` - Custom React hooks
  - `use-user.tsx` - Auth state management
  - `use-toast.ts` - Toast notifications
- `lib/` - Utility functions and configurations
  - `supabase/` - Supabase client configurations (client, server, middleware)
  - `utils.ts` - Helper functions including `cn()` for class names

### Key Patterns

#### Authentication Flow
- Middleware (`middleware.ts`) handles session refresh on all routes
- Server components use `createClient()` from `lib/supabase/server.ts`
- Client components use `createClient()` from `lib/supabase/client.ts`
- Protected routes check auth in server components and redirect if not authenticated
- `useUser()` hook provides auth state in client components

#### Database Access
- All database operations go through Supabase client
- Row Level Security (RLS) policies enforce user-based access control
- Real-time subscriptions available for live updates
- TypeScript types can be generated from database schema

#### AI Integration
- `/api/ai/route.ts` handles Claude API requests
- Supports streaming responses using Vercel AI SDK
- Requires `ANTHROPIC_API_KEY` environment variable
- Default model: claude-3-5-sonnet-20241022

## Environment Variables

Required in `.env.local`:
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Anthropic AI (Optional - needed for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE

# GitHub OAuth (Optional)
# Configure in Supabase Dashboard under Authentication > Providers
```

## Code Conventions

### Import Aliases
- Use `@/` for absolute imports from project root
- Example: `import { Button } from '@/components/ui/button'`

### Component Patterns
- Server Components by default (no "use client" directive)
- Add "use client" only when needed (hooks, browser APIs, event handlers)
- Use shadcn/ui components from `@/components/ui/`
- Apply styles using Tailwind classes with `cn()` helper for conditional classes

### TypeScript
- Strict mode enabled
- Define interfaces for component props and data structures
- Use `type` for unions/intersections, `interface` for object shapes

### Styling
- Tailwind CSS for all styling
- CSS variables defined in `globals.css` for theming
- Dark mode support via `next-themes` provider
- Use `cn()` from `lib/utils.ts` for merging class names

### Database Schema
When creating new tables:
1. Always enable Row Level Security (RLS)
2. Create appropriate policies for user access
3. Use UUID for primary keys
4. Include `created_at` and `updated_at` timestamps
5. Reference `auth.users(id)` for user relationships

## Testing Approach

No test framework is currently configured. When adding tests:
1. Check with user for preferred testing framework
2. Common options: Jest, Vitest, or Playwright for E2E
3. Update this section once testing is configured

## Quick Reference

### Add a New Page
1. Create directory in `app/` following Next.js conventions
2. Add `page.tsx` for the route
3. Use server components by default
4. Add to sidebar navigation if in dashboard area

### Add Database Table
1. Create migration in Supabase SQL editor
2. Enable RLS and create policies
3. Generate TypeScript types if needed
4. Create data fetching functions

### Implement Protected Route
Server component:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Protected content
}
```

### Stream AI Response
Use the existing `/api/ai` endpoint with fetch or Vercel AI SDK's `useChat` hook.

## Additional Resources

- `speed-snippets.md` - Copy-paste code patterns for common features
- `README.md` - Detailed setup instructions and deployment guide