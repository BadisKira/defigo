import { NextResponse } from 'next/server';
import { mailjet, NEWSLETTER_LIST_ID } from '@/lib/mailjet/config';
import { verifyJWT } from '../../../../lib/jwt';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string()
});

/**
 * GET /api/newsletter/verify?token=xxx
 * Décodage du token JWT puis ajout du contact dans la liste.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { token } = verifySchema.parse({
      token: searchParams.get('token')
    });

    // Vérifier le token JWT
    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ 
        error: 'Token invalide ou expiré' 
      }, { status: 400 });
    }

    // Récupérer (ou créer) le contact pour obtenir son ID
    let contactId: number | null = null;
    try {
      const { body } = await mailjet.get('contact').id(decoded.email).request();
            
      //@ts-expect-error("Data is an array in the body")
      contactId = body?.Data?.[0]?.ID ?? null;
    } catch (err: any) {
      if (err?.statusCode !== 404) {
        console.error("Erreur lors de la recherche du contact:", err);
        throw err;
      }
    }

    if (!contactId) {
      try {
        const createRes: any = await mailjet.post('contact').request({ 
          Email: decoded.email, 
          IsExcludedFromCampaigns: false 
        });
        contactId = createRes.body.Data[0].ID;
      } catch (createErr: any) {
        console.error("Erreur lors de la création du contact:", createErr);
        return NextResponse.json({ 
          error: 'Erreur lors de la création du contact' 
        }, { status: 500 });
      }
    }

    // Ajouter le contact à la liste Newsletter
    try {
      await mailjet.post('listrecipient').request({
        ContactID: contactId,
        ListID: NEWSLETTER_LIST_ID,
        IsUnsubscribed: "false"
      });
      
      
      return NextResponse.json({ 
        message: 'Inscription confirmée avec succès ! Vous êtes maintenant inscrit à notre newsletter.',
        email: decoded.email
      }, { status: 200 });
      
    } catch (listErr: any) {
      console.error("Erreur lors de l'ajout à la liste:", listErr);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'ajout à la newsletter' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Newsletter verification error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Une erreur est survenue lors de la vérification' 
    }, { status: 500 });
  }
}