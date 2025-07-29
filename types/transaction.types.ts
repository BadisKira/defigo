export type TransactionStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";
  
export type TransactionType = "capture" | "refund";


export type Transaction = {
  id: string;
  challenge_id: string;
  user_id: string;
  amount: number;
  net_amount: number;
  commission_amount: number;
  status: TransactionStatus;
  type: TransactionType;
  created_at: string;
  updated_at: string;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_refund_id?: string | null;
  stripe_webhook_id?: string | null;
  processed_at?: string | null;
  failure_reason?: string | null;
  metadata?: Record<string, any> | null;
};