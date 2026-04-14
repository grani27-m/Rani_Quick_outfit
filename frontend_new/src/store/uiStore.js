import { create } from 'zustand';

const useUIStore = create((set) => ({
  loginModalOpen: false,
  registerModalOpen: false,
  loading: false,

  openLoginModal: () => set({ loginModalOpen: true, registerModalOpen: false }),
  openRegisterModal: () => set({ registerModalOpen: true, loginModalOpen: false }),
  closeModals: () => set({ loginModalOpen: false, registerModalOpen: false }),
  setLoading: (loading) => set({ loading }),
}));

export default useUIStore;
