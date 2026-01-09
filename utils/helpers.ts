let idCounter = 0;

export const generateUniqueId = () => {
  return `${Date.now()}-${++idCounter}`;
};

export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

import { Language } from '../translations';

export const formatDate = (dateString: string, language: Language = 'en') => {
  const date = new Date(dateString);
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatProtein = (protein: number) => {
  // Format to 2 decimals, then remove trailing zeros
  return `${parseFloat(protein.toFixed(2))}g`;
};

// Format a number to up to 2 decimals, removing trailing zeros
export const formatNumber = (num: number, decimals: number = 2) => {
  return parseFloat(num.toFixed(decimals));
};
