"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { ChallengeStatus } from "@/types/challenge.types";

export interface UserChallengesParams {
  status?: ChallengeStatus;
  page?: number;
  limit?: number;
}

export interface UserChallengesSummary {
  totalChallenges: number;
  successfulChallenges: number;
  failedChallenges: number;
  pendingChallenges: number;
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
      transactions (*)
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
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (profileError || !userProfile) {
    throw new Error("Erreur lors de la récupération du profil utilisateur");
  }

  // Récupérer les statistiques des défis
  const { data: stats, error: statsError } = await supabase
    .from("challenges")
    .select("status, amount")
    .eq("user_id", userProfile.id);

  if (statsError) {
    throw new Error("Erreur lors de la récupération des statistiques");
  }

  // Récupérer les associations auxquelles l'utilisateur a donné
  const { data: donations, error: donationsError } = await supabase
    .from("challenges")
    .select("association_id, association_name, amount")
    .eq("user_id", userProfile.id)
    .eq("status", "failed");

  if (donationsError) {
    throw new Error("Erreur lors de la récupération des dons");
  }

  // Calculer les statistiques
  const totalChallenges = stats.length;
  const successfulChallenges = stats.filter(c => c.status === "success").length;
  const failedChallenges = stats.filter(c => c.status === "failed").length;
  const pendingChallenges = stats.filter(c => c.status === "pending").length;
  
  // Calculer le montant total donné (15% de commission déduite)
  const totalDonated = donations.reduce((sum, challenge) => {
    const donationAmount = challenge.amount * 0.85; // 85% du montant va à l'association
    return sum + donationAmount;
  }, 0);

  // Regrouper les dons par association
  const associationMap = new Map();
  donations.forEach(donation => {
    if (!donation.association_id) return;
    
    const donationAmount = donation.amount * 0.85;
    if (associationMap.has(donation.association_id)) {
      const assoc = associationMap.get(donation.association_id);
      assoc.amount += donationAmount;
    } else {
      associationMap.set(donation.association_id, {
        id: donation.association_id,
        name: donation.association_name || "Association inconnue",
        amount: donationAmount,
      });
    }
  });

  return {
    totalChallenges,
    successfulChallenges,
    failedChallenges,
    pendingChallenges,
    totalDonated,
    associationsDonatedTo: Array.from(associationMap.values()),
  };
}