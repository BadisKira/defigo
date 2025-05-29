import { z } from 'zod';

// Schéma de validation pour le formulaire d'engagement
export const ChallengeFormSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().min(1, { message: "La description est requise" }),
  amount: z.coerce.number().min(10, { message: "Le montant doit être d'au moins 10" }).max(500, { message: "Le montant ne peut pas dépasser 500" }),
  duration_days: z.coerce.number().min(1, { message: "La durée doit être d'au moins 1 jour" }),
  start_date: z.date({ required_error: "La date de début est requise" }),
  association_id: z.string().min(1, { message: "Veuillez sélectionner une association" }),
  allow_ai_usage: z.boolean().optional(),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les termes et conditions",
  }),
});

// Type pour les données du formulaire
export type ChallengeFormValues = z.infer<typeof ChallengeFormSchema>;