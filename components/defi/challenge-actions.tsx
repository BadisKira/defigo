"use client";

import { useState } from "react";
import { Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FeedbackModal } from "@/components/ui/feedback-modal";
import { markChallengeAsSuccessful, markChallengeAsFailed, saveChallengeReview } from "@/lib/actions/defi.actions";
import { MarkChallengeAsFailedParams, MarkChallengeAsSuccessfulParams, ChallengeWithTransactionAndAssocAndFeedback } from "@/types/challenge.types";

interface ChallengeActionsProps {
  challenge: ChallengeWithTransactionAndAssocAndFeedback;
  challengeId: string;
}

export function ChallengeActions({ challenge, challengeId }: ChallengeActionsProps) {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les formulaires
  const [donateAnyway, setDonateAnyway] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<'success' | 'failed' | null>(null);

  const handleSuccessClick = () => {
    setError(null);
    setIsSuccessModalOpen(true);
  };

  const handleFailedClick = () => {
    setError(null);
    setIsFailedModalOpen(true);
  };

  const handleSuccessConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const params: MarkChallengeAsSuccessfulParams = {
        challengeId,
        donateToAssociation: donateAnyway
      };

      await markChallengeAsSuccessful(params);
      
      // Fermer le modal de confirmation et ouvrir le modal de feedback
      setIsSuccessModalOpen(false);
      setPendingActionType('success');
      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFailedConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const params: MarkChallengeAsFailedParams = {
        challengeId
      };

      await markChallengeAsFailed(params);
      
      // Fermer le modal de confirmation et ouvrir le modal de feedback
      setIsFailedModalOpen(false);
      setPendingActionType('failed');
      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.error("Erreur lors de la confirmation d'échec:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccessModal = () => {
    setDonateAnyway(false);
    setError(null);
  };

  const resetFailedModal = () => {
    setError(null);
  };

  const handleFeedbackSubmit = async (rating: number, comment?: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await saveChallengeReview(challengeId, rating, comment);
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      // Rediriger selon le type d'action
      const successParam = pendingActionType === 'success' ? 'success=true' : 'failed=true';
      window.location.href = `/defi/${challengeId}?${successParam}`;
    } catch (error) {
      console.error("Erreur lors de l'envoi du feedback:", error);
      setError(error instanceof Error ? error.message : "Erreur lors de l'envoi du feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSkip = () => {
    // Rediriger sans feedback
    const successParam = pendingActionType === 'success' ? 'success=true' : 'failed=true';
    window.location.href = `/defi/${challengeId}?${successParam}`;
  };

  // Contenu des modals
  const renderSuccessModalContent = () => (
    <div className="space-y-3">
      {donateAnyway ? (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200">
          <p>✅ <strong>Vous avez choisi de faire une donation</strong></p>
          <p>Votre mise de <strong>{challenge.amount}€</strong> sera entièrement donnée à l'association <strong>{challenge.associations.name}</strong>.</p>
          <p className="text-sm text-green-700">Merci pour votre générosité ! 🙏</p>
        </div>
      ) : (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200">
          <p>💰 <strong>Vous serez remboursé</strong></p>
          <p>Vous recevrez <strong>{(challenge.amount * 0.96).toFixed(2)}€</strong> (96% de votre mise).</p>
          <p>L'association <strong>{challenge.associations.name}</strong> recevra <strong>{(challenge.amount * 0.04).toFixed(2)}€</strong> (4%).</p>
        </div>
      )}
    </div>
  );

  const renderFailedModalContent = () => (
    <div className="space-y-3">
      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200">
        <p>💔 <strong>Pas de remboursement</strong></p>
        <p>Votre mise de <strong>{challenge.amount}€</strong> sera entièrement donnée à l'association <strong>{challenge.associations.name}</strong>.</p>
        <p className="text-sm text-red-700">Votre contribution aidera une bonne cause !</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Cette action est définitive et ne peut pas être annulée.
      </p>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <span className="bg-primary/10 p-1.5 rounded-md mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </span>
            Avez-vous réussi votre challenge ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Réussite */}
            <Card className="border-green-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-green-50/50 dark:bg-green-950/10 border-b border-green-100 dark:border-green-900/20">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-green-500" />
                  {"J'ai réussi mon challenge !"}
                </CardTitle>
                <CardDescription>
                  {"Félicitations ! Vous pouvez récupérer 96% de votre mise ou choisir de la donner à l'association."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div className="flex items-center space-x-2 p-3 bg-green-50/50 dark:bg-green-950/10 rounded-md">
                    <Switch 
                      id="donateAnyway" 
                      checked={donateAnyway}
                      onCheckedChange={setDonateAnyway}
                    />
                    <Label htmlFor="donateAnyway" className="font-medium">
                      {"Donner quand même à l'association"}
                    </Label>
                  </div>

                  <Button 
                    onClick={handleSuccessClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    {" Valider ma réussite"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card Échec */}
            <Card className="border-red-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-red-50/50 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20">
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  {" Je n'ai pas réussi mon challenge"}
                </CardTitle>
                <CardDescription>
                  {"Pas de souci, votre mise sera reversée à l'association que vous avez choisie."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <Button 
                    onClick={handleFailedClick}
                    variant="outline" 
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {"Confirmer l'échec"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de confirmation - Réussite */}
      <ConfirmationDialog
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        title="Confirmer la réussite du challenge"
        description="Êtes-vous sûr d'avoir réussi votre challenge ?"
        content={renderSuccessModalContent()}
        confirmLabel="Confirmer ma réussite"
        onConfirm={handleSuccessConfirm}
        onCancel={resetSuccessModal}
        isLoading={isSubmitting}
        error={error}
        confirmClassName="bg-green-600 hover:bg-green-700"
        icon={<Trophy className="h-4 w-4" />}
      />

      {/* Modal de confirmation - Échec */}
      <ConfirmationDialog
        open={isFailedModalOpen}
        onOpenChange={setIsFailedModalOpen}
        title="Confirmer l'échec du challenge"
        description="Confirmez-vous que vous n'avez pas réussi votre challenge ?"
        content={renderFailedModalContent()}
        confirmLabel="Confirmer l'échec"
        onConfirm={handleFailedConfirm}
        onCancel={resetFailedModal}
        isLoading={isSubmitting}
        error={error}
        confirmVariant="destructive"
        icon={<XCircle className="h-4 w-4" />}
      />

      {/* Modal de feedback */}
      <FeedbackModal
        open={isFeedbackModalOpen}
        onOpenChange={setIsFeedbackModalOpen}
        onSubmit={handleFeedbackSubmit}
        onSkip={handleFeedbackSkip}
        isLoading={isSubmitting}
        error={error}
      />
    </>
  );
}