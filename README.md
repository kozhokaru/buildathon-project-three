# 🚀 Hackathon Speed-Run Template

**Build 5 polished web apps in 5 hours.** This is your secret weapon for hackathons - a production-ready Next.js template with everything pre-configured.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ecf8e?style=flat-square&logo=supabase)

## ✨ Features

### Core Infrastructure
- 🔐 **Authentication System** - Complete auth flow with email/password + GitHub OAuth
- 🤖 **AI Integration** - Claude API with streaming responses and function calling
- 🎨 **Component Library** - 10+ shadcn/ui components with dark mode support
- 📊 **Dashboard Template** - Protected routes with responsive sidebar navigation
- 🔥 **Type Safety** - Full TypeScript with proper types and error handling
- ⚡ **Performance** - Server components, streaming SSR, edge runtime ready
- 📱 **Responsive Design** - Mobile-first with beautiful animations

### Pre-Built Pages
- **Landing Page** - Modern gradient hero, feature cards, CTA sections
- **Authentication** - Login/Signup with validation and error handling
- **Dashboard** - Analytics cards, activity feed, quick actions
- **API Routes** - AI endpoint with rate limiting and auth checks

## 🏃‍♂️ Quick Start (2 minutes)

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Anthropic API key (optional for AI features)

### 1. Clone & Install

```bash
# Clone the template
git clone https://github.com/yourusername/hackathon-template.git my-app
cd my-app

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your keys
3. Configure GitHub OAuth (optional):
   - Enable GitHub in **Authentication → Providers**
   - Create OAuth App at [github.com/settings/applications/new](https://github.com/settings/applications/new)
   - Add Client ID & Secret to Supabase
   - Set callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Run the database migrations (see Database Setup below)

### 3. Configure Environment

Edit `.env.local`:
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Anthropic AI (Optional)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
hackathon-template/
├── app/
│   ├── (auth)/               # Authentication pages
│   │   ├── login/           # Login page with GitHub OAuth
│   │   ├── signup/          # Signup with validation
│   │   ├── forgot-password/ # Password reset request
│   │   └── reset-password/  # Set new password
│   ├── (dashboard)/          # Protected dashboard area
│   │   └── dashboard/
│   │       ├── layout.tsx   # Sidebar navigation
│   │       └── page.tsx     # Dashboard home
│   ├── api/
│   │   └── ai/              # Claude AI endpoint
│   │       └── route.ts     # Streaming responses
│   ├── auth/
│   │   └── callback/        # OAuth callback handler
│   ├── globals.css          # Tailwind styles
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx       # Buttons with variants
│   │   ├── card.tsx         # Card layouts
│   │   ├── dialog.tsx       # Modal dialogs
│   │   ├── input.tsx        # Form inputs
│   │   ├── toast.tsx        # Notifications
│   │   └── ...              # More components
│   ├── auth-button.tsx      # Dynamic auth state button
│   └── providers.tsx        # Theme & toast providers
├── hooks/
│   ├── use-user.tsx         # Auth state hook
│   └── use-toast.ts         # Toast notifications
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware
│   └── utils.ts             # Helper functions
├── middleware.ts            # Route protection
├── speed-snippets.md        # Copy-paste code blocks
└── package.json             # Dependencies & scripts
```

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run ui-add   # Add shadcn/ui components
npm run deploy   # Git add, commit, push (auto-deploy)
```

## 🎨 Pre-installed Components

All these shadcn/ui components are ready to use:

| Component | Usage | Import |
|-----------|-------|--------|
| **Button** | Interactive elements | `@/components/ui/button` |
| **Card** | Content containers | `@/components/ui/card` |
| **Dialog** | Modal windows | `@/components/ui/dialog` |
| **Input** | Form inputs | `@/components/ui/input` |
| **Label** | Form labels | `@/components/ui/label` |
| **Toast** | Notifications | `@/components/ui/toast` |
| **Avatar** | User avatars | `@/components/ui/avatar` |
| **Badge** | Status indicators | `@/components/ui/badge` |
| **Dropdown** | Menu dropdowns | `@/components/ui/dropdown-menu` |
| **Skeleton** | Loading states | `@/components/ui/skeleton` |
| **Table** | Data tables | `@/components/ui/table` |
| **ScrollArea** | Scrollable areas | `@/components/ui/scroll-area` |

## 📚 Common Patterns

### Protected Pages

#### Client Component
```tsx
"use client"
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'

export default function ProtectedPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <Skeleton />
  if (!user) return null

  return <div>Protected content</div>
}
```

#### Server Component
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ServerProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Protected content for {user.email}</div>
}
```

### Database Operations

#### Fetch Data
```tsx
const supabase = createClient()
const { data, error } = await supabase
  .from('items')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Insert Data
```tsx
const { data, error } = await supabase
  .from('items')
  .insert([{ name, user_id: user.id }])
  .select()
  .single()
```

#### Real-time Subscriptions
```tsx
useEffect(() => {
  const channel = supabase
    .channel('items-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'items'
    }, (payload) => {
      // Handle real-time updates
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

### AI Integration

#### Streaming Chat
```tsx
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello Claude!' }
    ],
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7
  })
})

// Handle streaming response
const reader = response.body?.getReader()
// ... process stream
```

#### Using with Vercel AI SDK
```tsx
import { useChat } from 'ai/react'

export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/ai',
  })

  return (
    // Your chat UI
  )
}
```

## 🗄️ Database Setup

### Create Tables (Supabase SQL Editor)

```sql
-- Users profile table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: Items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Automatic profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Then use in your code:
```tsx
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type InsertItem = Database['public']['Tables']['items']['Insert']
```

## 🎨 Customization

### Theme Colors

Edit `app/globals.css`:
```css
:root {
  --primary: 346.8 77.2% 49.8%;     /* Rose */
  --secondary: 240 4.8% 95.9%;      /* Gray */
  --accent: 240 4.8% 95.9%;         /* Gray */
  --background: 0 0% 100%;          /* White */
  --foreground: 240 10% 3.9%;       /* Dark */
}

.dark {
  --primary: 346.8 77.2% 49.8%;     /* Rose */
  --background: 20 14.3% 4.1%;      /* Dark */
  --foreground: 0 0% 95%;           /* Light */
}
```

### Add Sidebar Items

Edit `app/(dashboard)/dashboard/layout.tsx`:
```tsx
const sidebarItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Your Feature", href: "/dashboard/feature", icon: YourIcon },
  // Add more items
]
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `ANTHROPIC_API_KEY` | ❌ | Claude AI API key |

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
# Auto-deploy with Git
npm run deploy
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Auth not working** | Check Supabase URL and keys in `.env.local` |
| **AI endpoint 500** | Verify `ANTHROPIC_API_KEY` is set and has credits |
| **Styles not loading** | Clear `.next` folder: `rm -rf .next` |
| **Build errors** | Run `npm install` and check Node version (18+) |
| **Database errors** | Check RLS policies and user permissions |

### Debug Mode

Add to `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

Check browser console and terminal for detailed logs.

## 📖 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)

### Code Snippets
Check `speed-snippets.md` for 50+ copy-paste solutions:
- Forms with validation
- Data tables with sorting
- Modal dialogs
- Real-time updates
- File uploads
- And much more!

## 🎯 Hackathon Tips

1. **Start Fast** - Clone and deploy within first 30 minutes
2. **Use Snippets** - Don't write boilerplate, copy from `speed-snippets.md`
3. **AI First** - Use Claude endpoint for complex logic
4. **Ship Early** - Deploy to Vercel and iterate
5. **Focus Features** - The boring stuff is done, build what's unique

## 🤝 Contributing

Found a bug or want to add a feature? PRs are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT - Use this to win hackathons!

## 🙏 Acknowledgments

Built with amazing open source projects:
- [Next.js](https://nextjs.org) by Vercel
- [Supabase](https://supabase.com) for auth & database
- [shadcn/ui](https://ui.shadcn.com) for components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Anthropic](https://anthropic.com) for Claude AI

---

**Built with ❤️ for hackathon warriors**

Need help? Check [speed-snippets.md](./speed-snippets.md) for instant solutions!

Star ⭐ this repo if it helps you ship faster!