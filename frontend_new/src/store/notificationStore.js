import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) => set(state => ({
    notifications: [{ ...n, id: Date.now(), read: false, timestamp: new Date() }, ...state.notifications].slice(0, 50),
    unreadCount: state.unreadCount + 1
  })),

  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),

  clearAll: () => set({ notifications: [], unreadCount: 0 })
}))
