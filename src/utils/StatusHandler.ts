import { useAuthStore } from "@/auth/store/auth.store";
import type { BackendError } from "@/interfaces/Error.response";

type StatusHandler = (error: BackendError) => void;

const statusHandlers: Record<number, StatusHandler> = {
  401: (error) => {},

  403: () => {
    console.warn("No tienes permisos");
  },

  404: () => {
    console.warn("Recurso no encontrado");
  },

  429: () => {
    useAuthStore.getState().setIsBlocked(true);
  },

  500: () => {
    console.error("Error interno del servidor");
  },
};

export const handleHttpError = (error: BackendError) => {
  const handler = statusHandlers[error.status];

  if (handler) {
    handler(error);
  }
};
