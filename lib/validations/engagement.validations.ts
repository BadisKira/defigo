import { z } from 'zod';

// Schéma de validation pour le formulaire d'engagement
export const ChallengeFormSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères' }),
  description: z.string().min(10, { message: 'La description doit contenir au moins 10 caractères' }),
  amount: z.coerce.number().min(1, { message: 'Le montant doit être supérieur à 0' }),
  duration_days: z.coerce.number().min(1, { message: 'La durée doit être d\'au moins 1 jour' }),
  start_date: z.date({
    required_error: 'La date de début est requise',
    invalid_type_error: 'Format de date invalide',
  }),
});

// Type pour les données du formulaire
export type ChallengeFormValues = z.infer<typeof ChallengeFormSchema>;