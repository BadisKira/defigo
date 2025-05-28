import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(req: Request) {

  const Webhook_Secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!Webhook_Secret) {
    throw new Error(
      "Please add Clerk webhook secret from clerk dashboard to .env or .env.local"
    )
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Error occured -- no svix headers' }, { status: 400 });
  }

  // Récupérer le body de la requete
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Vérifier la signature avec la clé secrète
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET!);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;
  const supabase = createSupabaseClient();

  // Traiter les différents types d'événements
  switch (eventType) {
    case 'user.created': {
      const { email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses?.[0]?.email_address;
      const displayName = `${first_name || ''} ${last_name || ''}`.trim();

      const { error } = await supabase.from('user_profiles').insert({
        clerk_user_id: id,
        email,
        first_name,
        last_name,
        display_name: displayName,
        avatar_url: image_url,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating user profile:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      break;
    }
    case 'user.updated': { 
      const { email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses?.[0]?.email_address;
      const displayName = `${first_name || ''} ${last_name || ''}`.trim();

      const { error } = await supabase
        .from('user_profiles')
        .update({
          email,
          first_name,
          last_name,
          display_name: displayName,
          avatar_url: image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      break;
    }
    case 'user.deleted': {
      // Option 1: Supprimer l'utilisateur
      // const { error } = await supabase
      //   .from('user_profiles')
      //   .delete()
      //   .eq('clerk_user_id', id);

      // Option 2: Marquer l'utilisateur comme supprimé (soft delete)
      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error handling user deletion:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ success: true });
}