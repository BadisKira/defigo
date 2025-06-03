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

