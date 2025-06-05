export type TransactionStatus =
  | "initiated"
  | "paid"
  | "refunded"
  | "donated";
  
export type PaymentType = "one-time";


export type Transaction = {
  id: string;
  challenge_id: string;
  clerk_user_id: string;
  amount: number;
  commission?: number;
  status: TransactionStatus;
  payment_type: PaymentType;
  created_at: string;            
  stripe_payment_id?: string;    
  stripe_session_id?: string;    
  webhook_received_at?: string;  
  payment_method_id?: string;    
  refund_id?: string;            
};