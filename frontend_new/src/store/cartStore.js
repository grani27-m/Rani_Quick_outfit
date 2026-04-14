import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),

  addItem: (item) => {
    const items = get().items;
    const existing = items.findIndex(
      (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
    );
    if (existing >= 0) {
      const updated = [...items];
      updated[existing].quantity += item.quantity || 1;
      set({ items: updated });
    } else {
      set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
    }
  },

  removeItem: (index) => {
    set({ items: get().items.filter((_, i) => i !== index) });
  },

  updateQty: (index, quantity) => {
    const items = [...get().items];
    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index].quantity = quantity;
    }
    set({ items });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.productId?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  },

  getCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

export default useCartStore;
