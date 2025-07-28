/**
 * API de debug simplifiée pour diagnostiquer les problèmes de checkout
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Starting debug checkout');
    
    // 1. Test authentication
    const { userId } = await auth();
    console.log('👤 DEBUG: User ID:', userId);
    
    if (!userId) {
      return Response.json({ 
        error: "Non authentifié",
        debug: { step: 'auth', userId } 
      }, { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    console.log('📦 DEBUG: Request body:', body);
    
    const { challengeId, amount } = body;
    
    if (!challengeId || !amount) {
      return Response.json({ 
        error: "Données manquantes",
        debug: { step: 'validation', challengeId, amount }
      }, { status: 400 });
    }

    // 3. Test database connection
    const supabase = createSupabaseClient();
    console.log('🗄️ DEBUG: Testing database connection');
    
    // Simple query to test connection
    const { data: testData, error: testError } = await supabase
      .from('challenges')
      .select('id, title, status, amount')
      .eq('id', challengeId)
      .single();
    
    console.log('🔍 DEBUG: Challenge query result:', { testData, testError });

    if (testError) {
      return Response.json({ 
        error: "Erreur base de données",
        debug: { step: 'database', error: testError.message }
      }, { status: 500 });
    }

    if (!testData) {
      return Response.json({ 
        error: "Challenge non trouvé",
        debug: { step: 'challenge_not_found', challengeId }
      }, { status: 404 });
    }

    // 4. Return success with debug info
    return Response.json({ 
      success: true,
      debug: {
        userId,
        challengeId,
        amount,
        challenge: testData,
        message: "Tout fonctionne jusqu'ici !"
      }
    });

  } catch (error) {
    console.error('❌ DEBUG: Error occurred:', error);
    return Response.json({ 
      error: "Erreur interne",
      debug: { 
        step: 'catch_block',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}