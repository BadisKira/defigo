"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { ChallengeStatus, ChallengeWithTransactionAndAssoc } from "@/types/challenge.types";

// Cache pour éviter les requêtes répétées dans la même session
const userProfileCache = new Map<string, { id: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire optimisée pour récupérer l'UUID utilisateur
async function getUserProfileId(clerkUserId: string): Promise<string> {
  // Vérifier le cache d'abord
  const cached = userProfileCache.get(clerkUserId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.id;
  }

  const supabase = await createSupabaseClient();
  const { data: userProfile, error } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error || !userProfile) {
    throw new Error("Profil utilisateur introuvable");
  }

  // Mettre en cache le résultat
  userProfileCache.set(clerkUserId, {
    id: userProfile.id,
    timestamp: Date.now()
  });

  return userProfile.id;
}

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
  expiredChallenges: number;
  draftChallenges: number;
  totalDonated: number;
  associationsDonatedTo: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
}


export interface UserChallengesResult {
  challenges: ChallengeWithTransactionAndAssoc[],
    pagination: {
      total: number,
      page:number,
      limit:number,
      totalPages: number,
    },
}

export async function getUserChallenges({
  status,
  page = 1,
  limit = 10,
}: UserChallengesParams = {}): Promise<UserChallengesResult> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Vous devez être connecté pour accéder à vos défis");
  }

  // Utiliser la fonction utilitaire optimisée
  const userId = await getUserProfileId(clerkUserId);
  const supabase = await createSupabaseClient();

  // Calculer la pagination une seule fois
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Construire la requête optimisée avec select spécifique
  let query = supabase
    .from("challenges")
    .select(
      `
      id,
      title,
      description,
      amount,
      status,
      start_date,
      end_date,
      duration_days,
      created_at,
      updated_at,
      transactions(id, amount, status, stripe_payment_intent_id, commission_amount),
      associations(id, name, logo_url)
    `,
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Appliquer le filtre de statut si nécessaire
  if (status) {
    query = query.eq("status", status);
  }

  const { data: challenges, count, error } = await query;

  if (error) {
    throw new Error(`Erreur lors de la récupération des défis: ${error.message}`);
  }

  return {
    challenges: challenges || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  };
}



export async function getUserChallengesSummary(): Promise<UserChallengesSummary> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Vous devez être connecté pour accéder à vos statistiques");
  }

  // Utiliser la fonction utilitaire optimisée
  const userId = await getUserProfileId(clerkUserId);
  const supabase = await createSupabaseClient();

  // Appeler la fonction PostgreSQL optimisée
  const { data, error } = await supabase
    .rpc('get_user_challenges_summary', {
      p_user_id: userId
    });

  if (error) {
    throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
  }

  // Retourner les valeurs par défaut si pas de données
  if (!data?.[0]) {
    return {
      totalChallenges: 0,
      successfulChallenges: 0,
      failedChallenges: 0,
      activeChallenges: 0,
      expiredChallenges: 0,
      draftChallenges: 0,
      totalDonated: 0,
      associationsDonatedTo: [],
    };
  }

  const result = data[0];

  return {
    totalChallenges: result.total_challenges,
    successfulChallenges: result.successful_challenges,
    failedChallenges: result.failed_challenges,
    activeChallenges: result.active_challenges,
    expiredChallenges: result.expired_challenges,
    draftChallenges: result.draft_challenges,
    totalDonated: Number(result.total_donated),
    associationsDonatedTo: result.associations_donated_to || [],
  };
}