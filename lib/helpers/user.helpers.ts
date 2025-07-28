/**
 * Helper functions for user management
 * Handles conversion between Clerk user ID and internal user_id
 */

import { createServiceRoleSupabaseClient } from '@/lib/supabase';

/**
 * Get internal user_id from Clerk user ID
 */
export async function getUserIdFromClerkId(clerkUserId: string): Promise<string | null> {
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();
    
    if (error || !userProfile) {
      console.error('User profile not found for clerk_id:', clerkUserId, error);
      return null;
    }
    
    return userProfile.id;
  } catch (error) {
    console.error('Error getting user_id from clerk_id:', error);
    return null;
  }
}