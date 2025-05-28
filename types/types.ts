export type UserProfile = {
    id: string;
    clerk_user_id: string;
    email: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    country?: string;
    is_admin: boolean;
    last_seen?: string;
    created_at: string;
};


export type ChallengeStatus = 'pending' | 'success' | 'failed';

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
};


export type TransactionStatus = 'initiated' | 'paid' | 'refunded' | 'donated';
export type PaymentType = 'one-time';

export type Transaction = {
    id: string;
    challenge_id: string;
    clerk_user_id: string;
    stripe_payment_id?: string;
    amount: number;
    commission?: number;
    status: TransactionStatus;
    payment_type: PaymentType;
    created_at: string;
};


export type ChallengeFeedback = {
    id: string;
    challenge_id: string;
    rating?: number;
    comment?: string;
    created_at: string;
};
