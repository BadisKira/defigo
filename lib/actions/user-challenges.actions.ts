"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { ChallengeStatus, ChallengeWithTransactionAndAssoc } from "@/types/challenge.types";

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
}: UserChallengesParams = {}):Promise<UserChallengesResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Vous devez être connecté pour accéder à vos défis");
  }

  const supabase = await createSupabaseClient();

  // Construire la requête optimisée avec un seul appel
  let query = supabase
    .from("challenges")
    .select(
      `
      *,
      transactions(*),
      associations(id, name, logo_url)
    `,
      { count: "exact" }
    )
    .eq("clerk_user_id", userId)
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
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Vous devez être connecté pour accéder à vos statistiques");
  }

  const supabase = await createSupabaseClient();

  // Appeler la fonction PostgreSQL optimisée
  const { data, error } = await supabase
    .rpc('get_user_challenges_summary', {
      user_clerk_id: userId
    });

  if (error) {
    throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
  }

  if (!data || data.length === 0) {
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