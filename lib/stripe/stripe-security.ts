/**
 * Stripe Security Module - deKliK Platform
 * Comprehensive security layer for payment processing with:
 * - Payment locks to prevent race conditions
 * - Database-backed rate limiting
 * - Security validations and business logic
 * - Based on documentation-code/stripe.md patterns
 */

import { createSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type PaymentLock = Database['public']['Tables']['payment_locks']['Row'];
type PaymentLockInsert = Database['public']['Tables']['payment_locks']['Insert'];
type RateLimit = Database['public']['Tables']['rate_limits']['Row'];
type RateLimitInsert = Database['public']['Tables']['rate_limits']['Insert'];

// ============================================================================
// PAYMENT LOCKS MANAGEMENT
// ============================================================================

/**
 * Acquires a payment lock to prevent race conditions during payment processing
 * Uses PostgreSQL advisory locks for atomic operations
 */
export async function acquirePaymentLock(
  challengeId: string,
  userId: string,
  lockType: 'payment' | 'refund' | 'donation' = 'payment'
): Promise<{ success: boolean; lockId?: string; error?: string }> {
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    // Generate unique lock ID
    const lockId = `${lockType}_${challengeId}_${Date.now()}`;
    
    // Try to acquire lock atomically
    const { data, error } = await supabase.rpc('acquire_payment_lock', {
      p_challenge_id: challengeId,
      p_user_id: userId,
      p_lock_type: lockType,
      p_lock_id: lockId
    });

    if (error) {
      console.error('Failed to acquire payment lock:', error);
      return { success: false, error: 'Lock acquisition failed' };
    }

    if (!data) {
      return { success: false, error: 'Payment already in progress' };
    }

    return { success: true, lockId };
  } catch (error) {
    console.error('Payment lock error:', error);
    return { success: false, error: 'Internal lock error' };
  }
}

/**
 * Releases a payment lock after operation completion
 */
export async function releasePaymentLock(lockId: string): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const { error } = await supabase.rpc('release_payment_lock', {
      p_lock_id: lockId
    });

    if (error) {
      console.error('Failed to release payment lock:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Lock release error:', error);
    return false;
  }
}



// ============================================================================
// RATE LIMITING SYSTEM
// ============================================================================

/**
 * Checks rate limit using sliding window approach with database persistence
 * Reference: documentation-code/stripe.md best practices
 */
export async function checkRateLimit(
  identifier: string,
  action: 'payment' | 'refund' | 'webhook' | 'api',
  maxRequests: number = 5,
  windowMinutes: number = 1
): Promise<{ allowed: boolean; remaining: number; resetTime?: Date }> {
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open for reliability
      return { allowed: true, remaining: maxRequests };
    }

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      resetTime: data.reset_time ? new Date(data.reset_time) : undefined
    };
  } catch (error) {
    console.error('Rate limiting failed:', error);
    // Fail open for reliability
    return { allowed: true, remaining: maxRequests };
  }
}



// ============================================================================
// SECURITY VALIDATIONS
// ============================================================================

/**
 * Validates payment amount according to business rules
 * Reference: documentation-code/stripe.md environment variables
 */
export function validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
  const min = parseInt(process.env.MIN_PAYMENT_AMOUNT_EUR || '10');
  const max = parseInt(process.env.MAX_PAYMENT_AMOUNT_EUR || '500');
  
  if (!Number.isInteger(amount) || amount <= 0) {
    return { valid: false, error: 'Le montant doit être un nombre entier positif' };
  }
  
  if (amount < min) {
    return { valid: false, error: `Le montant minimum est de ${min}€` };
  }
  
  if (amount > max) {
    return { valid: false, error: `Le montant maximum est de ${max}€` };
  }
  
  return { valid: true };
}

/**
 * Verifies user ownership of a challenge with security checks
 */
export async function verifyUserOwnsChallenge(
  challengeId: string,
  userId: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('user_id, status')
      .eq('id', challengeId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return { valid: false, error: 'Défi introuvable' };
    }
    
    if (!data) {
      return { valid: false, error: 'Accès non autorisé' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Challenge ownership verification failed:', error);
    return { valid: false, error: 'Erreur de vérification' };
  }
}

/**
 * Validates challenge state for payment operations
 */
export async function validateChallengeForPayment(
  challengeId: string
): Promise<{ valid: boolean; challenge?: any; error?: string }> {
  const supabase = createSupabaseClient();
  
  try {
    console.log('🔍 Validating challenge for payment:', challengeId);
    
    const { data: challenge, error } = await supabase
      .from('challenges')
      .select(`
        id,
        status,
        amount,
        user_id,
        association_id,
        associations(id, name, is_active)
      `)
      .eq('id', challengeId)
      .single();
    
    console.log('📊 Challenge query result:', { challenge, error });
    
    if (error || !challenge) {
      console.error('❌ Challenge not found:', error);
      return { valid: false, error: 'Défi introuvable' };
    }
    
    if (challenge.status !== 'draft') {
      return { valid: false, error: 'Ce défi ne peut plus être payé' };
    }
    
    if (!challenge.associations || !challenge.associations.is_active) {
      return { valid: false, error: 'Association non disponible' };
    }
    
    const amountValidation = validatePaymentAmount(challenge.amount);
    if (!amountValidation.valid) {
      return { valid: false, error: amountValidation.error };
    }
    
    return { valid: true, challenge };
  } catch (error) {
    console.error('Challenge validation failed:', error);
    return { valid: false, error: 'Erreur de validation' };
  }
}

// ============================================================================
// WEBHOOK SECURITY
// ============================================================================

/**
 * Checks if a webhook event has already been processed (idempotency)
 */
export async function isWebhookAlreadyProcessed(eventId: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', eventId)
      .limit(1)
      .single();
    
    return !error && !!data;
  } catch (error) {
    console.error('Webhook check failed:', error);
    return false;
  }
}

/**
 * Marks a webhook event as processed for idempotency
 */
export async function markWebhookAsProcessed(
  eventId: string,
  eventType: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: eventId,
        event_type: eventType,
        metadata: metadata || {},
        processed_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Webhook marking failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Webhook processing record failed:', error);
    return false;
  }
}

// ============================================================================
// BUSINESS LOGIC HELPERS
// ============================================================================

/**
 * Calculates commission according to business rules
 * Reference: documentation-code/stripe.md commission rate
 */
export function calculateCommission(amount: number): number {
  const rate = parseFloat(process.env.COMMISSION_RATE || '0.04');
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Calculates refund amount for successful challenges (96%)
 */
export function calculateRefundAmount(originalAmount: number): number {
  return Math.round(originalAmount * 0.96 * 100) / 100;
}

/**
 * Converts EUR to Stripe cents format
 */
export function eurToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Converts Stripe cents to EUR format
 */
export function centsToEur(cents: number): number {
  return Math.round(cents) / 100;
}

/**
 * Generates secure metadata for Stripe operations
 * Reference: documentation-code/stripe.md metadata usage
 */
export function generateStripeMetadata(challengeId: string, userId: string, operation: string): Record<string, string> {
  return {
    challengeId,
    userId,
    operation,
    platform: 'deklik',
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
}




