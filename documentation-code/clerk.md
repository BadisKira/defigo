# Clerk Authentication Documentation

## Overview
This document provides comprehensive Clerk authentication patterns for the **deKliK** platform, based on our current implementation and Clerk best practices.

## Current Implementation

### Configuration
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Middleware Configuration
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define admin routes that require specific role checks
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Admin route protection - check for admin role in metadata
  if (isAdminRoute(req)) {
    if (!userId || sessionClaims?.metadata?.role !== 'admin') {
      const url = new URL('/', req.url)
      return NextResponse.redirect(url)
    }
  }

  // Allow public access to webhook routes (required for Clerk webhooks)
  // This is handled by the default behavior when no explicit protection is added
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

## Server-Side Authentication

### 1. **Server Components & Route Handlers**
```typescript
// Server Component Example
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  // Get minimal auth info
  const { userId } = await auth()
  
  if (!userId) {
    return <div>Please sign in to view this page</div>
  }

  // Get full user object when needed
  const user = await currentUser()
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>User ID: {userId}</p>
    </div>
  )
}
```

### 2. **API Route Protection**
```typescript
// app/api/challenges/route.ts
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get user data if needed
  const user = await currentUser()
  
  // Your API logic here
  return NextResponse.json({ userId, user })
}
```

## Client-Side Authentication

### 1. **React Hooks**
```typescript
'use client'
import { useAuth, useUser } from '@clerk/nextjs'

export default function ClientComponent() {
  // Minimal auth data (fast)
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  
  // Full user data (slower, cached)
  const { user, isSignedIn } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Session: {sessionId}</p>
    </div>
  )
}
```

## Webhook Integration

### 1. **User Lifecycle Webhook**
```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabase'

export async function POST(req: Request) {
  // Verify webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SIGNING_SECRET to .env')
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  const payload = await req.text()
  const body = JSON.parse(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', { status: 400 })
  }

  // Handle the webhook event
  const eventType = evt.type
  const supabase = createSupabaseServiceRoleClient()

  switch (eventType) {
    case 'user.created':
      // Sync user to Supabase
      const { id, email_addresses, first_name, last_name, image_url } = evt.data
      
      await supabase.from('users').insert({
        clerk_user_id: id,
        email: email_addresses[0]?.email_address,
        first_name,
        last_name,
        avatar_url: image_url,
        created_at: new Date().toISOString(),
      })
      break

    case 'user.updated':
      // Update user in Supabase
      await supabase
        .from('users')
        .update({
          email: evt.data.email_addresses[0]?.email_address,
          first_name: evt.data.first_name,
          last_name: evt.data.last_name,
          avatar_url: evt.data.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', evt.data.id)
      break

    case 'user.deleted':
      // Handle user deletion
      if (evt.data.id) {
        await supabase
          .from('users')
          .delete()
          .eq('clerk_user_id', evt.data.id)
      }
      break

    default:
      console.log(`Unhandled webhook event: ${eventType}`)
  }

  return new Response('Success', { status: 200 })
}
```

## Advanced Patterns

### 1. **Onboarding Flow**
```typescript
// middleware.ts - Enhanced with onboarding
const isOnboardingRoute = createRouteMatcher(['/onboarding'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // Allow onboarding route access
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // Force onboarding for users without completion flag
  if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    const onboardingUrl = new URL('/onboarding', req.url)
    return NextResponse.redirect(onboardingUrl)
  }
})
```

### 2. **Role-Based Access Control (RBAC)**
```typescript
// Check user roles in components
'use client'
import { useAuth } from '@clerk/nextjs'

export default function AdminPanel() {
  const { sessionClaims } = useAuth()
  
  const userRole = sessionClaims?.metadata?.role
  
  if (userRole !== 'admin') {
    return <div>Access denied. Admin role required.</div>
  }

  return <div>Admin content here</div>
}
```

### 3. **Custom Claims & Metadata**
```typescript
// Update user metadata programmatically
import { clerkClient } from '@clerk/nextjs/server'

export async function updateUserRole(userId: string, role: string) {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: role,
      onboardingComplete: true,
    },
  })
}
```

## Integration with Supabase

### 1. **Authenticated Supabase Client**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function createSupabaseClient() {
  const { getToken } = await auth()
  
  const supabaseAccessToken = await getToken({
    template: 'supabase'
  })

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
    }
  )
}
```

### 2. **Row Level Security (RLS)**
```sql
-- Supabase RLS Policy Example
CREATE POLICY "Users can only see their own challenges" ON challenges
FOR SELECT USING (
  auth.jwt() ->> 'sub' = user_id::text
);
```

## Environment Variables

Required environment variables for Clerk integration:

```env
# Clerk Configuration
CLERK_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Supabase Integration (for JWT template)
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

## Best Practices for deKliK

1. **Always use server-side auth for sensitive operations** - Payment processing, challenge updates
2. **Implement proper webhook verification** - Use svix for signature validation
3. **Sync user data efficiently** - Only sync necessary fields to Supabase
4. **Handle authentication states gracefully** - Loading states, unauthenticated fallbacks
5. **Use role-based access control** - Admin routes, user permissions
6. **Implement proper error handling** - Network errors, webhook failures

## Testing Authentication

### Development Setup
```typescript
// Test authentication in development
import { auth } from '@clerk/nextjs/server'

export async function testAuth() {
  const { userId, sessionClaims } = await auth()
  
  console.log('User ID:', userId)
  console.log('Session Claims:', sessionClaims)
  console.log('User Role:', sessionClaims?.metadata?.role)
}
```

## French Localization

Since deKliK is in French, customize Clerk's UI:

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from '@clerk/localizations'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

## Common Authentication Flows

### 1. **Challenge Creation Flow**
```
User Authentication Check → 
Create Challenge (draft) → 
Payment Processing → 
Update Challenge Status (active)
```

### 2. **Admin Access Flow**
```
User Login → 
Role Check (admin) → 
Admin Dashboard Access → 
Protected Operations
```

This documentation provides a comprehensive guide for implementing and maintaining Clerk authentication in the deKliK platform, ensuring secure user management and proper integration with our existing Supabase backend.