import { useEffect, useState } from 'react';

/**
 * Hook personnalisé pour débouncer une valeur
 * @param value La valeur à débouncer
 * @param delay Le délai en millisecondes
 * @returns La valeur debouncée
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Définir un timer pour mettre à jour la valeur debouncée après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}