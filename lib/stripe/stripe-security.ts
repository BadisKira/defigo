import { createSupabaseClient } from "@/lib/supabase";




export function validatePaymentAmount(amount: number): boolean {
  const min = parseInt(process.env.MIN_PAYMENT_AMOUNT_EUR || '10');
  const max = parseInt(process.env.MAX_PAYMENT_AMOUNT_EUR || '500');
  return amount >= min && amount <= max && Number.isInteger(amount);
}

// Vérification ownership du challenge
export async function verifyUserOwnsChallenge(
  challengeId: string, 
  userId: string
): Promise<boolean> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('challenges')
    .select('user_id')
    .eq('id', challengeId)
    .eq('user_id', userId)
    .single();
    
  return !error && !!data;
}

// Déduplication des webhooks
export async function isWebhookAlreadyProcessed(eventId: string): Promise<boolean> {
    const supabase = createSupabaseClient();
    const { data } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();
    
  return !!data;
}

// Marquer webhook comme traité
export async function markWebhookAsProcessed(
  eventId: string, 
  eventType: string, 
  metadata?: any
): Promise<void> {
    
  const supabase = createSupabaseClient();
  await supabase
    .from('webhook_events')
    .insert({
      stripe_event_id: eventId,
      event_type: eventType,
      metadata: metadata || {}
    });
}

// Calcul sécurisé de la commission
export function calculateCommission(amount: number): number {
  const rate = parseFloat(process.env.COMMISSION_RATE || '0.05');
  return Math.round(amount * rate * 100) / 100; 
}

// Rate limiting simple (en mémoire pour MVP)
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(identifier: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(identifier) || [];
  
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  return true;
}