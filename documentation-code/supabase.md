# Supabase Integration Documentation

## Overview
This document provides comprehensive Supabase integration patterns for the **deKliK** platform, covering database operations, authentication integration, RLS policies, and server actions.

## Current Implementation

### Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Regular client with Clerk auth integration
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

// Service role client for webhooks and privileged operations
export function createServiceRoleSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

## Database Schema & Operations

### 1. **Challenge Operations**
```typescript
// lib/actions/defi.actions.ts
'use server'

export async function createChallenge(challengeData: CreateChallengeData) {
  const supabase = await createSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        title: challengeData.title,
        description: challengeData.description,
        amount: challengeData.amount,
        due_date: challengeData.dueDate,
        user_id: challengeData.userId,
        association_id: challengeData.associationId,
        status: 'draft',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating challenge:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
```

### 2. **User Challenge Queries**
```typescript
// lib/actions/user-challenges.actions.ts
export async function getUserChallenges(userId: string) {
  const supabase = await createSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        associations!inner(id, name, description),
        transactions(id, amount, status, stripe_payment_intent_id)
      `)
      .eq('user_id', userId) // Important: Explicit filter for RLS performance
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user challenges:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
```

## Row Level Security (RLS) Implementation

### 1. **Challenge RLS Policies**
```sql
-- Enable RLS on challenges table
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Users can only see their own challenges
CREATE POLICY "Users can view own challenges" 
ON challenges FOR SELECT 
USING (
  auth.jwt() ->> 'sub'::text = user_id::text
);

-- Users can insert their own challenges
CREATE POLICY "Users can create own challenges" 
ON challenges FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'sub'::text = user_id::text
);

-- Users can update their own challenges
CREATE POLICY "Users can update own challenges" 
ON challenges FOR UPDATE 
USING (
  auth.jwt() ->> 'sub'::text = user_id::text
);
```

### 2. **Transaction RLS Policies**
```sql
-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see transactions for their challenges
CREATE POLICY "Users can view own challenge transactions" 
ON transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM challenges 
    WHERE challenges.id = transactions.challenge_id 
    AND auth.jwt() ->> 'sub'::text = challenges.user_id::text
  )
);
```

## Stored Procedures for Business Logic

### 1. **Atomic Payment Processing**
```sql
-- Stored procedure for atomic payment status updates
CREATE OR REPLACE FUNCTION update_payment_status_atomic_v2(
  p_challenge_id UUID,
  p_payment_intent_id TEXT,
  p_amount DECIMAL,
  p_commission_rate DECIMAL DEFAULT 0.04
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_commission_amount DECIMAL;
BEGIN
  -- Calculate commission
  v_commission_amount := p_amount * p_commission_rate;
  
  -- Update challenge and create transaction atomically
  WITH updated_challenge AS (
    UPDATE challenges 
    SET 
      status = 'active',
      updated_at = NOW()
    WHERE id = p_challenge_id
    RETURNING *
  ),
  new_transaction AS (
    INSERT INTO transactions (
      challenge_id,
      stripe_payment_intent_id,
      amount,
      commission_amount,
      status,
      created_at
    )
    VALUES (
      p_challenge_id,
      p_payment_intent_id,
      p_amount,
      v_commission_amount,
      'paid',
      NOW()
    )
    RETURNING *
  )
  SELECT json_build_object(
    'challenge', row_to_json(updated_challenge),
    'transaction', row_to_json(new_transaction),
    'success', true
  )
  INTO v_result
  FROM updated_challenge, new_transaction;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
```

### 2. **Challenge Success Processing**
```sql
-- Mark challenge as successful (96% refund)
CREATE OR REPLACE FUNCTION mark_challenge_successful(
  p_challenge_id UUID,
  p_refund_amount DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH updated_challenge AS (
    UPDATE challenges 
    SET 
      status = 'validated',
      validated_at = NOW(),
      updated_at = NOW()
    WHERE id = p_challenge_id
    AND status = 'active'
    RETURNING *
  ),
  updated_transaction AS (
    UPDATE transactions 
    SET 
      status = 'refunded',
      refund_amount = p_refund_amount,
      updated_at = NOW()
    WHERE challenge_id = p_challenge_id
    RETURNING *
  )
  SELECT json_build_object(
    'challenge', row_to_json(updated_challenge),
    'transaction', row_to_json(updated_transaction),
    'success', true
  )
  INTO v_result
  FROM updated_challenge, updated_transaction;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
```

## Server Actions Patterns

### 1. **Comprehensive Error Handling**
```typescript
// lib/actions/defi.actions.ts
export async function markChallengeAsValidated(challengeId: string) {
  try {
    const supabase = await createSupabaseClient()
    
    // Get challenge details first
    const { data: challenge, error: fetchError } = await supabase
      .from('challenges')
      .select('*, transactions!inner(amount)')
      .eq('id', challengeId)
      .eq('user_id', (await auth()).userId!) // Explicit user filter
      .single()

    if (fetchError) {
      return {
        success: false,
        error: 'Challenge not found or access denied',
      }
    }

    if (challenge.status !== 'active') {
      return {
        success: false,
        error: 'Challenge must be active to validate',
      }
    }

    // Calculate 96% refund
    const refundAmount = challenge.transactions[0].amount * 0.96

    // Use stored procedure for atomic operation
    const { data: result, error: procError } = await supabase
      .rpc('mark_challenge_successful', {
        p_challenge_id: challengeId,
        p_refund_amount: refundAmount,
      })

    if (procError || !result.success) {
      return {
        success: false,
        error: result?.error || procError?.message || 'Failed to validate challenge',
      }
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath(`/challenges/${challengeId}`)

    return {
      success: true,
      data: result,
      message: 'Challenge validated successfully! Refund will be processed.',
    }
  } catch (error) {
    console.error('Error validating challenge:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
```

### 2. **Input Validation with Zod**
```typescript
// lib/actions/defi.actions.ts
import { createChallengeSchema } from '@/lib/validations/defi.validations'

export async function createChallengeAction(formData: FormData) {
  try {
    // Parse and validate form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      dueDate: formData.get('dueDate') as string,
      associationId: formData.get('associationId') as string,
    }

    const validatedData = createChallengeSchema.parse(rawData)
    
    // Get authenticated user
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Authentication required' }
    }

    return await createChallenge({
      ...validatedData,
      userId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      }
    }
    
    console.error('Error creating challenge:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
```

## Performance Optimization

### 1. **Query Optimization**
```typescript
// Always add explicit filters for RLS performance
export async function getOptimizedChallenges(userId: string) {
  const supabase = await createSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        id,
        title,
        amount,
        status,
        due_date,
        created_at,
        associations!inner(id, name)
      `)
      .eq('user_id', userId) // Explicit filter helps RLS performance
      .eq('status', 'active') // Additional filter for specific queries
      .order('created_at', { ascending: false })
      .limit(10) // Limit results for performance

    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Failed to fetch challenges' }
  }
}
```

### 2. **Using EXPLAIN for Query Analysis**
```typescript
// Debug query performance
export async function analyzeQueryPerformance() {
  const supabase = await createSupabaseClient()
  
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', 'user-id')
    .explain({ analyze: true })
    
  console.log('Query plan:', data)
}
```

## Webhook Integration

### 1. **Stripe Webhook Processing**
```typescript
// app/api/webhooks/stripe/route.ts
import { createServiceRoleSupabaseClient } from '@/lib/supabase'

export async function POST(req: Request) {
  // ... webhook verification logic ...
  
  const supabase = createServiceRoleSupabaseClient()
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      
      // Use stored procedure for atomic operations
      const { data: result, error } = await supabase
        .rpc('update_payment_status_atomic_v2', {
          p_challenge_id: session.metadata.challengeId,
          p_payment_intent_id: session.payment_intent,
          p_amount: session.amount_total / 100, // Convert from cents
        })

      if (error || !result.success) {
        console.error('Payment processing failed:', error || result.error)
        return new Response('Payment processing failed', { status: 500 })
      }
      
      break
  }
  
  return new Response('Success', { status: 200 })
}
```

## Environment Variables

Required environment variables for Supabase integration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For Clerk JWT integration
SUPABASE_JWT_SECRET=your_jwt_secret
```

## Database Migration Patterns

### 1. **Challenge Table Structure**
```sql
-- Core challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user ID
  association_id UUID REFERENCES associations(id),
  status challenge_status DEFAULT 'draft',
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge status enum
CREATE TYPE challenge_status AS ENUM (
  'draft', 'active', 'validated', 'failed', 'expired'
);
```

### 2. **Indexes for Performance**
```sql
-- Indexes for common queries
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_due_date ON challenges(due_date);
CREATE INDEX idx_challenges_user_status ON challenges(user_id, status);

-- Composite index for dashboard queries
CREATE INDEX idx_challenges_user_created ON challenges(user_id, created_at DESC);
```

## Best Practices for deKliK

1. **Always use explicit filters** - Even with RLS, add `.eq('user_id', userId)` for performance
2. **Leverage stored procedures** - For complex business logic and atomic operations  
3. **Handle errors comprehensively** - Return structured error responses
4. **Use service role client carefully** - Only for webhooks and privileged operations
5. **Validate inputs** - Use Zod schemas for server actions
6. **Revalidate paths** - After mutations, revalidate affected routes
7. **Monitor query performance** - Use `.explain()` for optimization

## Common Patterns

### 1. **Paginated Queries**
```typescript
export async function getPaginatedChallenges(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  const supabase = await createSupabaseClient()
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('challenges')
    .select('*, associations(name)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    
  return {
    data,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
```

### 2. **Conditional Updates**
```typescript
export async function updateChallengeStatus(
  challengeId: string,
  newStatus: ChallengeStatus,
  conditions: Record<string, any> = {}
) {
  const supabase = await createSupabaseClient()
  
  let query = supabase
    .from('challenges')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
    .eq('user_id', (await auth()).userId!)
    
  // Add conditional filters
  Object.entries(conditions).forEach(([key, value]) => {
    query = query.eq(key, value)
  })
  
  const { data, error } = await query.select().single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}
```

This documentation provides a comprehensive guide for working with Supabase in the deKliK platform, ensuring secure, performant, and maintainable database operations.