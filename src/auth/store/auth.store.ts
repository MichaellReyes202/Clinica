import type { User } from "@/interfaces/User.interface";
import { create } from "zustand";
import { checkAuthAction, loginAction, registerAction } from "../actions/login.action";

type AuthStatus = "authenticated" | "not-authenticated" | "checking";

type AuthState = {
  // Properties
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;

  // Getters
  isAdmin: () => boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;

  register: (email: string, password: string, fullName: string) => Promise<boolean>;
};

// implementacion del store
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  authStatus: "checking",

  // getters
  isAdmin: () => {
    const roles = get().user?.roles || [];
    return roles.includes("Admin");
  },
  // action
  login: async (email: string, password: string) => {
    try {
      const data = await loginAction(email.trim(), password.trim());
      console.log(data);
      localStorage.setItem("token", data.token);
      console.log(data);
      set({
        user: data.user,
        token: data.token,
        authStatus: "authenticated",
      });
      return true;
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, token: null, authStatus: "not-authenticated" });
      return false;
    }
  },
  register: async (email: string, password: string, fullName: string) => {
    try {
      const data = await registerAction(email, password, fullName);
      localStorage.setItem("token", data.token);
      set({
        user: data.user,
        token: data.token,
        authStatus: "authenticated",
      });
      return true;
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, token: null, authStatus: "not-authenticated" });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      authStatus: "not-authenticated",
    });
  },
  checkAuthStatus: async () => {
    try {
      const { user, token } = await checkAuthAction();
      set({
        user,
        token,
        authStatus: "authenticated",
      });
      return true;
    } catch (error) {
      set({
        user: undefined,
        token: undefined,
        authStatus: "not-authenticated",
      });
      return false;
    }
  },
}));
