"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { ChallengeStatus } from "@/types/challenge.types";
import { Association } from "@/types/types";

export interface UserChallengesParams {
  status?: ChallengeStatus;
  page?: number;
  limit?: number;
}

export interface UserChallengesSummary {
  totalChallenges: number;
  successfulChallenges: number;
  failedChallenges: number;
  activeChallenges: number;
  totalDonated: number;
  associationsDonatedTo: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
}

export async function getUserChallenges({
  status,
  page = 1,
  limit = 10,
}: UserChallengesParams = {}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Vous devez être connecté pour accéder à vos défis");
  }

  const supabase = await createSupabaseClient();
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (profileError) {
    throw new Error("Erreur lors de la récupération du profil utilisateur");
  }

  if (!userProfile) {
    throw new Error("Profil utilisateur introuvable");
  }

  // Construire la requête de base
  let query = supabase
    .from("challenges")
    .select(
      `
      *,
      transactions (*),
      associations(id,name)
    `,
      { count: "exact" }
    )
    .eq("user_id", userProfile.id)
    .order("created_at", { ascending: false });

  // Filtrer par statut si spécifié
  if (status) {
    query = query.eq("status", status);
  }

  // Appliquer la pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: challenges, count, error } = await query;

  if (error) {
    throw new Error(`Erreur lors de la récupération des défis: ${error.message}`);
  }

  return {
    challenges,
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  };
}

export async function getUserChallengesSummary() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Vous devez être connecté pour accéder à vos statistiques");
  }

  const supabase = await createSupabaseClient();
  

  // Récupérer les statistiques des défis
  const { data: stats, error: statsError } = await supabase
    .from("challenges")
    .select("status, amount")
    .eq("clerk_user_id", userId);

  if (statsError) {
    throw new Error("Erreur lors de la récupération des statistiques");
  }

  // Récupérer les associations auxquelles l'utilisateur a donné
  const { data: donations, error: donationsError } = await supabase
    .from("challenges")
    .select(`amount,
      associations(id,name) `)
    .eq("clerk_user_id", userId)
    .eq("status", "failed");

  if (donationsError) {
    throw new Error("Erreur lors de la récupération des dons");
  }

  // Calculer les statistiques
  const totalChallenges = stats.length;
  const successfulChallenges = stats.filter(c => c.status === "success").length;
  const failedChallenges = stats.filter(c => c.status === "failed").length;
  const activeChallenges = stats.filter(c => c.status === "active").length;

  const totalDonated = donations.reduce((sum, challenge) => {
    const donationAmount = challenge.amount; 
    return sum + donationAmount;
  }, 0);

  // Regrouper les dons par association
  const associationMap = new Map();



  donations.forEach(donation => {
    const typedAssociation = donation.associations as Partial<Association>;
    if (!typedAssociation.id) return;

    const donationAmount = donation.amount * 0.85;
    if (associationMap.has(typedAssociation.id)) {
      const assoc = associationMap.get(typedAssociation.id);
      assoc.amount += donationAmount;
    } else {
      associationMap.set(typedAssociation.id, {
        id: typedAssociation.id,
        name: typedAssociation.name || "Association inconnue",
        amount: donationAmount,
      });
    }
  });

  return {
    totalChallenges,
    successfulChallenges,
    failedChallenges,
    activeChallenges,
    totalDonated : totalDonated * (100 - Number(process.env.COMMISSION_RATE!)) as number ,
    associationsDonatedTo: Array.from(associationMap.values()),
  };
}