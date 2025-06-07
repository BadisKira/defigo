import { ChallengeFeedback } from "./challenge_feedback.types";
import { Transaction, TransactionStatus } from "./transaction.types";
import { Association } from "./types";

export type ChallengeStatus =
  | "draft"
  | "active"
  | "validated"
  | "failed"
  | "expired";


  export type StripePaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded";


export interface Challenge {
  id: string;
  association_id?: string;
  feedback_id?: string;
  user_id?: string;
  clerk_user_id?:string;
  title: string;
  description?: string;
  amount: number; // <= 500
  duration_days: number;
  start_date: string;
  end_date?: string;
  status: ChallengeStatus; 
  created_at: string;
  stripe_payment_status: StripePaymentStatus; 
}


// autres types used in actions 
export interface ChallengeWithTransaction extends Challenge {
  transactions: Transaction;
}

export interface ChallengeWithTransactionAndAssoc extends ChallengeWithTransaction {
  associations:Partial<Association>
}

export interface ChallengeWithTransactionAndAssocAndFeedback extends ChallengeWithTransactionAndAssoc {
  challenge_feedbacks:Partial<ChallengeFeedback>
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


export interface MarkChallengeAsSuccessfulParams {
  challengeId: string;
  accomplishmentNote?: string;
  rating?: number; 
  donateToAssociation?: boolean;
}


export interface MarkChallengeAsFailedParams {
  challengeId: string;
  failureNote?: string;
}