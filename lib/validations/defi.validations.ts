import { z } from 'zod';

export const ChallengeFormSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().min(1, { message: "La description est requise" }),
  amount: z.coerce.number().min(10, { message: "Le montant doit être d'au moins 10" }).max(500, { message: "Le montant ne peut pas dépasser 500" }),
  duration_days: z.coerce.number()
    .min(1, { message: "La durée doit être d'au moins 1 jour" })
    .max(90, { message: "La durée maximale est de 90 jours" })
    .refine((value) => {
      // Vérifier que la durée est valide (1, 2, 4, 7, 14, 30, 60, 90 ou un nombre entre 1 et 90)
      const validDurations = [1, 2, 4, 7, 14, 30, 60, 90];
      return validDurations.includes(value) || (value >= 1 && value <= 90);
    }, {
      message: "La durée doit être de 1, 2, 4, 7, 14, 30, 60, 90 jours ou un nombre entre 1 et 90"
    }),
  start_date: z.date({
    required_error: "La date de début est requise"
  }).transform(() => new Date()),
  association_id: z.string().min(1, { message: "Veuillez sélectionner une association" }),
  allow_ai_usage: z.boolean().optional(),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les termes et conditions",
  }),
});

export type ChallengeFormValues = z.infer<typeof ChallengeFormSchema>;


export const markChallengeSchema = z.object({
  challengeId: z.string().uuid('Format UUID invalide'),
  accomplishmentNote: z.string().max(500, 'Note trop longue (max 500 caractères)').optional(),
  rating: z.number().int().min(1).max(5, 'La note doit être entre 1 et 5').optional(),
  donateToAssociation: z.boolean().default(false)
});


export const markChallengeFailedSchema = z.object({
  challengeId: z.string().uuid('Format UUID invalide'),
  failureNote: z.string()
    .max(500, 'Note d\'échec trop longue (max 500 caractères)')
    .optional()
    .transform(val => val?.trim() || undefined),
  rating: z.number().int().min(1).max(5, 'La note doit être entre 1 et 5').optional(),
  donateToAssociation: z.boolean().default(false)
});

