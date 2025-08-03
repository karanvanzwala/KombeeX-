import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  isStaff: boolean;
  userPermissions: Array<{
    code: string;
  }>;
}

interface AuthState {
  // State
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
        });
        
        // Sync localStorage cart items after login
        if (typeof window !== 'undefined') {
          // Import the cart store dynamically to avoid circular dependencies
          import('./cartStore').then(({ useCartStore }) => {
            const cartStore = useCartStore.getState();
            cartStore.syncLocalStorageCart();
          });
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          const userData = localStorage.getItem('userData');
          
          if (token && userData) {
            try {
              const user = JSON.parse(userData);
              set({
                token,
                user,
                isAuthenticated: true,
              });
              
              // Sync localStorage cart items on initialization if user is authenticated
              import('./cartStore').then(({ useCartStore }) => {
                const cartStore = useCartStore.getState();
                cartStore.syncLocalStorageCart();
              });
            } catch (error) {
              console.error('Error parsing user data:', error);
              get().logout();
            }
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 