"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { ChallengeFormValues } from "../validations/engagement.validations";
import { createSupabaseClient } from "../supabase";
import { Challenge, Transaction } from "@/types/types";

export interface CreateChallengeResult {
  success: boolean;
  challengeId?: string;
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

export async function getChallenge(challenge_id: string) {
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
    .filter('transactions.status', 'eq', 'initiated') // Correct: applique à la jointure
    .limit(1);

  if (error) {
    console.error("error =>", error);
    throw new Error("Erreur lors de la récupération du challenge");
  }

  const challenge = data?.[0];
  return challenge;
}
