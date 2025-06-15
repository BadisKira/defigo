import { ChallengeStatus, StripePaymentStatus } from "./challenge.types";
import { PaymentType, TransactionStatus } from "./transaction.types";

export const challengeStatusFr: Record<ChallengeStatus, string> = {
  draft: "Brouillon",
  active: "En cours",
  validated: "Validé",
  failed: "Échoué",
  expired: "Expiré"
};

export const transactionStatusFr: Record<TransactionStatus, string> = {
  initiated: "Initiée",
  paid: "Payée",
  refunded: "Remboursée",
  donated: "Donnée à l’association",
  failed:"Echouée"
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
