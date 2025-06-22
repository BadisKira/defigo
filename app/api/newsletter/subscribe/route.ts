import { NextResponse } from 'next/server';
import { mailjet, NEWSLETTER_LIST_ID } from '@/lib/mailjet/config';
import { newsletterSubscriptionSchema } from '@/lib/validations/newsletter';
import { generateJWT } from '@/lib/jwt';
import { handleSendEmail } from '../../mailjet/helper';

// Interface pour les données d'email
interface EmailData {
  from: { Email: string; Name: string };
  to: { Email: string; Name: string }[];
  subject: string;
  html: string;
  text: string;
  templateId?: number;
  variables?: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = newsletterSubscriptionSchema.parse(body);

    // 1. Vérifier si l'email est déjà dans la liste
    try {
      const listCheck = await mailjet.get('listrecipient').request({
        ContactEmail: email,
        ListID: NEWSLETTER_LIST_ID,
        Limit: 1
      });
  
      //@ts-expect-error("Data is an array in the body")
      const wantedListToCheck = listCheck.body?.Data?.filter((item: any) => item.ListID === Number(NEWSLETTER_LIST_ID));
      if (wantedListToCheck?.length > 0) {
        const membership = wantedListToCheck[0];
        const isHeThere = (membership.IsActive && !membership.IsUnsubscribed && membership.ListID === Number(NEWSLETTER_LIST_ID));
        if (isHeThere) {
          return NextResponse.json({ 
            error: 'Vous êtes déjà inscrit à la newsletter.' 
          }, { status: 409 });
        }
      }
    } catch (listErr: any) {
      console.error("Erreur lors de la vérification de l'abonnement:", listErr);
    }

   
    // 2. Créer le contact (sans l'ajouter à la liste)
    try {
      await mailjet.post('contact').request({
        Email: email,
        Name: name || undefined,
        IsExcludedFromCampaigns: false
      });
      
    } catch (createErr: any) {
      // Si le contact existe déjà, c'est OK
      if (createErr.statusCode === 400 && createErr.message?.includes('already exists')) {
      } else {
        return NextResponse.json({ 
          error: 'Erreur lors de la création du contact.' 
        }, { status: 500 });
      }
    }

    // 3. Générer le token et envoyer l'email de vérification
    const token = generateJWT({ email, exp: Math.floor(Date.now() / 1000) + 6 * 60 * 60 });
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${token}`;

    try {
      const emailData: EmailData = {
        from: { 
          Email: 'contact@deklik.org', 
          Name: 'deKliK' 
        },
        to: [{ 
          Email: email, 
          Name: name || '' 
        }],
        subject: 'Confirmez votre inscription à la newsletter',
        html: `
          <h1>Bienvenue chez deKliK !</h1>
          <p>Merci de cliquer sur le lien suivant pour confirmer votre inscription :</p>
          <p><a href="${verificationUrl}">Confirmer mon inscription</a></p>
          <p>Ce lien expirera dans 6 heures.</p>
        `,
        text: `
          Bienvenue chez deKliK !
          
          Merci de cliquer sur le lien suivant pour confirmer votre inscription :
          ${verificationUrl}
          
          Ce lien expirera dans 6 heures.
        `
      };
      
      await handleSendEmail(emailData);
      
    } catch (emailError: any) {
      console.error("Erreur lors de l'envoi d'email:", emailError);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'envoi de l\'email de vérification. Veuillez réessayer.' 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Un e-mail de vérification vous a été envoyé.' });
    
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur interne' 
    }, { status: 500 });
  }
}