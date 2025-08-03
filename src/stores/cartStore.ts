import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
}

interface CartState {
  // State
  items: CartItem[];
  isOpen: boolean;

  // Computed values
  totalItems: number;
  totalPrice: number;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (itemId: string) => number;
  getItemTotal: (itemId: string) => number;
  syncLocalStorageCart: () => void;
  clearLocalStorageCart: () => void;
  addItemToLocalStorage: (item: CartItem) => void;
  getLocalStorageCartCount: () => number;
}

// Helper functions for localStorage operations
const getLocalStorageCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem('local-cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading localStorage cart:', error);
    return [];
  }
};

const setLocalStorageCart = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('local-cart', JSON.stringify(items));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('localStorageCartUpdated', { detail: items }));
  } catch (error) {
    console.error('Error writing to localStorage cart:', error);
  }
};

const clearLocalStorageCart = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('local-cart');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('localStorageCartUpdated', { detail: [] }));
  } catch (error) {
    console.error('Error clearing localStorage cart:', error);
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,

      // Computed values
      get totalItems() {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      get totalPrice() {
        const state = get();
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      // Actions
      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === newItem.id
          );

          let updatedItems;
          if (existingItemIndex > -1) {
            // Update existing item quantity
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
            };
          } else {
            // Add new item
            updatedItems = [...state.items, newItem];
          }

          // Dispatch custom event to notify other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedItems }));
          }

          return { items: updatedItems };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== itemId);
          
          // Dispatch custom event to notify other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedItems }));
          }

          return { items: updatedItems };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );

          // Dispatch custom event to notify other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedItems }));
          }

          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        // Also clear localStorage cart when clearing main cart
        clearLocalStorageCart();
        
        // Dispatch custom event to notify other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
        }
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getItemQuantity: (itemId: string) => {
        const item = get().items.find((item) => item.id === itemId);
        return item ? item.quantity : 0;
      },

      getItemTotal: (itemId: string) => {
        const item = get().items.find((item) => item.id === itemId);
        return item ? item.price * item.quantity : 0;
      },

      // New methods for localStorage cart management
      syncLocalStorageCart: () => {
        const localCartItems = getLocalStorageCart();
        if (localCartItems.length > 0) {
          set((state) => {
            // Merge localStorage items with existing cart items
            const mergedItems = [...state.items];
            
            localCartItems.forEach((localItem) => {
              const existingIndex = mergedItems.findIndex(item => item.id === localItem.id);
              if (existingIndex > -1) {
                // Merge quantities if item already exists
                mergedItems[existingIndex].quantity += localItem.quantity;
              } else {
                // Add new item
                mergedItems.push(localItem);
              }
            });
            
            return { items: mergedItems };
          });
          
          // Clear localStorage cart after syncing
          clearLocalStorageCart();
        }
      },

      clearLocalStorageCart: () => {
        clearLocalStorageCart();
      },

      addItemToLocalStorage: (newItem: CartItem) => {
        const currentLocalCart = getLocalStorageCart();
        const existingItemIndex = currentLocalCart.findIndex(
          (item) => item.id === newItem.id
        );

        let updatedLocalCart;
        if (existingItemIndex > -1) {
          // Update existing item quantity
          updatedLocalCart = [...currentLocalCart];
          updatedLocalCart[existingItemIndex] = {
            ...updatedLocalCart[existingItemIndex],
            quantity: updatedLocalCart[existingItemIndex].quantity + newItem.quantity,
          };
        } else {
          // Add new item
          updatedLocalCart = [...currentLocalCart, newItem];
        }

        setLocalStorageCart(updatedLocalCart);
      },

      getLocalStorageCartCount: () => {
        const localCartItems = getLocalStorageCart();
        return localCartItems.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
); 