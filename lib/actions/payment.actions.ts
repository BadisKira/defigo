"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe/stripe";
import { createSupabaseClient } from "@/lib/supabase";




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
        const { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("clerk_user_id", userId)
            .single();

        if (profileError) {
            throw new Error("Erreur lors de la récupération du profil utilisateur depuis la base de données.");
        }
        if (!userProfile) {
            throw new Error("Profil utilisateur introuvable. Assurez-vous que votre profil est correctement configuré.");
        }

        const { data: challenge, error: getChallengeError } = await supabase
            .from("challenges")
            .select("*")
            .eq("id", challengeId)
            .eq("user_id", userProfile.id)
            .eq("status", "pending")


        if (!challenge) {
            return { success: false, error: "Défi non trouvé" };
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
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/engagment/${challengeId}/payment`,
            metadata: {
                challengeId,
                userId,
            },
        });

        const { data: transaction, error: getTransactionError } = await supabase
            .from('transaction')
            .update({ stripe_session_id: session.id })
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