"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { createSupabaseClient } from "../supabase";

// Cache partagé pour les user profiles (même instance que user-challenges.actions.ts)
const userProfileCache = new Map<string, { id: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire partagée pour récupérer l'UUID utilisateur
async function getUserProfileId(clerkUserId: string): Promise<string> {
  const cached = userProfileCache.get(clerkUserId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.id;
  }

  const supabase = createSupabaseClient();
  const { data: userProfile, error } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error || !userProfile) {
    throw new Error("Profil utilisateur introuvable");
  }

  userProfileCache.set(clerkUserId, {
    id: userProfile.id,
    timestamp: Date.now()
  });

  return userProfile.id;
}
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

// Schema pour validation du feedback
const saveFeedbackSchema = z.object({
  challengeId: z.string().uuid("ID du défi invalide"),
  rating: z.number().min(0.5).max(5).refine(
    (val) => (val * 2) % 1 === 0, 
    "Le rating doit avoir une précision de 0.5"
  ),
  comment: z.string().optional()
});


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
    // Validation des paramètres (sans accomplishmentNote et rating qui sont gérés séparément)
    const validationSchema = z.object({
      challengeId: z.string().uuid("ID du défi invalide"),
      donateToAssociation: z.boolean().optional().default(false)
    });
    
    const validatedParams = validationSchema.parse(params);
    const { challengeId, donateToAssociation } = validatedParams;

    // Authentification
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { 
        success: false, 
        message: "Authentification requise pour valider un challenge",
        error: "UNAUTHORIZED" 
      };
    }

    // Récupérer l'ID utilisateur
    let userId: string;
    try {
      userId = await getUserProfileId(clerkUserId);
    } catch {
      return {
        success: false,
        message: "Profil utilisateur introuvable",
        error: "USER_PROFILE_NOT_FOUND"
      };
    }

    const supabase = createSupabaseClient();

    // Appeler la procédure stockée pour marquer le challenge comme réussi
    const { data: result, error: rpcError } = await supabase.rpc(
      'mark_challenge_successful',
      {
        p_challenge_id: challengeId,
        p_user_id: userId,
        p_donate_to_association: donateToAssociation
      }
    );

    if (rpcError || !result?.success) {
      console.error('RPC error:', rpcError || result?.error);
      return {
        success: false,
        message: result?.error || "Erreur lors de la validation du challenge",
        error: 'RPC_FAILED'
      };
    }

    // Revalidate paths
    revalidatePath(`/defi/${challengeId}`);
    revalidatePath('/mon-aventure');

    return {
      success: true,
      message: result.message,
      data: {
        challengeId,
        newStatus: result.data.new_status,
        transactionStatus: result.data.transaction_status,
        refundAmount: result.data.refund_amount
      }
    };

  } catch (error: unknown) {
    console.error("Error in markChallengeAsSuccessful:", error);
    
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
    // Validation des paramètres (sans failureNote qui est géré séparément)
    const validationSchema = z.object({
      challengeId: z.string().uuid("ID du défi invalide")
    });
    
    const validatedParams = validationSchema.parse(params);
    const { challengeId } = validatedParams;

    // Authentification
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { 
        success: false, 
        message: "Authentification requise pour marquer un challenge comme échoué",
        error: "UNAUTHORIZED" 
      };
    }

    // Récupérer l'ID utilisateur
    let userId: string;
    try {
      userId = await getUserProfileId(clerkUserId);
    } catch {
      return {
        success: false,
        message: "Profil utilisateur introuvable",
        error: "USER_PROFILE_NOT_FOUND"
      };
    }

    const supabase = createSupabaseClient();

    // Appeler la procédure stockée pour marquer le challenge comme échoué
    const { data: result, error: rpcError } = await supabase.rpc(
      'mark_challenge_failed',
      {
        p_challenge_id: challengeId,
        p_user_id: userId
      }
    );

    if (rpcError || !result?.success) {
      console.error('RPC error:', rpcError || result?.error);
      return {
        success: false,
        message: result?.error || "Erreur lors de la validation de l'échec du challenge",
        error: 'RPC_FAILED'
      };
    }

    // Revalidate paths
    revalidatePath(`/defi/${challengeId}`);
    revalidatePath('/mon-aventure');

    return {
      success: true,
      message: result.message,
      data: {
        challengeId,
        newStatus: result.data.new_status,
        transactionStatus: 'succeeded',
        transactionsUpdated: result.data.transactions_updated
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

// Nouvelle action pour sauvegarder le feedback
export async function saveChallengeReview(
  challengeId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Validation des paramètres
    const validatedParams = saveFeedbackSchema.parse({
      challengeId,
      rating,
      comment
    });

    // Authentification
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { 
        success: false, 
        message: "Authentification requise",
        error: "UNAUTHORIZED" 
      };
    }

    // Récupérer l'ID utilisateur
    let userId: string;
    try {
      userId = await getUserProfileId(clerkUserId);
    } catch {
      return {
        success: false,
        message: "Profil utilisateur introuvable",
        error: "USER_PROFILE_NOT_FOUND"
      };
    }

    const supabase = createSupabaseClient();

    // Appeler la procédure stockée pour sauvegarder le feedback
    const { data: result, error: rpcError } = await supabase.rpc(
      'save_challenge_feedback',
      {
        p_challenge_id: validatedParams.challengeId,
        p_user_id: userId, // userId est déjà un UUID string depuis getUserProfileId()
        p_rating: validatedParams.rating,
        p_comment: validatedParams.comment || null
      }
    );

    if (rpcError || !result?.success) {
      console.error('RPC error:', rpcError || result?.error);
      return {
        success: false,
        message: result?.error || "Erreur lors de l'enregistrement du feedback",
        error: 'RPC_FAILED'
      };
    }

    // Revalidate paths
    revalidatePath(`/defi/${challengeId}`);
    revalidatePath('/mon-aventure');

    return {
      success: true,
      message: "Merci pour votre retour ! Votre feedback a été enregistré avec succès."
    };

  } catch (error: unknown) {
    console.error("Error in saveChallengeReview:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Données invalides : " + error.errors.map(e => e.message).join(', '),
        error: 'VALIDATION_ERROR'
      };
    }

    return {
      success: false,
      message: "Une erreur inattendue s'est produite lors de l'enregistrement du feedback",
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}
