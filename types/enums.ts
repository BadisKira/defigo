import { ChallengeStatus, StripePaymentStatus } from "./challenge.types";
import { PaymentType, TransactionStatus } from "./transaction.types";

export const challengeStatusFr: Record<ChallengeStatus, string> = {
  draft: "Brouillon",
  active: "En cours",
  completed: "Terminé",
  failed: "Échoué",
  expired: "Expiré",
  refunded: "Remboursé",
  donated: "Donné"
};

export const transactionStatusFr: Record<TransactionStatus, string> = {
  pending: "En attente",
  processing: "En cours",
  succeeded: "Réussie",
  failed: "Échouée",
  canceled: "Annulée"
};

export const paymentTypeFr: Record<PaymentType, string> = {
  "one-time": "Paiement unique"
};

export const stripePaymentStatusFr: Record<StripePaymentStatus, string> = {
  pending: "En attente",
  succeeded: "Réussi",
  failed: "Échoué",
  refunded: "Remboursé"
};
