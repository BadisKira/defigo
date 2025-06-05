"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe/stripe";
import { createSupabaseClient } from "@/lib/supabase";
import { Challenge } from "@/types/challenge.types";

export interface CreateCheckoutSessionResult {
    success: boolean;
    checkoutUrl?: string;
    error?: string;
}

export async function createStripeCheckoutSession({
    challengeId,
    amount,
}: {
    challengeId: string;
    amount: number;
}): Promise<CreateCheckoutSessionResult> {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: "Non autorisé" };
        }

        const supabase = await createSupabaseClient();
       

        const { data, error: getChallengeError } = await supabase
            .from("challenges")
            .select("*")
            .eq("id", challengeId)
            .eq("clerk_user_id", userId)
            .in("status", ["draft",'failed'])
            .single();

        const challenge = data as Challenge;

        if (!challenge) {
            return { success: false, error: "Défi non trouvé ou déja payé" };
        }

        if (getChallengeError) {
            throw new Error(getChallengeError.message);
        }

        // Créer la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Défi: ${challenge.title}`,
                            description: challenge.description || undefined,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/engagement/${challengeId}/payment`,
            metadata: {
                challenge_id: challengeId, 
                user_id: userId,
            },
        });

        await supabase
            .from('transactions')
            .update({ stripe_session_id: session.id  })
            .eq('challenge_id', challengeId)
            .eq('status', 'initiated');

        return {
            success: true,
            checkoutUrl: session.url!
        };

    } catch (error) {
        console.error("Erreur création session Stripe:", error);
        return {
            success: false,
            error: "Erreur lors de la création de la session de paiement"
        };
    }
}