'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsletterSubscriptionSchema } from '@/lib/validations/newsletter';
import { NewsletterSubscription } from '@/lib/validations/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiResponse {
  message?: string;
  error?: string;
  type?: string;
  success?: boolean;
}

export function NewsletterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<NewsletterSubscription>({
    resolver: zodResolver(newsletterSubscriptionSchema)
  });

  const onSubmit = async (data: NewsletterSubscription) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        // Gestion des différents types d'erreurs
        switch (result.type) {
          case 'already_subscribed':
            setError('Vous êtes déjà inscrit à notre newsletter. Vérifiez votre boîte de réception.');
            break;
          case 'contact_creation_failed':
            setError('Impossible de créer votre profil. Veuillez réessayer dans quelques minutes.');
            break;
          case 'email_send_failed':
            setError('Impossible d\'envoyer l\'email de confirmation. Vérifiez votre adresse email et réessayez.');
            break;
          case 'validation_error':
            setError('Données invalides. Vérifiez votre email et réessayez.');
            break;
          case 'server_error':
            setError('Une erreur inattendue s\'est produite. Réessayez plus tard.');
            break;
          default:
            setError(result.error || 'Une erreur est survenue lors de l\'inscription.');
        }
        return;
      }

      // Succès
      setSuccess(true);
      reset(); // Réinitialiser le formulaire
      
      // Masquer le message de succès après 8 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 8000);

    } catch (err) {
      console.error('Network error:', err);
      setError('Erreur de connexion. Vérifiez votre connexion internet et réessayez.');
    } finally {
      setLoading(false);
      reset()
    }
  };

  if (success) {
    return (
      <div className="bg-green-900/50 border border-green-700 p-6 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-green-400 font-medium">Inscription en cours</h3>
        </div>
        <p className="text-green-300 mt-2">
         {" Un email de confirmation vous a été envoyé. Cliquez sur le lien dans l'email pour finaliser votre inscription."}
        </p>
        <p className="text-green-400 text-sm mt-2">
          {"Pensez à vérifier votre dossier spam si vous ne recevez pas l'email."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Votre nom (optionnel)
          </Label>
          <Input
            id="name"
            placeholder="Votre nom"
            className="mt-1"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Votre email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="adresse@email.com"
            className="mt-1"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Input
            id="terms"
            type="checkbox"
            className="w-4 h-4 mt-1"
            {...register('terms')}
          />
          <Label htmlFor="terms" className="text-sm leading-5">
            {"J'accepte de recevoir la newsletter de deKliK et je confirme avoir lu la politique de confidentialité."}
          </Label>
        </div>
        {errors.terms && (
          <p className="text-red-400 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.terms.message}
          </p>
        )}
      </div>
      {error && (
        <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Inscription en cours...
          </div>
        ) : (
          'S\'inscrire à la newsletter'
        )}
      </Button>
    </form>
  );
}