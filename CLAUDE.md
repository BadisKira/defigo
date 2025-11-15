# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) and other AI assistants when working with code in this repository.

## Quick Reference

### Development Commands
- `npm run dev` - Start development server with Turbopack (hot reload enabled)
- `npm run build` - Build for production (type-checking, linting, optimization)
- `npm run start` - Start production server (requires build first)
- `npm run lint` - Run ESLint linting

### Key Paths
- **Pages**: `app/` - Next.js 15 App Router pages
- **Components**: `components/` - React components (ui/ for shadcn/ui)
- **Server Actions**: `lib/actions/` - Database operations with "use server"
- **Types**: `types/` - TypeScript type definitions
- **Validations**: `lib/validations/` - Zod validation schemas
- **Hooks**: `hooks/` - Custom React hooks
- **Utilities**: `lib/` - Supabase clients, Stripe, utility functions

---

## Architecture Overview

**deKliK** is a Next.js 15 personal challenge platform with financial commitment. Users create self-improvement challenges, pay upfront, and either receive a 96% refund on success or donate to charity on failure.

### Core Tech Stack

#### Framework & Runtime
- **Next.js 15.3.2** - App Router, React Server Components, Server Actions
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5** - Strict mode enabled
- **Turbopack** - Fast bundler for development

#### Authentication & Database
- **Clerk 6.20.1** - Authentication, user management, role-based access
- **Supabase 2.49.8** - PostgreSQL database, Row Level Security (RLS)
- **Stripe 18.2.0** - Payment processing, webhooks, refunds

#### UI & Styling
- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **shadcn/ui** - 37+ accessible components (Radix UI primitives)
- **next-themes 0.4.6** - Dark mode support
- **lucide-react 0.511.0** - Icon library
- **lottie-react 2.4.1** - Animations

#### Forms & Validation
- **React Hook Form 7.56.4** - Form state management
- **Zod 3.25.32** - Runtime type validation & schema validation
- **@hookform/resolvers 5.0.1** - Zod integration for forms

#### Additional Libraries
- **date-fns 4.1.0** - Date manipulation
- **svix 1.66.0** - Webhook signature verification (Clerk)
- **class-variance-authority 0.7.1** - Component variants
- **tailwind-merge 2.3.0** - Tailwind class merging

---

## Complete Directory Structure

```
/home/user/defigo/
│
├── app/                              # Next.js 15 App Router
│   ├── layout.tsx                   # Root layout (ClerkProvider, ThemeProvider)
│   ├── page.tsx                     # Landing page with hero, testimonials, CTAs
│   ├── globals.css                  # Global styles, Tailwind imports, CSS variables
│   ├── fonts.ts                     # Google Fonts (Inter, Montserrat, Manrope)
│   ├── favicon.ico
│   │
│   ├── (legal)/                     # Route group for legal pages
│   │   ├── cgu/page.tsx            # Terms of Service (Conditions Générales d'Utilisation)
│   │   ├── politique/page.tsx      # Privacy Policy (Politique de Confidentialité)
│   │   └── mention-legales/page.tsx # Legal Mentions
│   │
│   ├── sign-in/[[...sign-in]]/     # Clerk sign-in catch-all route
│   │   └── page.tsx
│   │
│   ├── sign-up/[[...sign-up]]/     # Clerk sign-up catch-all route
│   │   └── page.tsx
│   │
│   ├── defi/                        # Challenge creation & viewing
│   │   ├── page.tsx                # Create challenge form
│   │   └── [id]/                   # Dynamic route for individual challenge
│   │       ├── page.tsx            # Challenge detail view
│   │       └── payment/page.tsx    # Payment checkout page
│   │
│   ├── mon-aventure/                # User dashboard ("My Adventure")
│   │   └── page.tsx                # User's challenges, statistics, donations
│   │
│   ├── associations/                # Charity directory
│   │   └── page.tsx                # Browse & search associations
│   │
│   ├── admin/                       # Admin panel (role-protected)
│   │   └── page.tsx                # Admin dashboard
│   │
│   ├── payment/                     # Payment flow pages
│   │   ├── success/page.tsx        # Payment success redirect
│   │   └── cancel/page.tsx         # Payment cancelled redirect
│   │
│   └── api/                         # API routes
│       ├── create-checkout-session/
│       │   └── route.ts            # Stripe checkout session creation
│       └── webhooks/
│           ├── stripe/route.ts     # Stripe payment webhooks
│           └── clerk/route.ts      # Clerk user sync webhooks
│
├── components/                      # React components
│   ├── navbar.tsx                  # Main navigation (responsive, auth-aware)
│   ├── theme-provider.tsx          # next-themes dark mode provider
│   │
│   ├── ui/                         # shadcn/ui components (37 components)
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   │
│   ├── landing/                    # Landing page sections
│   │   ├── hero-section.tsx
│   │   ├── how-it-works.tsx
│   │   ├── partners-section.tsx
│   │   ├── testimonials-section.tsx
│   │   └── footer.tsx
│   │
│   ├── defi/                       # Challenge components
│   │   └── form.tsx               # Challenge creation form (React Hook Form + Zod)
│   │
│   ├── associations/               # Association components
│   │   └── association-search.tsx # Search & filter associations
│   │
│   ├── mon-aventure/               # Dashboard components
│   │   ├── challenges-table.tsx   # Challenges data table with actions
│   │   ├── challenges-filter.tsx  # Status filter tabs
│   │   ├── challenges-summary.tsx # Statistics cards
│   │   └── associations-donations.tsx # Donation history
│   │
│   └── payment/
│       └── payementPageClient.tsx # Payment page client component
│
├── lib/                            # Business logic & utilities
│   ├── supabase.ts                # Supabase client factory (2 clients)
│   ├── utils.ts                   # Utility functions (cn() for classnames)
│   ├── utils.role.ts              # Role checking utilities
│   │
│   ├── actions/                   # Server Actions ("use server")
│   │   ├── defi.actions.ts       # Challenge CRUD & lifecycle
│   │   ├── association.actions.ts # Association queries
│   │   └── user-challenges.actions.ts # User challenge queries
│   │
│   ├── validations/               # Zod schemas
│   │   └── defi.validations.ts   # Challenge validation schemas
│   │
│   └── stripe/                    # Stripe integration
│       ├── stripe.ts             # Stripe client initialization
│       ├── stripe-client.ts      # Client-side Stripe utilities
│       └── stripe-security.ts    # Security helpers, rate limiting
│
├── types/                          # TypeScript type definitions
│   ├── globals.d.ts               # Global type declarations (Clerk roles)
│   ├── enums.ts                   # French translations for status enums
│   ├── types.ts                   # Shared types (Association, WebhookEvent)
│   ├── challenge.types.ts         # Challenge entity & action result types
│   ├── challenge_feedback.types.ts # Challenge feedback types
│   ├── transaction.types.ts       # Transaction & payment types
│   └── user.types.ts              # User profile types
│
├── hooks/                          # Custom React hooks
│   ├── useAssocations.ts          # Association search & filter logic
│   └── use-debounce.ts            # Debounce hook for search inputs
│
├── public/                         # Static assets
│   └── *.svg                      # Logo, icons
│
├── docs/                           # Documentation
│   └── clerk-webhooks-setup.md    # Clerk webhook configuration guide
│
├── middleware.ts                   # Clerk authentication middleware
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── components.json                 # shadcn/ui configuration
├── eslint.config.mjs               # ESLint configuration
├── postcss.config.js               # PostCSS configuration
├── package.json                    # Dependencies & scripts
├── CLAUDE.md                       # This file
└── README.md                       # Project documentation
```

---

## Core Architecture Patterns

### 1. Dual Supabase Client Strategy

**Purpose**: Separate user-scoped operations (RLS) from privileged operations (admin, webhooks).

**Implementation** (`lib/supabase.ts`):

```typescript
// Regular Client - Used in Server Actions
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return ((await auth()).getToken())
      }
    }
  )
}

// Service Role Client - Used in Webhooks & Admin
export const createServiceRoleSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

**When to Use Each**:
- **Regular Client**: Server actions in `lib/actions/`, user-facing operations, respects RLS
- **Service Role Client**: Webhooks (`app/api/webhooks/`), admin operations, bypasses RLS

### 2. Server Actions Pattern

All database operations use Next.js Server Actions with consistent error handling.

**Standard Pattern** (`lib/actions/defi.actions.ts`):

```typescript
"use server";

export async function actionName(params: ValidatedParams): Promise<TypedResult> {
  // 1. Authentication check
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Utilisateur non authentifié.");
  }

  // 2. Zod validation (runtime type safety)
  const validated = schema.parse(params);

  // 3. Get user profile (map Clerk ID to Supabase user_id)
  const supabase = await createSupabaseClient();
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  // 4. Database operation
  const { data, error } = await supabase
    .from('table')
    .operation();

  // 5. Error handling
  if (error) {
    return { success: false, error: error.message };
  }

  // 6. Cache revalidation
  revalidatePath('/relevant-path');

  // 7. Typed response
  return { success: true, data };
}
```

**Key Server Actions**:
- `createChallenge(values)` - Create challenge in `draft` status
- `getChallenge(id)` - Fetch challenge with transaction, association, feedback
- `markChallengeAsSuccessful(params)` - Mark as validated, trigger refund/donation
- `markChallengeAsFailed(params)` - Mark as failed, trigger donation
- `deleteChallenge(id)` - Soft delete with transaction cleanup
- `getUserChallenges(filters)` - Get user's challenges with pagination
- `getUserChallengesSummary(userId)` - Aggregated statistics
- `getAssociations(filters)` - Query associations with search/filter

### 3. Form Validation Pattern (Zod + React Hook Form)

**Schema Definition** (`lib/validations/defi.validations.ts`):
```typescript
export const ChallengeFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  amount: z.coerce.number().min(10).max(500),
  duration_days: z.number().min(1).max(90),
  association_id: z.string().uuid(),
  // ...
});

export type ChallengeFormValues = z.infer<typeof ChallengeFormSchema>;
```

**Form Setup** (`components/defi/form.tsx`):
```typescript
const form = useForm<ChallengeFormValues>({
  resolver: zodResolver(ChallengeFormSchema),
  defaultValues: { /* ... */ }
});

const onSubmit = async (values: ChallengeFormValues) => {
  const result = await createChallenge(values);
  // Handle result
};
```

**Server-Side Re-validation**:
- All server actions re-validate with the same Zod schema
- Prevents client-side validation bypass
- Ensures data integrity at the database layer

### 4. Authentication Architecture (Clerk)

**Middleware** (`middleware.ts`):
```typescript
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req) &&
      (await auth()).sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }
})
```

**User Sync Webhook** (`app/api/webhooks/clerk/route.ts`):
- Listens to `user.created` and `user.updated` events
- Syncs Clerk users to Supabase `user_profiles` table
- Uses Svix for webhook signature verification
- Ensures RLS policies work correctly

**Role-Based Access**:
- Roles stored in Clerk `metadata.role` field
- Admin routes protected by middleware
- Server actions check `userId` from `auth()`

### 5. Payment Flow Architecture

**Complete Flow**:

1. **Challenge Creation** (`createChallenge` action):
   - Status: `draft`
   - Amount: 10€-500€
   - No transaction created yet

2. **Checkout Session Creation** (`app/api/create-checkout-session/route.ts`):
   - Validates: user ownership, amount limits, duplicate payment
   - Creates/reuses transaction with status `initiated`
   - Stripe payment intent ID stored
   - Returns Stripe session URL
   - Session expires in 30 minutes

3. **Payment Processing** (Stripe webhook - `app/api/webhooks/stripe/route.ts`):
   - Event: `checkout.session.completed`
   - Calls stored procedure: `update_payment_status_atomic_v2`
   - Updates challenge: `draft` → `active`
   - Updates transaction: `initiated` → `paid`
   - Idempotency via `webhook_events` table

4. **Challenge Completion**:

   **Success** (`markChallengeAsSuccessful`):
   - Challenge: `active` → `validated`
   - Options:
     - Refund 96% to user (4% commission)
     - OR donate 96% to association (user choice)
   - Transaction: `paid` → `refunded` OR `donated`
   - Calls stored procedure: `mark_challenge_successful`

   **Failure** (`markChallengeAsFailed`):
   - Challenge: `active` → `failed`
   - Transaction: `paid` → `donated`
   - Full amount (minus commission) donated to association
   - Calls stored procedure: `mark_challenge_failed`

**Security Measures**:
- Stripe webhook signature verification
- Idempotency checks (prevent duplicate processing)
- Ownership verification before payment
- Amount validation (10€-500€ range)
- Rate limiting (in-memory, needs Redis for production)

### 6. Component Architecture

**Patterns**:
- **Server Components** (default): Pages, data fetching, SEO
- **Client Components** (`"use client"`): Forms, interactive UI, hooks
- **Suspense + Streaming**: Dashboard loads progressively
- **shadcn/ui**: Consistent design system across all components
- **Custom Hooks**: Reusable logic (`useAssociations`, `useDebounce`)

**Component Organization**:
- Feature-based: `components/defi/`, `components/mon-aventure/`
- UI primitives: `components/ui/` (37 shadcn/ui components)
- Landing sections: `components/landing/`
- Shared: `components/navbar.tsx`, `components/theme-provider.tsx`

---

## Database Schema & Entities

### Core Tables (Inferred from Code)

**user_profiles**
- Synced from Clerk via webhook
- Fields: `id` (UUID), `clerk_user_id`, `email`, `created_at`

**challenges**
- Fields:
  - `id` (UUID, primary key)
  - `user_id` (UUID, FK to user_profiles)
  - `clerk_user_id` (string, redundant for quick lookups)
  - `association_id` (UUID, FK to associations)
  - `feedback_id` (UUID, FK to challenge_feedbacks)
  - `title` (string)
  - `description` (string, optional)
  - `amount` (numeric, 10-500)
  - `duration_days` (integer, 1-90)
  - `start_date` (timestamp)
  - `end_date` (timestamp, calculated)
  - `status` (enum: draft, active, validated, failed, expired)
  - `stripe_payment_status` (enum: pending, succeeded, failed, refunded)
  - `created_at` (timestamp)

**transactions**
- Fields:
  - `id` (UUID)
  - `challenge_id` (UUID, FK to challenges)
  - `stripe_payment_intent_id` (string)
  - `amount` (numeric)
  - `commission` (numeric)
  - `status` (enum: initiated, paid, refunded, donated)
  - `created_at` (timestamp)

**associations**
- Fields:
  - `id` (UUID)
  - `name` (string)
  - `description` (text)
  - `category` (string)
  - `city` (string)
  - `website` (string)
  - `image_url` (string)

**challenge_feedbacks**
- Fields:
  - `id` (UUID)
  - `challenge_id` (UUID)
  - `rating` (integer, 1-5)
  - `accomplishment_note` (text)
  - `failure_note` (text)

**webhook_events**
- Purpose: Idempotency for webhook processing
- Fields:
  - `id` (UUID)
  - `stripe_event_id` (string, unique)
  - `event_type` (string)
  - `metadata` (jsonb)
  - `created_at` (timestamp)

### Relationships

```
user_profiles (1) ←─→ (N) challenges
challenges (1) ←─→ (1) transactions
challenges (N) ←─→ (1) associations
challenges (1) ←─→ (0-1) challenge_feedbacks
```

### Stored Procedures (Supabase Functions)

**update_payment_status_atomic_v2**
- Purpose: Atomic payment processing
- Called by: Stripe webhook
- Updates: challenges.status, transactions.status
- Ensures: Atomicity, no race conditions

**mark_challenge_successful**
- Purpose: Mark challenge as validated
- Parameters: challenge_id, accomplishment_note, rating, donate_to_association
- Updates: challenges.status, transactions.status
- Triggers: Stripe refund OR donation processing

**mark_challenge_failed**
- Purpose: Mark challenge as failed
- Parameters: challenge_id, failure_note
- Updates: challenges.status, transactions.status
- Triggers: Stripe donation processing

**delete_challenge_with_transactions**
- Purpose: Safe cascade deletion
- Deletes: challenge + related transactions
- Ensures: No orphaned records

**get_user_challenges_summary**
- Purpose: Optimized statistics aggregation
- Returns: total, successful, failed, active, expired, drafted counts
- Used by: Dashboard summary cards

---

## Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Optional Variables (with defaults)

```bash
COMMISSION_RATE=0.04              # 4% commission (default)
MIN_PAYMENT_AMOUNT_EUR=10         # Minimum challenge amount
MAX_PAYMENT_AMOUNT_EUR=500        # Maximum challenge amount
```

### Webhook Endpoints

**Stripe Webhook**:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.expired`

**Clerk Webhook**:
- URL: `https://yourdomain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`
- Documentation: `docs/clerk-webhooks-setup.md`

---

## Key Features & Modules

### Module 1: Challenge Management
**Files**: `app/defi/`, `components/defi/`, `lib/actions/defi.actions.ts`

**Features**:
- Create challenge with association selection
- Duration presets (1, 7, 30, 60, 90 days)
- Amount limits (10€-500€)
- Automatic end date calculation
- Terms & conditions acceptance
- Commission calculation display (4%)
- Challenge detail view with status tracking

### Module 2: User Dashboard ("Mon Aventure")
**Files**: `app/mon-aventure/`, `components/mon-aventure/`

**Features**:
- Statistics summary cards (total, successful, failed, active, expired, drafted)
- Challenge filtering by status (tabs)
- Pagination (10 per page)
- Donation history by association
- Challenge action buttons:
  - View details
  - Pay (for draft challenges)
  - Validate (for active challenges)
  - Mark as failed (for active challenges)
  - Delete (for draft challenges)

### Module 3: Association Directory
**Files**: `app/associations/`, `components/associations/`, `lib/actions/association.actions.ts`

**Features**:
- Browse all associations
- Search by name, description, city (debounced)
- Filter by category
- Modal detail view with full info
- Client-side filtering with `useAssociations` hook

### Module 4: Payment Processing
**Files**: `app/api/create-checkout-session/`, `app/api/webhooks/stripe/`, `lib/stripe/`

**Features**:
- Stripe Checkout integration
- Webhook event handling (4 events)
- Idempotency guarantees
- Automatic transaction creation
- 30-minute session expiry
- Phone number collection
- Invoice generation
- Refund processing (96% on success)
- Donation processing (100% minus commission on failure)

### Module 5: Authentication & User Management
**Files**: `middleware.ts`, `app/api/webhooks/clerk/`, `lib/utils.role.ts`

**Features**:
- Clerk authentication (email, Google, GitHub)
- Role-based access (admin/user)
- User profile sync to Supabase
- Protected routes (admin panel)
- Sign-in/sign-up flows

### Module 6: Landing Page
**Files**: `app/page.tsx`, `components/landing/`

**Features**:
- Hero section with CTA
- "How it works" explanation
- Partners section
- Testimonials
- Footer with legal links
- Responsive design
- Dark mode support

---

## Code Conventions & Best Practices

### TypeScript
- **Strict mode enabled** (`tsconfig.json`)
- **Path alias**: Use `@/*` for absolute imports (e.g., `@/lib/supabase`)
- **Type inference**: Prefer `z.infer<typeof Schema>` for Zod schemas
- **Explicit return types**: Server actions return typed results
- **No implicit any**: All variables must have types

### Component Conventions
- **Server Components first**: Default to server components unless interactivity needed
- **"use client" sparingly**: Only add when needed (hooks, event handlers, browser APIs)
- **Props interfaces**: Define explicit interfaces for component props
- **File naming**:
  - Pages: `page.tsx`
  - Components: `kebab-case.tsx`
  - Actions: `*.actions.ts`
  - Types: `*.types.ts`

### Server Actions
- **Always "use server"**: Required directive at top of file
- **Authentication first**: Check `userId` before any operation
- **Zod validation**: Validate all inputs with Zod schemas
- **Typed responses**: Return consistent `{ success, data?, error? }` objects
- **Error handling**: Catch all errors, return user-friendly messages
- **Cache revalidation**: Call `revalidatePath()` after mutations
- **No direct database access**: Always use Supabase client

### Database Operations
- **Use RLS**: Rely on Row Level Security for user-scoped queries
- **Stored procedures**: Use for complex, atomic operations
- **Select specific fields**: Avoid `select('*')` unless necessary
- **Single queries**: Minimize database round-trips
- **Error handling**: Always check `error` from Supabase response

### Styling
- **Tailwind first**: Use Tailwind utility classes
- **shadcn/ui components**: Use for consistent design
- **cn() utility**: Use `cn()` from `lib/utils.ts` for conditional classes
- **Dark mode**: Use CSS variables defined in `globals.css`
- **Responsive**: Mobile-first, use `sm:`, `md:`, `lg:` breakpoints

### Security
- **Never expose secrets**: Keep `.env.local` out of git
- **Validate on server**: Always re-validate Zod schemas server-side
- **Verify webhooks**: Use signature verification (Stripe, Clerk)
- **Check ownership**: Verify user owns resource before mutations
- **Use service role sparingly**: Only for webhooks, admin operations
- **Rate limiting**: Implement proper rate limiting (replace in-memory)

---

## French Localization

**Important**: The application is entirely in French. All user-facing content, error messages, and database entities use French naming.

### Common Translations
- **Challenges** = "Défis"
- **Associations** = "Associations" (charities)
- **User Dashboard** = "Mon Aventure"
- **Success** = "Validé"
- **Failed** = "Échoué"
- **Draft** = "Brouillon"
- **Active** = "Actif"
- **Expired** = "Expiré"

### Consistency Rules
- Use French for all UI text, labels, placeholders
- Use French for error messages returned from server actions
- Database column names can be English (convention)
- Code comments can be French or English (team preference)
- Keep French terminology consistent across features

---

## Testing & Quality Assurance

### Current Status
**No testing infrastructure** is currently implemented.

### Recommended Additions
1. **Unit Tests**: Jest + React Testing Library for components
2. **Integration Tests**: Test server actions with mock Supabase
3. **E2E Tests**: Playwright/Cypress for critical flows (signup, payment, challenge lifecycle)
4. **Type Testing**: Run `tsc --noEmit` in CI
5. **API Tests**: Test webhook handlers with mock Stripe/Clerk events

### CI/CD
**No CI/CD pipeline** is currently configured.

### Recommended GitHub Actions
- Lint check on PRs
- Type check on PRs
- Build verification
- Automated deployment to Vercel (preview + production)

---

## Deployment

### Platform
- **Vercel** (primary target, based on `.vercel/` in `.gitignore`)
- Optimized for Next.js with automatic edge deployment

### Pre-Deployment Checklist
1. Set all environment variables in Vercel dashboard
2. Configure webhook URLs in Stripe & Clerk dashboards
3. Test webhooks with Stripe CLI (`stripe listen --forward-to`)
4. Verify Supabase RLS policies are active
5. Enable Supabase database backups
6. Configure custom domain & SSL
7. Set up monitoring (Sentry, LogRocket, or similar)

### Production Considerations
- **Rate Limiting**: Replace in-memory rate limiting with Redis/Upstash
- **Logging**: Implement structured logging for webhooks
- **Monitoring**: Add error tracking (Sentry) and analytics
- **Database**: Set up automated backups in Supabase
- **Edge Functions**: Consider Supabase Edge Functions for heavy operations
- **CDN**: Use Vercel Edge Network for static assets
- **Performance**: Enable Next.js Image Optimization

---

## Common Development Tasks

### Adding a New Page
1. Create `app/your-route/page.tsx`
2. Define as Server Component (default) or add `"use client"` if needed
3. Update `navbar.tsx` with navigation link
4. Add to `middleware.ts` if authentication required

### Adding a New Server Action
1. Create function in `lib/actions/*.actions.ts`
2. Add `"use server"` directive
3. Define Zod schema in `lib/validations/`
4. Define return type in `types/`
5. Call `revalidatePath()` after mutations
6. Handle errors consistently

### Adding a New Database Table
1. Create table in Supabase dashboard
2. Set up RLS policies
3. Create TypeScript types in `types/`
4. Create server actions in `lib/actions/`
5. Update relevant components

### Adding a New Webhook Event
1. Add event type to webhook handler (`app/api/webhooks/`)
2. Verify signature (Stripe/Clerk)
3. Check idempotency (`webhook_events` table)
4. Use service role Supabase client
5. Test with webhook testing tools

### Adding a New shadcn/ui Component
```bash
npx shadcn@latest add [component-name]
```
- Components automatically added to `components/ui/`
- Import and use: `import { Button } from "@/components/ui/button"`

---

## Troubleshooting

### Common Issues

**"Utilisateur non authentifié"**
- Check Clerk session is active
- Verify middleware configuration
- Check `CLERK_SECRET_KEY` environment variable

**Webhook not processing**
- Verify webhook signature secrets are correct
- Check webhook URL is publicly accessible (use ngrok for local)
- Check `webhook_events` table for duplicate prevention
- Review Stripe/Clerk webhook logs

**Database RLS errors**
- Ensure Clerk token is being passed to Supabase client
- Check RLS policies in Supabase dashboard
- Use service role client for admin operations

**Payment not completing**
- Check Stripe webhook is configured correctly
- Verify `update_payment_status_atomic_v2` stored procedure exists
- Check transaction status in database
- Review Stripe dashboard for payment intent status

**Build errors**
- Run `npm run lint` to check for linting errors
- Run `tsc --noEmit` to check for type errors
- Clear `.next` folder and rebuild
- Check all environment variables are set

---

## Additional Resources

### Documentation
- **Next.js 15**: https://nextjs.org/docs
- **Clerk**: https://clerk.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

### Internal Docs
- `docs/clerk-webhooks-setup.md` - Clerk webhook configuration
- `README.md` - Project overview

### Code Examples
- Server Actions: `lib/actions/defi.actions.ts`
- Webhook Handler: `app/api/webhooks/stripe/route.ts`
- Form Pattern: `components/defi/form.tsx`
- Dashboard: `app/mon-aventure/page.tsx`

---

## Future Improvements

### Short-Term
1. Add unit & integration tests
2. Implement CI/CD pipeline
3. Add error boundary components
4. Replace in-memory rate limiting with Redis
5. Add proper logging/monitoring (Sentry)
6. Implement email notifications (SendGrid, Resend)

### Medium-Term
1. Add challenge reminders (cron jobs)
2. Implement social sharing features
3. Add challenge templates
4. Create admin dashboard with analytics
5. Add challenge progress tracking (milestones)
6. Implement team challenges (multiple participants)

### Long-Term
1. Mobile app (React Native, Expo)
2. Gamification (badges, leaderboards)
3. Integration with fitness trackers (Strava, Apple Health)
4. Marketplace for challenge ideas
5. Association verification system
6. Multi-language support (i18n)

---

**Last Updated**: 2025-11-15
**Next.js Version**: 15.3.2
**Node Version**: 20+
