import { Transaction } from "./transaction.types";

export type ChallengeStatus =  'pending' | 'success' | 'failed';

export type Challenge = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  amount: number;
  duration_days: number;
  start_date: string;              
  end_date: string;                
  status: ChallengeStatus;
  association_id?: string;
  association_name: string;
  association_url?: string;
  accomplishment_note?: string;
  created_at: string;              
  stripe_payment_status?: string;  
};


// autres types used in actions 
export interface ChallengeWithTransaction extends Challenge {
  transaction?: Transaction;
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