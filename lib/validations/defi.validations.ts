import { z } from 'zod';

// Schema de validation pour le formulaire de création de défi
export const ChallengeFormSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }).max(100, { message: "Le titre ne peut pas dépasser 100 caractères" }),
  description: z.string().optional(),
  amount: z.coerce.number()
    .min(10, { message: "Le montant doit être d'au moins 10€" })
    .max(500, { message: "Le montant ne peut pas dépasser 500€" }),
  duration_days: z.coerce.number()
    .min(1, { message: "La durée doit être d'au moins 1 jour" })
    .max(90, { message: "La durée maximale est de 90 jours" }),
  start_date: z.date({
    required_error: "La date de début est requise"
  }).transform(() => new Date()), // Toujours aujourd'hui
  association_id: z.string()
    .min(1, { message: "Veuillez sélectionner une association" })
    .uuid({ message: "ID d'association invalide" }),
  allow_ai_usage: z.boolean().optional().default(false),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les termes et conditions",
  }),
});

// Type inféré du schema Zod
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

