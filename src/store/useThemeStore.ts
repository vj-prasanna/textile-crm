import { create } from "zustand";

type ThemeMode = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "dark",
  toggleMode: () => set((s) => ({ mode: s.mode === "dark" ? "light" : "dark" })),
}));
