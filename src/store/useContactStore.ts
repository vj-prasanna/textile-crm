import { create } from "zustand";
import { Contact } from "@/types/contact";

interface ContactState {
  contacts: Contact[];
  loading: boolean;
  setContacts: (contacts: Contact[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  loading: true,
  setContacts: (contacts) => set({ contacts, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
