"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { ChallengeFormValues } from "../validations/engagement.validations";
import { createSupabaseClient } from "../supabase";
import { Challenge, ChallengeStatus, Transaction } from "@/types/types";

export interface CreateChallengeResult {
  success: boolean;
  challengeId?: string;
  error?: string;
}

export interface ChallengeActionResult {
  success: boolean;
  message: string;
  error?: string;
}


export async function createChallenge(values: ChallengeFormValues): Promise<CreateChallengeResult> {
  const { userId: authUserId } = await auth();
  if (!authUserId) {
    throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
  }
  const supabase = await createSupabaseClient();
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("clerk_user_id", authUserId)
    .single();

  if (profileError) {
    throw new Error("Erreur lors de la récupération du profil utilisateur depuis la base de données.");
  }
  if (!userProfile) {
    throw new Error("Profil utilisateur introuvable. Assurez-vous que votre profil est correctement configuré.");
  }

  try {
    const dbUserId = userProfile.id;
    const challengeData = {
      user_id: dbUserId,
      title: values.title,
      description: values.description,
      amount: values.amount,
      duration_days: values.duration_days,
      start_date: values.start_date.toISOString(),
      association_id: values.association_id,
      status: "pending",
    };

    const { data: challenge, error: insertError } = await supabase
      .from("challenges")
      .insert([challengeData])
      .select("*")
      .single();

    if (insertError) {
      throw new Error("Impossible de créer le défi dans la base de données. Détails: " + insertError.message);
    }

    // créer la transaction associé 
    const createtransaction: Partial<Transaction> = {
      //@ts-ignore
      challenge_id: challenge.id,
      clerk_user_id: authUserId,
      amount: values.amount,
      commission: values.amount * Number(process.env.COMMISSION_RATE || 0.15),
      status: 'initiated',
      payment_type: 'one-time',
      created_at: new Date().toISOString(),
    }

    const { data: transaction, error: transactionError } = await supabase.from("transactions")
      .insert([createtransaction])
      .select()
      .single();

    if (transactionError) {
      throw new Error("Impossible de créer le défi dans la base de données. Détails: " + transactionError.message);
    }

    revalidatePath("/engagement");

    return {
      success: true,
      //@ts-ignore
      challengeId: challenge.id
    };
  } catch (error) {
    console.log("Error => ", error);
    return {
      success: false,
      error: "Une erreur de je sais pas quoi putain",
      //@ts-ignore
      challengeId: challenge.id
    };
  }
}

export interface ChallengeWithTransaction extends Challenge {
  transaction?: Transaction;
}

export interface GetChallengeResult {
  challenge?: ChallengeWithTransaction;
  error?: string;
}

export async function getChallenge(challenge_id: string): Promise<GetChallengeResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Vous devez être connecté" };
    }

    const supabase = await createSupabaseClient();
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return { error: "Erreur lors de la récupération du profil utilisateur" };
    }
    
    if (!userProfile) {
      return { error: "Profil utilisateur introuvable" };
    }

    // Récupérer le challenge avec ses transactions et les informations de l'association
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        transactions(*)
      `)
      .eq('id', challenge_id)
      .eq('user_id', userProfile.id)
      .limit(1);

    if (error) {
      console.error("Error fetching challenge:", error);
      return { error: "Erreur lors de la récupération du challenge" };
    }

    const rawChallenge = data?.[0];
    if (!rawChallenge) {
      return { error: "Challenge non trouvé ou vous n'êtes pas autorisé à y accéder" };
    }
    
    // Transformer les données pour correspondre au type ChallengeWithTransaction
    const challenge: ChallengeWithTransaction = {
      id: rawChallenge.id,
      user_id: rawChallenge.user_id,
      title: rawChallenge.title,
      description: rawChallenge.description,
      amount: rawChallenge.amount,
      start_date: rawChallenge.start_date,
      end_date: rawChallenge.end_date,
      status: rawChallenge.status as ChallengeStatus,
      association_name: rawChallenge.association_name,
      created_at: rawChallenge.created_at,
      duration_days:rawChallenge.duration_days,
      // Si des transactions existent, prendre la première
      transaction: rawChallenge.transactions && rawChallenge.transactions.length > 0 
        ? rawChallenge.transactions[0] as Transaction 
        : undefined
    };

    return { challenge };
  } catch (error: any) {
    console.error("Unexpected error in getChallenge:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
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
  } catch (error: any) {
    console.error("Error in markChallengeAsSuccessful:", error);
    return { 
      success: false, 
      message: "Une erreur inattendue s'est produite", 
      error: error.message 
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
  } catch (error: any) {
    console.error("Error in markChallengeAsFailed:", error);
    return { 
      success: false, 
      message: "Une erreur inattendue s'est produite", 
      error: error.message 
    };
  }
}



