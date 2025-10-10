import { create } from "zustand";

type ThemeType = "dark" | "ligth";

type ThemeState = {
  theme: ThemeType;
  isDark: () => boolean;
  toggleIsDark: () => void;
};

const getInitialTheme = (): ThemeType => {
  const savedTheme = localStorage.getItem("theme") as ThemeType | null;
  if (savedTheme === "dark" || savedTheme === "ligth") {
    return savedTheme;
  }
  return "ligth";
};

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: getInitialTheme(),
  isDark: () => {
    return get().theme === "dark";
  },

  toggleIsDark: () => {
    const newTheme = get().theme === "dark" ? "ligth" : "dark";
    localStorage.setItem("theme", newTheme);
    set({ theme: newTheme });
  },
}));
