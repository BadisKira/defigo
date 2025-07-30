import { ChallengeFeedback } from "./challenge_feedback.types";
import { Transaction, TransactionStatus } from "./transaction.types";
import { Association } from "./types";
import { Tables, TablesInsert, TablesUpdate, Enums } from "./supabase";

// ===== TYPES DE BASE (Direct Supabase) =====
export type Challenge = Tables<"challenges">;
export type ChallengeInsert = TablesInsert<"challenges">;
export type ChallengeUpdate = TablesUpdate<"challenges">;
export type ChallengeStatus = Enums["challenge_status_enum"];

// ===== TYPES MÉTIER (Custom) =====

// Interface pour les données du formulaire de création
export interface CreateChallengeFormData {
  title: string;
  description?: string;
  amount: number;
  duration_days: number;
  start_date: Date; // Form utilise Date, DB utilise string
  association_id: string;
  allow_ai_usage?: boolean;
  accept_terms: boolean;
}

// Interface pour créer un défi en base (après transformation)
export interface CreateChallengeData {
  title: string;
  description?: string | null;
  amount: number;
  duration_days: number;
  start_date: string; // ISO string pour la DB
  end_date: string; // Calculé automatiquement
  association_id: string;
  user_id: string;
  status?: ChallengeStatus;
  commission_rate?: number;
}

// ===== TYPES AVEC JOINTURES =====

// Défi avec transactions (pour les requêtes avec jointures)
export interface ChallengeWithTransaction extends Challenge {
  transactions: Transaction;
}

// Défi avec transactions et association
export interface ChallengeWithTransactionAndAssoc extends Challenge {
  transactions: Transaction;
  associations: Partial<Association>;
}

// Défi avec toutes les relations
export interface ChallengeWithTransactionAndAssocAndFeedback extends Challenge {
  transactions: Transaction;
  associations: Partial<Association>;
  challenge_feedbacks: Partial<ChallengeFeedback>;
}

// ===== TYPES DE RÉSULTATS =====

// Résultat de création de défi
export interface CreateChallengeResult {
  success: boolean;
  challengeId?: string;
  error?: string;
}

// Résultat générique des actions sur défi
export interface ChallengeActionResult {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    challengeId: string;
    newStatus: ChallengeStatus;
    transactionStatus: TransactionStatus;
    refundAmount?: number;
    donationAmount?: number;
  };
}

// ===== PARAMÈTRES DES ACTIONS =====

// Paramètres pour marquer un défi comme réussi
export interface MarkChallengeAsSuccessfulParams {
  challengeId: string;
  donateToAssociation?: boolean;
}

// Paramètres pour marquer un défi comme échoué
export interface MarkChallengeAsFailedParams {
  challengeId: string;
}

// Paramètres pour sauvegarder le feedback utilisateur
export interface SaveChallengeFeedbackParams {
  challengeId: string;
  rating: number;
  comment?: string;
}