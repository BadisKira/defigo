import { Transaction } from "./transaction.types";
import { Association } from "./types";

export type ChallengeStatus =  'pending' | 'success' | 'failed';


export interface Challenge {
  id: string;
  association_id?: string;
  feedback_id?: string;
  user_id?: string;
  title: string;
  description?: string;
  amount: number; // <= 500
  duration_days: number;
  start_date: string;
  end_date?: string;
  status: ChallengeStatus; // 'pending' par défaut
  created_at: string;
  stripe_payment_status: string; // 'pending' par défaut
}


// autres types used in actions 
export interface ChallengeWithTransaction extends Challenge {
  transaction?: Transaction;
}

export interface ChallengeWithTransactionAndAssoc extends ChallengeWithTransaction {
  associations:Partial<Association>
}

export interface GetChallengeResult {
  challenge?: ChallengeWithTransaction;
  error?: string;
}


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