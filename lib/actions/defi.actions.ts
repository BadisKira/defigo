"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { createSupabaseClient } from "../supabase";
import { 
  ChallengeActionResult, 
  ChallengeWithTransactionAndAssocAndFeedback, 
  CreateChallengeFormData,
  ChallengeInsert,
  MarkChallengeAsFailedParams, 
  MarkChallengeAsSuccessfulParams 
} from "@/types/challenge.types";
import { TransactionStatus } from "@/types/transaction.types";
import { markChallengeFailedSchema, markChallengeSchema } from "../validations/defi.validations";


// Fonction utilitaire pour calculer la date de fin
function calculateEndDate(startDate: Date, durationDays: number): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate.toISOString();
}

// Transformation des données du formulaire vers les données de base
function transformFormDataToDbData(
  formData: CreateChallengeFormData, 
  userId: string
): ChallengeInsert {
  const startDate = formData.start_date;
  const endDate = calculateEndDate(startDate, formData.duration_days);

  return {
    user_id: userId,
    title: formData.title,
    description: formData.description || null,
    amount: formData.amount,
    duration_days: formData.duration_days,
    start_date: startDate.toISOString(),
    end_date: endDate,
    association_id: formData.association_id,
    status: 'draft',
    // commission_rate supprimé - utilise la valeur par défaut de la DB
  };
}

export async function createChallenge(formData: CreateChallengeFormData): Promise<void> {
  try {
    // Authentification
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
    }

    const supabase = createSupabaseClient();

    // Récupération optimisée du profil utilisateur (seulement l'ID)
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (profileError || !userProfile) {
      if (profileError?.code === 'PGRST116') {
        throw new Error("Profil utilisateur introuvable. Veuillez contacter le support pour créer votre profil.");
      } else {
        throw new Error(`Erreur lors de la récupération du profil: ${profileError?.message || 'Erreur de base de données'}`);
      }
    }

    // Transformation et insertion optimisées
    const challengeInsertData = transformFormDataToDbData(formData, userProfile.id);

    const { data: challenge, error: insertError } = await supabase
      .from("challenges")
      .insert(challengeInsertData)
      .select("id")
      .single();

    if (insertError || !challenge) {
      throw new Error(`Impossible de créer le défi: ${insertError?.message || 'Données manquantes'}`);
    }

    // Revalidation des chemins
    revalidatePath("/defi");
    revalidatePath("/mon-aventure");

    // Redirection côté serveur
    redirect(`/defi/${challenge.id}/payment`);

  } catch (error: unknown) {
    // En cas d'erreur, on re-throw pour que le formulaire puisse l'attraper
    throw error instanceof Error ? error : new Error("Une erreur inattendue s'est produite lors de la création du défi");
  }
}



export async function getChallenge(challenge_id: string): Promise<ChallengeWithTransactionAndAssocAndFeedback> {
  try {
    // Authentification
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      throw new Error("Vous devez être connecté pour accéder au défi.");
    }

    const supabase = createSupabaseClient();

    // Récupération du profil utilisateur pour avoir l'ID DB
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (profileError || !userProfile) {
      throw new Error("Profil utilisateur introuvable.");
    }

    // Requête avec jointures et typage fort
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        transactions(*),
        associations(id, name),
        challenge_feedbacks(*)
      `)
      .eq('id', challenge_id)
      .eq('user_id', userProfile.id) // Utiliser l'ID DB au lieu de clerk_user_id
      .maybeSingle();

    if (error) {
      console.error("Erreur Supabase lors de la récupération du défi:", error);
      throw new Error("Erreur lors de la récupération du défi.");
    }

    if (!data) {
      throw new Error("Défi introuvable ou vous n'y avez pas accès.");
    }

    return data as ChallengeWithTransactionAndAssocAndFeedback;
  } catch (error) {
    console.error("Erreur dans getChallenge:", error);
    throw error;
  }
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

    const supabase = createSupabaseClient();

    
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

    const supabase = createSupabaseClient();

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




export async function deleteChallenge(challengeId: string) {
  try {
    if (!challengeId?.trim()) {
      return { success: false, error: 'ID du défi manquant' };
    }

    // Authentification
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: 'Non authentifié' };
    }

    const supabase = createSupabaseClient();
    
    // Récupération du profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (profileError || !userProfile) {
      return { success: false, error: 'Profil utilisateur introuvable' };
    }

    // Vérifier le statut du défi avec typage fort
    const { data: challenge, error: fetchError } = await supabase
      .from('challenges')
      .select('status')
      .eq('id', challengeId)
      .eq('user_id', userProfile.id)
      .single();

    if (fetchError) {
      console.error('Erreur lors de la récupération du défi:', fetchError);
      return { success: false, error: 'Défi introuvable' };
    }

    if (challenge.status !== 'draft') {
      return { success: false, error: 'Seuls les défis en brouillon peuvent être supprimés' };
    }

    // Supprimer le défi avec la procédure stockée
    const { error: deleteError } = await supabase
      .rpc('delete_challenge_with_transactions', {
        p_challenge_id: challengeId
      });

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError);
      return { success: false, error: 'Erreur lors de la suppression' };
    }

    // Revalidation des chemins
    revalidatePath("/defi");
    revalidatePath("/mon-aventure");
  
    return { success: true, message: 'Défi supprimé avec succès' };

  } catch (error) {
    console.error('Erreur dans deleteChallenge:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    };
  }
}
