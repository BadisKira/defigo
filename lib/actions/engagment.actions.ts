'use server';

import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '../supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Challenge } from '@/types/types';
import { ChallengeFormSchema, ChallengeFormValues } from '../validations/engagement.validations';

// Action pour créer un nouveau défi
export async function createChallenge(formData: ChallengeFormValues) {
  try {
    // Récupérer l'utilisateur authentifié
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('Vous devez être connecté pour créer un défi');
    }

    // Calculer la date de fin en fonction de la date de début et de la durée
    const startDate = new Date(formData.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + formData.duration_days);

    // Créer le client Supabase
    const supabase = createSupabaseClient();

    // Préparer les données du défi
    const challengeData: Partial<Challenge> = {
      user_id: userId,
      title: formData.title,
      description: formData.description,
      amount: formData.amount,
      duration_days: formData.duration_days,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'pending',
      association_name: '', // Valeur par défaut, sera mise à jour plus tard
      created_at: new Date().toISOString(),
    };

    // Insérer le défi dans la base de données
    const { data, error } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création du défi: ${error.message}`);
    }

    // Revalider le chemin pour mettre à jour les données
    revalidatePath('/engagement');
    
    // Rediriger vers une page de confirmation ou le tableau de bord
    redirect('/dashboard'); // Ajustez selon votre structure de routes

  } catch (error) {
    console.error('Erreur lors de la création du défi:', error);
    throw error;
  }
}