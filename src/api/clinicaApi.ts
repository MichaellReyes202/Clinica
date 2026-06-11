import { BackendError, type ApiErrorResponse } from "@/interfaces/Error.response";
import { handleHttpError } from "@/utils/StatusHandler";
import axios, { isAxiosError } from "axios";

const clinicaApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    // Esta cabecera le dice a Microsoft que ignore la pantalla de advertencia
    "X-Tunnel-Skip-AntiPhishing-Page": "true"
  }
});

// TODO: agregar la parte de los interceptores

clinicaApi.interceptors.request.use((config) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  config.headers["X-Timezone"] = userTimeZone;
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clinicaApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response) {
      const { data, status } = error.response;

      const backendError = new BackendError(data as ApiErrorResponse, status);

      handleHttpError(backendError);

      return Promise.reject(backendError);
    }
    return Promise.reject(error);
  },
);

// clinicaApi.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (isAxiosError(error)) {
//       if (error.response) {
//         // Error estructurado desde C#
//         const errorData = error.response.data as ApiErrorResponse;
//         return Promise.reject(new BackendError(errorData));
//       } else if (error.request) {
//         // Petición hecha, pero no hubo respuesta (Network Error, CORS, Timeout)
//         return Promise.reject(
//           new BackendError({
//             code: ErrorCodes.ServiceUnavailable,
//             description: "No se pudo conectar con el servidor. Revisa tu conexión a internet.",
//             field: null,
//             metadata: null,
//             validationErrors: null,
//           }),
//         );
//       }
//     }
//     return Promise.reject(error);
//   },
// );

// clinicaApi.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (isAxiosError(error)) {
//       if (error.response) {
//         // Error estructurado desde C# (400, 401, 404, 500, etc.)
//         const errorData = error.response.data as ApiErrorResponse;
//         return Promise.reject(new BackendError(errorData));
//       } else if (error.request) {
//         // Petición hecha, pero no hubo respuesta

//         let customErrorCode = ErrorCodes.ServiceUnavailable;
//         let customMessage = "Error de conexión desconocido.";

//         // Evaluar el tipo de error de red
//         if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
//           // Timeout
//           customErrorCode = ErrorCodes.ServiceUnavailable; // O podrías crear un 'RequestTimeout' en tus ErrorCodes
//           customMessage = "El servidor tardó demasiado en responder. Intenta de nuevo.";
//         } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
//           // Network Error o CORS
//           customErrorCode = ErrorCodes.ServiceUnavailable;
//           customMessage = "No se pudo conectar con el servidor. Verifica tu internet o si el sistema está en mantenimiento.";
//         }

//         return Promise.reject(
//           new BackendError({
//             code: customErrorCode,
//             description: customMessage,
//             field: null,
//             metadata: null,
//             validationErrors: null,
//           }),
//         );
//       }
//     }

//     // Error de configuración de Axios u otra cosa rara
//     return Promise.reject(error);
//   },
// );

export { clinicaApi };
