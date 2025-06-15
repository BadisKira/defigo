import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/stripe';
import {
    validatePaymentAmount,
    verifyUserOwnsChallenge,
    calculateCommission,
} from '@/lib/stripe/stripe-security';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { Transaction, TransactionStatus } from '@/types/transaction.types';

const supabase = createServiceRoleSupabaseClient();


export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Non autorisé" }, { status: 401 });
        }


        // // 2. Rate limiting moderne ( mais faut changer vu que vercel est serveless)
        // const forwardedFor = request.headers.get('x-forwarded-for');
        // const clientIP = forwardedFor?.split(',')[0] || 'unknown';

        // if (!checkRateLimit(`${userId}-${clientIP}`, 3, 300000)) {
        //     return Response.json({ error: 'Trop de requêtes' }, { status: 429 });
        // }

        // 3. Validation des données avec Next.js 15
        const body = await request.json();
        const { challengeId, amount } = body;

        if (!challengeId || !amount || typeof amount !== 'number') {
            return Response.json({ error: 'Données invalides' }, { status: 400 });
        }

        if (!validatePaymentAmount(amount)) {
            return Response.json({ error: 'Montant invalide' }, { status: 400 });
        }


        // 4. Vérifications de sécurité
        const ownsChallenge = await verifyUserOwnsChallenge(challengeId, userId);
        if (!ownsChallenge) {
            return Response.json({ error: 'Challenge non trouvé' }, { status: 404 });
        }


        // does a transaction existe ?? -- with status other than initiated ?
        const { data: existantTransaction } = await supabase
            .from('transactions')
            .select("*")
            .eq("challenge_id", challengeId)
            .single();


        

        const isTransactionInitiatedOrFailed = existantTransaction && (existantTransaction.status === "initiated" as TransactionStatus
            || existantTransaction.status === "failed" as TransactionStatus)


        if (existantTransaction && !isTransactionInitiatedOrFailed) {
            //means challenge exists and is already paid
            return Response.json(
                { error: 'Le challenge est déja paié et valide' },
                { status: 429 }
            );
        }


        // 5. Récupérer challenge
        const { data: challenge } = await supabase
            .from('challenges')
            .select('title, association_name')
            .eq('id', challengeId)
            .single();


        // 7. Calculs
        const commission = calculateCommission(amount);
        const netAmount = amount - commission;

        // 8. URL de base moderne
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';


        // 9. Création session Stripe avec API moderne
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes minimum malheureusement
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `Engagement: ${challenge?.title || 'Défi personnel'}`,
                        description: `Bénéficiaire: ${challenge?.association_name || 'Non spécifiée'}`,
                    },
                    unit_amount: amount * 100,
                },
                quantity: 1,
            }],
            success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/payment/cancel?challenge_id=${challengeId}`,
            metadata: {
                challenge_id: challengeId,
                user_id: userId,
                net_amount: netAmount.toString(),
                commission: commission.toString(),
            },
            payment_intent_data: {
                metadata: {
                    challenge_id: challengeId,
                    user_id: userId,
                    transaction_id: challengeId,
                },
            },
            // Sécurité renforcée
            // billing_address_collection: 'required',
            phone_number_collection: { enabled: true },
            customer_creation: 'always',
            invoice_creation: { enabled: true },
        });

        if (!isTransactionInitiatedOrFailed) {
            // means there's no transaction for this challenge at all 
            const transactionData: Partial<Transaction> = {
                challenge_id: challengeId,
                clerk_user_id: userId as string,
                amount: amount,
                commission: commission,
                status: 'initiated',
                payment_type: 'one-time',
                created_at: new Date().toISOString(),
            };

            const { error: transactionError } = await supabase
                .from("transactions")
                .insert([transactionData])
                .select()
                .single();

            if (transactionError) {
                throw new Error(`Impossible de créer la transaction: ${transactionError.message}`);
            }
        }

        return Response.json({
            url: session.url,
            sessionId: session.id
        });

    } catch (err) {
        console.error('Erreur session Stripe:', err);
        return Response.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
