"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { ChallengeFormValues } from "../validations/engagement.validations";
import { createSupabaseClient } from "../supabase";
import { redirect } from "next/navigation";

export async function createChallenge(values: ChallengeFormValues) {
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
    console.error("Supabase error fetching user profile:", profileError);
    throw new Error("Erreur lors de la récupération du profil utilisateur depuis la base de données.");
  }
  if (!userProfile) {
    console.error("User profile not found for auth_user_id:", authUserId);
    throw new Error("Profil utilisateur introuvable. Assurez-vous que votre profil est correctement configuré.");
  }

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

  const { data, error: insertError } = await supabase
    .from("challenges")
    .insert([challengeData])
    .select();

  if (insertError) {
    console.error("Supabase error creating challenge:", insertError);
    throw new Error("Impossible de créer le défi dans la base de données. Détails: " + insertError.message);
  }

  revalidatePath("/engagement");
  redirect("/");
}