export interface ChallengeFeedback {
    id: string; 
    challenge_id: string; 
    rating: number; 
    comment: string | null; 
    created_at: Date; 
  }
  
  interface CreateChallengeFeedback {
    challenge_id: string;
    rating: number; 
    comment: string | null;
  }
  
  interface UpdateChallengeFeedback {
    id: string;
    challenge_id?: string;
    rating?: number;
    comment?: string | null;
  }