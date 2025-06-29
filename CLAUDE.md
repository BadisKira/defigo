# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint linting

## Architecture Overview

This is a **Next.js 15** challenge/betting platform called **deKliK** where users create personal challenges, pay upfront, and either get refunded (96%) on success or have funds donated to charity on failure.

### Core Tech Stack
- **Next.js 15** with App Router and TypeScript
- **Clerk** for authentication and user management
- **Supabase** for database and backend services
- **Stripe** for payment processing
- **Tailwind CSS + shadcn/ui** for styling
- **React Hook Form + Zod** for form validation

### Key Architecture Patterns

**Database Integration**:
- Two Supabase clients: regular (`createSupabaseClient`) and service role (`createServiceRoleSupabaseClient`)
- Regular client uses Clerk auth tokens for RLS
- Service role client for privileged operations (webhooks, admin)

**Payment Flow**:
1. User creates challenge in `draft` status
2. Payment processed via Stripe checkout
3. Webhook updates challenge to `active` status
4. User can mark as `validated` (96% refund) or `failed` (donation to association)

**Server Actions Pattern**:
- All database operations in `lib/actions/` use "use server"
- Comprehensive error handling with typed result objects
- Zod validation for all inputs

### Core Entities

**Challenges** (`lib/actions/defi.actions.ts`):
- `draft` → `active` → `validated`/`failed`/`expired`
- Associated with user, association, and transaction
- Business logic: 96% refund on success, full donation on failure

**Transactions** (`types/transaction.types.ts`):
- Linked to Stripe payment intents
- Status flow: `initiated` → `paid` → `refunded`/`donated`

**Associations** (`lib/actions/association.actions.ts`):
- Charity organizations that receive donations
- Searchable and filterable

### Security & Middleware

**Clerk Middleware** (`middleware.ts`):
- Admin route protection (`/admin`) checks role metadata
- Applied to all routes except static files and Next.js internals

**Stripe Webhook Security** (`app/api/webhooks/stripe/route.ts`):
- Signature verification for all webhook events
- Idempotency via `webhook_events` table
- Atomic database operations using stored procedures

### Key File Patterns

- **Pages**: App router in `app/` directory
- **Components**: Feature-organized in `components/` with ui components in `components/ui/`
- **Actions**: Server actions in `lib/actions/`  
- **Types**: Centralized in `types/` directory
- **Validations**: Zod schemas in `lib/validations/`

### Database Functions

Uses Supabase stored procedures for complex operations:
- `update_payment_status_atomic_v2` - Payment processing
- `mark_challenge_successful` - Challenge completion
- `mark_challenge_failed` - Challenge failure
- `delete_challenge_with_transactions` - Safe deletion

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY` & `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`

### French Localization

The application is entirely in French - maintain French naming for user-facing content and database entities (défis = challenges, associations = charities).