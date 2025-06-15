"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { ChallengeFormValues, markChallengeFailedSchema, markChallengeSchema } from "../validations/engagement.validations";
import { createSupabaseClient } from "../supabase";
import { ChallengeActionResult,  ChallengeWithTransactionAndAssocAndFeedback, CreateChallengeResult, MarkChallengeAsFailedParams, MarkChallengeAsSuccessfulParams } from "@/types/challenge.types";
import { TransactionStatus } from "@/types/transaction.types";
import { z } from "zod";




export async function createChallenge(values: ChallengeFormValues): Promise<CreateChallengeResult> {
  const { userId: authUserId } = await auth();
  if (!authUserId) {
    throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
  }

  const supabase = await createSupabaseClient();

  try {
    // Récupération du profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", authUserId)
      .single();



    if (profileError || !userProfile) {
      throw new Error("Profil utilisateur introuvable. Assurez-vous que votre profil est correctement configuré.");
    }

    // Préparation des données
    const dbUserId = userProfile.id;
    // const commissionRate = Number(process.env.COMMISSION_RATE || 0.04);
    // const currentTimestamp = new Date().toISOString();

    const challengeData = {
      user_id: dbUserId,
      title: values.title,
      description: values.description,
      clerk_user_id: authUserId,
      amount: values.amount,
      duration_days: values.duration_days,
      start_date: values.start_date.toISOString(),
      association_id: values.association_id,
      status: 'draft' as const,
    };

    // Création du défi
    const { data: challenge, error: insertError } = await supabase
      .from("challenges")
      .insert([challengeData])
      .select("*")
      .single();

    if (insertError || !challenge) {
      throw new Error(`Impossible de créer le défi: ${insertError?.message || 'Données manquantes'}`);
    }

    revalidatePath("/engagement");

    return {
      success: true,
      challengeId: challenge.id
    };

  } catch (error: unknown) {
    // Log l'erreur pour le debugging
    console.error('Erreur lors de la création du défi:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur a survenu lors de la création de l'engagement",
    };
  }
}



export async function getChallenge(challenge_id: string): Promise<ChallengeWithTransactionAndAssocAndFeedback> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Vous devez être connecté pour accéder au challenge.");
  }

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      transactions(*),
      associations(id, name),
      challenge_feedbacks(*)
    `)
    .eq('id', challenge_id)
    .eq('clerk_user_id', userId)
    .maybeSingle(); 

  if (error) {
    console.error("Erreur Supabase :", error);
    throw new Error("Erreur lors de la récupération du challenge.");
  }

  if (!data) {
    throw new Error("Challenge introuvable ou vous n'y avez pas accès.");
  }

  return data as ChallengeWithTransactionAndAssocAndFeedback;
}


export async function markChallengeAsSuccessful(
  params: MarkChallengeAsSuccessfulParams
): Promise<ChallengeActionResult> {
  try {
    const validatedParams = markChallengeSchema.parse(params);
    const { challengeId, accomplishmentNote, rating, donateToAssociation } = validatedParams;

    
    const { userId } = await auth();
    if (!userId) {
      return { 
        success: false, 
        message: "Authentification requise pour valider un challenge",
        error: "UNAUTHORIZED" 
      };
    }

    const supabase = await createSupabaseClient();

    
    const { data: challengeData, error: fetchError } = await supabase
      .from('challenges')
      .select(`
        *,
        transactions!inner(
          id,
          amount,
          status,
          stripe_payment_id
        )
      `)
      .eq('id', challengeId)
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError) {
      console.error('Database error fetching challenge:', fetchError);
      return {
        success: false,
        message: "Erreur lors de la récupération du challenge",
        error: fetchError.code === 'PGRST116' ? 'CHALLENGE_NOT_FOUND' : 'DATABASE_ERROR'
      };
    }

    if (!challengeData) {
      return {
        success: false,
        message: "Challenge non trouvé, déjà complété, ou vous n'avez pas les permissions",
        error: 'CHALLENGE_NOT_ACCESSIBLE'
      };
    }

    // 4. Vérification de la date de fin
    const now = new Date();
    const endDate = new Date(challengeData.end_date);
    
    if (now > endDate) {
      return {
        success: false,
        message: "La période du challenge est expirée",
        error: 'CHALLENGE_EXPIRED'
      };
    }

    // 5. Calcul du montant de remboursement (96%)
    const totalAmount = challengeData.transactions.amount;
    const refundAmount = donateToAssociation ? 0 : Math.round(totalAmount * 0.96 * 100) / 100;

    // 6. Transaction atomique pour mettre à jour challenge et transactions
    const newTransactionStatus: TransactionStatus = donateToAssociation ? 'donated' : 'refunded';
    
    const { error: transactionError } = await supabase.rpc(
      'mark_challenge_successful',
      {
        p_challenge_id: challengeId,
        p_notes: accomplishmentNote || null,
        p_rating: rating || null,
        p_transaction_status: newTransactionStatus,
        p_updated_at: new Date().toISOString()
      }
    );

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return {
        success: false,
        message: "Erreur lors de la validation du challenge",
        error: 'TRANSACTION_FAILED'
      };
    }

    // 7. Retour de succès avec données détaillées
    const successMessage = donateToAssociation
      ? `🎉 Félicitations ! Votre challenge a été validé avec succès et ${totalAmount}€ ont été donnés à l'association.`
      : `🎉 Félicitations ! Votre challenge a été validé avec succès. Vous recevrez un remboursement de ${refundAmount}€ (96% de votre mise).`;

    return {
      success: true,
      message: successMessage,
      data: {
        challengeId,
        newStatus: 'validated',
        transactionStatus: newTransactionStatus,
        refundAmount: donateToAssociation ? undefined : refundAmount
      }
    };

  } catch (error: unknown) {
    console.error("Error in markChallengeAsSuccessful:", error);
    
    // Gestion spécifique des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Données invalides : " + error.errors.map(e => e.message).join(', '),
        error: 'VALIDATION_ERROR'
      };
    }

    return {
      success: false,
      message: "Une erreur inattendue s'est produite lors de la validation du challenge",
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

export async function markChallengeAsFailed(
  params: MarkChallengeAsFailedParams
): Promise<ChallengeActionResult> {
  try {
    const validatedParams = markChallengeFailedSchema.parse(params);
    const { challengeId, failureNote } = validatedParams;

    const { userId } = await auth();
    if (!userId) {
      return { 
        success: false, 
        message: "Authentification requise pour marquer un challenge comme échoué",
        error: "UNAUTHORIZED" 
      };
    }

    const supabase = await createSupabaseClient();

    const { data: challengeData, error: fetchError } = await supabase
      .from('challenges')
      .select(`
        *,
        associations(
          id,
          name,
          category
        ),
        transactions!inner(
          id,
          amount,
          status,
          stripe_payment_id,
          commission
        )
      `)
      .eq('id', challengeId)
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError) {
      console.error('Database error fetching challenge:', fetchError);
      return {
        success: false,
        message: "Erreur lors de la récupération du challenge",
        error: fetchError.code === 'PGRST116' ? 'CHALLENGE_NOT_FOUND' : 'DATABASE_ERROR'
      };
    }

    if (!challengeData) {
      return {
        success: false,
        message: "Challenge non trouvé, déjà complété, ou vous n'avez pas les permissions",
        error: 'CHALLENGE_NOT_ACCESSIBLE'
      };
    }

    const now = new Date();
    const endDate = new Date(challengeData.end_date);
    
    if (now > endDate) {
      return {
        success: false,
        message: "Ce challenge a déjà expiré automatiquement",
        error: 'CHALLENGE_ALREADY_EXPIRED'
      };
    }


    const paidTransactions =  challengeData.transactions.status === "paid" ? challengeData.transactions : undefined
    
    if (!paidTransactions) {
      return {
        success: false,
        message: "Aucune transaction payée trouvée pour ce challenge",
        error: 'NO_PAID_TRANSACTIONS'
      };
    }

    const totalDonationAmount = Number(paidTransactions.amount) - (Number(paidTransactions.commission) || 0);
    
    const { error: transactionError } = await supabase.rpc(
      'mark_challenge_failed',
      {
        p_challenge_id: challengeId,
        p_failure_notes: failureNote || null,
        p_updated_at: new Date().toISOString()
      }
    );

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return {
        success: false,
        message: "Erreur lors de la validation de l'échec du challenge",
        error: 'TRANSACTION_FAILED'
      };
    }

    
    const associationName = challengeData.associations?.name || 'l\'association sélectionnée';
    const successMessage = `❌ Challenge marqué comme échoué. Un don de ${totalDonationAmount.toFixed(2)}€ sera versé à ${associationName}.`;

    return {
      success: true,
      message: successMessage,
      data: {
        challengeId,
        newStatus: 'failed',
        transactionStatus: 'donated',
        donationAmount: totalDonationAmount
      }
    };

  } catch (error: unknown) {
    console.error("Error in markChallengeAsFailed:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Données invalides : " + error.errors.map(e => e.message).join(', '),
        error: 'VALIDATION_ERROR'
      };
    }

    return {
      success: false,
      message: "Une erreur inattendue s'est produite lors de la validation de l'échec du challenge",
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}