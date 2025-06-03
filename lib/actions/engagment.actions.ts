"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { ChallengeFormValues } from "../validations/engagement.validations";
import { createSupabaseClient } from "../supabase";
import { ChallengeActionResult, ChallengeStatus, ChallengeWithTransaction, CreateChallengeResult } from "@/types/challenge.types";
import { Transaction } from "@/types/transaction.types";




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
    const commissionRate = Number(process.env.COMMISSION_RATE || 0.15);
    const currentTimestamp = new Date().toISOString();
    
    const challengeData = {
      user_id: dbUserId,
      title: values.title,
      description: values.description,
      amount: values.amount,
      duration_days: values.duration_days,
      start_date: values.start_date.toISOString(),
      association_id: values.association_id,
      status: "pending" as const,
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

    // Création de la transaction associée
    const transactionData: Partial<Transaction> = {
      challenge_id: challenge.id,
      clerk_user_id: authUserId,
      amount: values.amount,
      commission: values.amount * commissionRate,
      status: 'initiated',
      payment_type: 'one-time',
      created_at: currentTimestamp,
    };

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Impossible de créer la transaction: ${transactionError.message}`);
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



export async function getChallenge(challenge_id: string):Promise<ChallengeWithTransaction> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Vous devez être connecté");
  }

  const supabase = await createSupabaseClient();
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (profileError) {
    throw new Error("Erreur lors de la récupération du profil utilisateur depuis la base de données.");
  }
  if (!userProfile) {
    throw new Error("Profil utilisateur introuvable. Assurez-vous que votre profil est correctement configuré.");
  }


  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      transactions!inner(*)
    `)
    .eq('id', challenge_id)
    .eq('user_id', userProfile.id)
    .eq('status', 'pending')
    .filter('transactions.status', 'eq', 'initiated') 
    .limit(1);

  if (error) {
    throw new Error("Erreur lors de la récupération du challenge");
  }

  const challenge = data?.[0];
  return challenge;
}

export interface MarkChallengeAsSuccessfulParams {
  challengeId: string;
  accomplishmentNote?: string;
  donateToAssociation?: boolean;
}

export async function markChallengeAsSuccessful(
  params: MarkChallengeAsSuccessfulParams
): Promise<ChallengeActionResult> {
  const { challengeId, accomplishmentNote, donateToAssociation = false } = params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Vous devez être connecté", error: "Non authentifié" };
    }

    const supabase = await createSupabaseClient();

    // Récupérer le profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (profileError || !userProfile) {
      return {
        success: false,
        message: "Erreur lors de la récupération du profil utilisateur",
        error: profileError?.message
      };
    }

    // Vérifier que le challenge existe, appartient à l'utilisateur et est en attente
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('user_id', userProfile.id)
      .eq('status', 'pending')
      .single();

    if (challengeError || !challenge) {
      return {
        success: false,
        message: "Challenge non trouvé ou déjà complété",
        error: challengeError?.message
      };
    }

    // Mettre à jour le statut du challenge
    const { error: updateError } = await supabase
      .from('challenges')
      .update({
        status: 'success' as ChallengeStatus,
        notes: accomplishmentNote || null
      })
      .eq('id', challengeId);

    if (updateError) {
      return {
        success: false,
        message: "Erreur lors de la mise à jour du challenge",
        error: updateError.message
      };
    }

    // Gérer la distribution de l'argent
    const newTransactionStatus = donateToAssociation ? 'donated' : 'refunded';

    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: newTransactionStatus
      })
      .eq('challenge_id', challengeId);

    if (transactionError) {
      return {
        success: false,
        message: donateToAssociation
          ? "Erreur lors de l'enregistrement du don"
          : "Erreur lors de l'enregistrement du remboursement",
        error: transactionError.message
      };
    }

    return {
      success: true,
      message: donateToAssociation
        ? "Félicitations pour votre réussite ! Votre don a été enregistré."
        : "Félicitations pour votre réussite ! Vous recevrez 85% de votre mise."
    };
  } catch (error: unknown) {
    console.error("Error in markChallengeAsSuccessful:", error);
    return {
      success: false,
      message: "Une erreur inattendue s'est produite",
      error: error instanceof Error ? error.message : "Une erreur a survenu lors de la validation du succès de l'engagement",

    };
  }
}


export interface MarkChallengeAsFailedParams {
  challengeId: string;
  failureNote?: string;
}

export async function markChallengeAsFailed(
  params: MarkChallengeAsFailedParams
): Promise<ChallengeActionResult> {
  const { challengeId, failureNote } = params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Vous devez être connecté", error: "Non authentifié" };
    }

    const supabase = await createSupabaseClient();

    // Récupérer le profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (profileError || !userProfile) {
      return {
        success: false,
        message: "Erreur lors de la récupération du profil utilisateur",
        error: profileError?.message
      };
    }

    // Récupérer le challenge pour vérification
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('user_id', userProfile.id)
      .eq('status', 'pending')
      .single();

    if (challengeError || !challenge) {
      return {
        success: false,
        message: "Challenge non trouvé ou déjà complété",
        error: challengeError?.message
      };
    }

    // Mettre à jour le statut du challenge
    const { error: updateError } = await supabase
      .from('challenges')
      .update({
        status: 'failed' as ChallengeStatus,
        notes: failureNote || null
      })
      .eq('id', challengeId);

    if (updateError) {
      return {
        success: false,
        message: "Erreur lors de la mise à jour du challenge",
        error: updateError.message
      };
    }

    // Mettre à jour la transaction pour indiquer que l'argent est donné à l'association
    const { error: donationError } = await supabase
      .from('transactions')
      .update({
        status: 'donated'
      })
      .eq('challenge_id', challengeId);

    if (donationError) {
      return {
        success: false,
        message: "Erreur lors de l'enregistrement du don",
        error: donationError.message
      };
    }

    return {
      success: true,
      message: "Votre challenge a été marqué comme échoué. Votre mise sera reversée à l'association."
    };
  } catch (error: unknown) {
    console.error("Error in markChallengeAsFailed:", error);
    return {
      success: false,
      message: "Une erreur inattendue s'est produite",
      error: error instanceof Error ? error.message : "Une erreur a survenu lors de la validation de l'échec de l'engagement",
    };
  }
}



