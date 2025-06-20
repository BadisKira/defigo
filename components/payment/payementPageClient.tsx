"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, ArrowLeft, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChallengeWithTransactionAndAssoc } from "@/types/challenge.types";



export function PaymentPageClient({ challenge }: {
    challenge: ChallengeWithTransactionAndAssoc
}) {
    const [error,] = useState<string | null>(null);
    const router = useRouter();

    const commission = challenge.amount * 0.04;
    const netAmount = challenge.amount - commission;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">

                {/* Header */}
                <div className="flex items-center mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mr-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Finalisation de votre defi
                        </h1>
                        <p className="text-gray-600">
                            Une dernière étape pour activer votre defi
                        </p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Détails du defi */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-3">{challenge.title}</h2>
                    <p className="text-gray-700 mb-4">{challenge.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="text-sm font-medium text-gray-500">Durée :</span>
                            <p className="text-gray-900">{challenge.duration_days} jour(s)</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Date de début :</span>
                            <p className="text-gray-900">
                                {format(new Date(challenge.start_date), "PPP", { locale: fr })}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Date de fin :</span>
                            <p className="text-gray-900">
                                {format(new Date(challenge.start_date), "PPP", { locale: fr })}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Association :</span>
                            <p className="text-gray-900">{challenge.associations.name}</p>
                        </div>
                    </div>

                    {/* Détails financiers */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span>Montant de votre defi :</span>
                            <span className="font-semibold">{challenge.amount}€</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                            <span>Commission plateforme (4%) :</span>
                            <span>{commission.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                            <span>Montant à payer maintenant :</span>
                            <span className="text-blue-600">{challenge.amount}€</span>
                        </div>
                    </div>
                </div>

                {/* Explication */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Comment ça fonctionne ?
                    </h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Vous payez maintenant pour engager votre motivation</li>
                        <li>• Si vous réussissez votre defi, vous récupérez {netAmount.toFixed(2)}€ (96%)</li>
                        <li>• Si vous échouez, la somme est versée à {challenge.associations.name}</li>
                        <li>• Paiement 100% sécurisé par Stripe</li>
                    </ul>
                </div>

                {/* Button de paiement */}
                <ButtonHandlePaiement challenge={challenge} />

                {/* Footer sécurité */}
                <div className="text-center mt-6">
                    <div className="flex items-center justify-center text-sm text-gray-500">
                        <Shield className="h-4 w-4 mr-1" />
                        Paiement sécurisé par Stripe • Vos données sont protégées
                    </div>
                </div>
            </div>
        </div>
    );
}

export const ButtonHandlePaiement = ({ challenge }: { challenge: ChallengeWithTransactionAndAssoc }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [, setError] = useState<string | null>(null);
    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            setError(null);

            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify(
                    {
                        challengeId: challenge.id,
                        amount: challenge.amount,
                    }
                )
            });

            const result = await response.json();


            if (result.url && result.sessionId) {
                window.location.href = result.url;
            } else {
                throw new Error(result.error || "Erreur lors de la création de la session de paiement");
            }


        } catch (err) {
            console.error("Erreur paiement:", err);
            setError(err instanceof Error ? err.message : "Erreur lors du paiement");
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <Button
            onClick={handlePayment}
            disabled={isProcessing}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
        >
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirection vers le paiement...
                </>
            ) : (
                <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payer {challenge.amount}€ et Activer mon defi
                </>
            )}
        </Button>
    )
}