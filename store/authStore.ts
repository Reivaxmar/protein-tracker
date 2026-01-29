import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged listener
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to login' 
      });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      await createUserWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged listener
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to register' 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to logout' 
      });
      throw error;
    }
  },

  initAuth: () => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    
    // Return unsubscribe function if needed for cleanup
    return unsubscribe;
  },
}));
