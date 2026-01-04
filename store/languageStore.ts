import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, getTranslation, Translations } from '../translations';

const LANGUAGE_STORAGE_KEY = '@protein_tracker_language';

interface LanguageState {
  language: Language;
  translations: Translations;
  setLanguage: (language: Language) => void;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  translations: getTranslation('en'),
  
  setLanguage: async (language: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      set({
        language,
        translations: getTranslation(language),
      });
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
  
  loadLanguage: async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage === 'en' || savedLanguage === 'es') {
        set({
          language: savedLanguage,
          translations: getTranslation(savedLanguage),
        });
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  },
}));
