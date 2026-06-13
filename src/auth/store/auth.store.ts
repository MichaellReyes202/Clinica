import type { User } from "@/interfaces/Users.response";
import { create } from "zustand";
import { checkAuthAction } from "../actions/login.action";

type AuthStatus = "authenticated" | "not-authenticated" | "checking";

type AuthState = {
  // Properties
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;
  isBlocked: boolean;
  lockoutEnd: Date | null;
  requiresPasswordChange: boolean;

  // Getters
  isAdmin: () => boolean;
  isDoctor: () => boolean;
  hasRole: (allowedRoles: number[]) => boolean;
  hasPermission: (permission?: string) => boolean;

  // Actions
  setCredentials: (user: User, token: string) => void;
  logout: () => void;
  setIsBlocked: (value: boolean) => void;

  setBlocked: (lockoutEnd: Date) => void;
  clearBlocked: () => void;
  setRequiresPasswordChange: (value: boolean) => void;

  checkAuthStatus: () => Promise<boolean>;

  // Helpers
  getTimeLeft: () => number;

  //register: (email: string, password: string, fullName: string) => Promise<boolean>;
};

// implementacion del store
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  authStatus: "checking",
  isBlocked: false,
  lockoutEnd: null,
  requiresPasswordChange: true,

  // getters
  isAdmin: () => {
    return get().user?.roleId === 1;
  },
  isDoctor: () => {
    return get().user?.roleId === 3;
  },
  hasRole: (allowedRoles: number[]) => {
    const roleId = get().user?.roleId;
    if (!roleId) return false;
    return allowedRoles.includes(roleId);
  },
  hasPermission: (permission?: string) => {
    if (!permission) return false;
    const permissions = get().user?.permissions ?? get().user?.views ?? [];
    return permissions.includes(permission);
  },

  // action
  setCredentials: (user, token) => {
    localStorage.setItem("token", token);
    const normalizedUser = {
      ...user,
      permissions: user.permissions ?? user.views ?? [],
    };
    set({ user: normalizedUser, token, authStatus: "authenticated", isBlocked: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, authStatus: "not-authenticated" });
  },

  setIsBlocked: (value) => {
    set({ isBlocked: value });
  },

  setBlocked: (lockoutEnd) => {
    set({
      isBlocked: true,
      lockoutEnd,
    });
  },

  clearBlocked: () => {
    set({
      isBlocked: false,
      lockoutEnd: null,
    });
  },

  setRequiresPasswordChange: (value: boolean) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, requiresPasswordChange: value } });
    }
  },

  getTimeLeft: () => {
    const { lockoutEnd } = get();
    if (!lockoutEnd) return 0;

    const diff = Math.floor((lockoutEnd.getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  },

  checkAuthStatus: async () => {
    try {
      const { user, token } = await checkAuthAction();
      const normalizedUser = {
        ...user,
        permissions: user.permissions ?? user.views ?? [],
      };
      set({
        user: normalizedUser,
        token,
        authStatus: "authenticated",
      });
      return true;
    } catch (error) {
      set({
        user: null,
        token: null,
        authStatus: "not-authenticated",
      });
      return false;
    }
  },
}));
