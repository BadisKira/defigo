import { z } from 'zod';

export const newsletterSubscriptionSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
  name: z.string().optional(),
  terms: z.boolean().refine((value) => value === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  })
});

export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;
