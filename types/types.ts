export type WebhookEvent = {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed_at: string;   
  metadata: Record<string, any>; 
};

export type Association = {
  id: string; 
  external_id?: string | null;
  name: string;
  category?: string | null;
  description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  siren?: string | null;
  siret?: string | null;
  created_at?: string; 
  updated_at?: string; 
};