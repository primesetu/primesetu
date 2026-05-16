import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  stockno: string;
  itemdesc: string;
  brand: string;
  retail_price: number;
  image_url: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (stockno: string) => void;
  updateQuantity: (stockno: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.stockno === item.stockno);
        if (existing) {
          return {
            items: state.items.map((i) => 
              i.stockno === item.stockno 
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            isOpen: true
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
      }),
      removeItem: (stockno) => set((state) => ({
        items: state.items.filter((i) => i.stockno !== stockno)
      })),
      updateQuantity: (stockno, quantity) => set((state) => ({
        items: quantity <= 0 
          ? state.items.filter((i) => i.stockno !== stockno)
          : state.items.map((i) => i.stockno === stockno ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getCartTotal: () => get().items.reduce((total, item) => total + (item.retail_price * item.quantity), 0),
      getCartCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: 'smriti-ecommerce-cart',
    }
  )
);
