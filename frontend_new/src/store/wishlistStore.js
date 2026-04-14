import { create } from 'zustand';

const useWishlistStore = create((set, get) => ({
  ids: new Set(),
  count: 0,

  setIds: (productIds) => {
    const ids = new Set(productIds);
    set({ ids, count: ids.size });
  },

  toggle: (productId) => {
    const ids = new Set(get().ids);
    if (ids.has(productId)) {
      ids.delete(productId);
    } else {
      ids.add(productId);
    }
    set({ ids, count: ids.size });
  },

  has: (productId) => get().ids.has(productId),
  clear: () => set({ ids: new Set(), count: 0 }),
}));

export default useWishlistStore;
