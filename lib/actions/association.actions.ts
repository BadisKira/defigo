'use server';

import { Association } from "@/types/types";
import { createSupabaseClient } from "../supabase";


type GetAssociationsParams = {
  limit?: number;
  name?: string;
  category?: string;
};

/**
 * Récupère les associations avec filtrage optionnel par nom et catégorie
 */
export async function getAssociations(params: GetAssociationsParams = {}) {
  const { limit = 50, name, category } = params;

  try {
    const supabase = createSupabaseClient();
    
    let query = supabase
      .from('associations')
      .select('*')
      .order('name', { ascending: true });

    // Filtre par nom (recherche insensible à la casse)
    if (name && name.trim()) {
      query = query.ilike('name', `%${name.trim()}%`);
    }

    // Filtre par catégorie
    if (category && category.trim()) {
      query = query.eq('category', category.trim());
    }

    // Limite le nombre de résultats
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des associations:', error);
      throw new Error('Impossible de récupérer les associations');
    }

    return {
      success: true,
      data: data as Association[],
      count: data?.length || 0
    };

  } catch (error) {
    console.error('Erreur dans getAssociations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      data: [],
      count: 0
    };
  }
}

/**
 * Récupère toutes les catégories distinctes des associations
 */
export async function getCategories() {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('associations')
      .select('category')
      .not('category', 'is', null)
      .not('category', 'eq', '')
      .order('category', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw new Error('Impossible de récupérer les catégories');
    }

    // Extraction des catégories uniques
    const uniqueCategories = Array.from(
      new Set(data?.map(item => item.category).filter(Boolean))
    ).sort();

    return {
      success: true,
      data: uniqueCategories,
      count: uniqueCategories.length
    };

  } catch (error) {
    console.error('Erreur dans getCategories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      data: [],
      count: 0
    };
  }
}