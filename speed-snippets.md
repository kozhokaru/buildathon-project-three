# Speed Snippets - Copy & Paste Code Blocks

Quick reference for common patterns in your hackathon project. Copy, paste, customize.

## Table of Contents
- [Database Operations](#database-operations)
- [Authentication](#authentication)
- [Forms with Validation](#forms-with-validation)
- [AI Chat Interface](#ai-chat-interface)
- [Data Tables](#data-tables)
- [Modal/Dialog Flows](#modaldialog-flows)
- [Real-time Updates](#real-time-updates)
- [File Upload](#file-upload)

## Database Operations

### Fetch Data with Loading State
```tsx
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

interface Item {
  id: string
  name: string
  created_at: string
}

export function ItemsList() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching items:', error)
      } else {
        setItems(data || [])
      }
      setLoading(false)
    }

    fetchItems()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg">
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### Create/Insert Data
```tsx
async function createItem(name: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .insert([{ name, user_id: user.id }])
    .select()
    .single()
  
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  } else {
    toast({
      title: "Success",
      description: "Item created successfully",
    })
    // Refresh data or update state
  }
  return data
}
```

### Update Data
```tsx
async function updateItem(id: string, updates: Partial<Item>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  } else {
    toast({
      title: "Success",
      description: "Item updated successfully",
    })
  }
  return data
}
```

### Delete Data
```tsx
async function deleteItem(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
  
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  } else {
    toast({
      title: "Success",
      description: "Item deleted successfully",
    })
  }
}
```

## Authentication

### Protected Page Component
```tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { Loader2 } from 'lucide-react'

export default function ProtectedPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div>
      {/* Your protected content */}
      <h1>Welcome, {user.email}</h1>
    </div>
  )
}
```

### Server-Side Auth Check
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedServerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
    </div>
  )
}
```

## Forms with Validation

### Complete Form with Zod & React Hook Form
```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
})

type FormData = z.infer<typeof formSchema>

export function CreateItemForm() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: FormData) {
    try {
      // Your API call here
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create item')

      toast({
        title: "Success",
        description: "Item created successfully",
      })
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title")}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register("description")}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Item"
        )}
      </Button>
    </form>
  )
}
```

## AI Chat Interface

### Complete Claude Chat Component
```tsx
"use client"

import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, User, Bot } from 'lucide-react'

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai',
  })

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    message.role === 'user' ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="border-t p-4 flex gap-2"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  )
}
```

### Claude Function Calling
```tsx
// app/api/ai/functions/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const tools = {
  getWeather: {
    description: 'Get the weather for a location',
    parameters: z.object({
      location: z.string().describe('The location to get weather for'),
    }),
    execute: async ({ location }: { location: string }) => {
      // Your weather API call here
      return { temperature: 72, condition: 'sunny' }
    },
  },
  searchDatabase: {
    description: 'Search the database for items',
    parameters: z.object({
      query: z.string().describe('The search query'),
      limit: z.number().optional().default(10),
    }),
    execute: async ({ query, limit }: { query: string; limit: number }) => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('items')
        .select('*')
        .textSearch('name', query)
        .limit(limit)
      return data
    },
  },
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages,
    tools,
    maxSteps: 5,
  })

  return Response.json(result)
}
```

## Data Tables

### Sortable, Filterable Data Table
```tsx
"use client"

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search } from "lucide-react"

interface DataItem {
  id: string
  name: string
  status: string
  created_at: string
}

export function DataTable() {
  const [data, setData] = useState<DataItem[]>([])
  const [filteredData, setFilteredData] = useState<DataItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof DataItem>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Fetch data on mount
  useEffect(() => {
    // Fetch your data here
    setData([]) // Replace with actual data
    setFilteredData([]) // Replace with actual data
  }, [])

  // Filter data when search term changes
  useEffect(() => {
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredData(filtered)
  }, [searchTerm, data])

  // Sort function
  const handleSort = (field: keyof DataItem) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(direction)

    const sorted = [...filteredData].sort((a, b) => {
      if (direction === 'asc') {
        return a[field] > b[field] ? 1 : -1
      }
      return a[field] < b[field] ? 1 : -1
    })
    setFilteredData(sorted)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0"
              >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0"
              >
                Created
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

## Modal/Dialog Flows

### Confirmation Dialog
```tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function DeleteConfirmDialog({ 
  itemId, 
  onDelete 
}: { 
  itemId: string
  onDelete: (id: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await onDelete(itemId)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the item
            and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Form Modal
```tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Plus } from "lucide-react"

export function CreateItemDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Your create logic here
    console.log('Creating item:', formData)
    setOpen(false)
    setFormData({ name: '', description: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Real-time Updates

### Supabase Real-time Subscription
```tsx
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimeList() {
  const [items, setItems] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchItems = async () => {
      const { data } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setItems(data)
    }

    fetchItems()

    // Set up real-time subscription
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            ))
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg">
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

## File Upload

### Supabase Storage Upload
```tsx
"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Upload, Loader2 } from 'lucide-react'

export function FileUpload() {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file)

    if (uploadError) {
      toast({
        title: "Error",
        description: uploadError.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
      
      // Get public URL
      const { data } = supabase.storage
        .from('files')
        .getPublicUrl(filePath)
      
      console.log('Public URL:', data.publicUrl)
    }

    setUploading(false)
    setFile(null)
  }

  return (
    <div className="space-y-4">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={uploading}
        accept="image/*,application/pdf"
      />
      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </>
        )}
      </Button>
    </div>
  )
}
```

## Quick Tips

### Environment Variables
Always prefix client-side env vars with `NEXT_PUBLIC_`:
```bash
NEXT_PUBLIC_SUPABASE_URL=...  # Available in browser
SUPABASE_SERVICE_KEY=...      # Server-only
```

### TypeScript Types for Supabase
Generate types from your Supabase schema:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Then use them:
```tsx
import { Database } from '@/lib/database.types'

type Item = Database['public']['Tables']['items']['Row']
type InsertItem = Database['public']['Tables']['items']['Insert']
```

### Loading States Pattern
```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

// In your fetch function
try {
  setLoading(true)
  const result = await fetchData()
  setData(result)
} catch (err) {
  setError(err.message)
} finally {
  setLoading(false)
}
```

### Error Boundary
```tsx
"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### Optimistic Updates
```tsx
// Update UI immediately, then sync with server
const handleToggle = async (id: string, currentStatus: boolean) => {
  // Optimistic update
  setItems(prev => prev.map(item => 
    item.id === id ? { ...item, status: !currentStatus } : item
  ))

  // Server update
  const { error } = await supabase
    .from('items')
    .update({ status: !currentStatus })
    .eq('id', id)

  if (error) {
    // Revert on error
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: currentStatus } : item
    ))
    toast({ title: "Error", description: error.message, variant: "destructive" })
  }
}
```

## Deploy Checklist

1. **Environment Variables**: Set all vars in Vercel/hosting platform
2. **Database**: Run migrations, set up RLS policies
3. **Auth Providers**: Configure OAuth in Supabase dashboard
4. **Storage Buckets**: Create and configure in Supabase
5. **API Keys**: Ensure all keys are set and valid
6. **CORS**: Configure for your production domain
7. **Rate Limiting**: Set up for API routes
8. **Error Tracking**: Add Sentry or similar
9. **Analytics**: Add Vercel Analytics or similar
10. **SEO**: Update metadata, add sitemap.xml

---

**Pro Tip**: Keep this file open in a split screen while coding. Copy, paste, customize, ship! 🚀