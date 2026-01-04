import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@protein_tracker_tags';

export interface TagStoreState {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  loadTags: () => Promise<void>;
  saveTags: () => Promise<void>;
}

const DEFAULT_TAGS = ['breakfast', 'lunch', 'dinner'];

export const useTagStore = create<TagStoreState>((set, get) => ({
  tags: DEFAULT_TAGS,

  addTag: (tag) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    set((state) => {
      // Avoid duplicates (case-insensitive)
      if (state.tags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
        return state;
      }
      return { tags: [...state.tags, trimmedTag] };
    });
    
    get().saveTags();
  },

  removeTag: (tag) => {
    set((state) => ({
      tags: state.tags.filter((t) => t !== tag),
    }));
    
    get().saveTags();
  },

  loadTags: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const loadedTags = JSON.parse(jsonValue);
        // Ensure default tags are always present
        const allTags = [...new Set([...DEFAULT_TAGS, ...loadedTags])];
        set({ tags: allTags });
      }
    } catch (e) {
      console.error('Error loading tags:', e);
    }
  },

  saveTags: async () => {
    try {
      const state = get();
      const jsonValue = JSON.stringify(state.tags);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving tags:', e);
    }
  },
}));
