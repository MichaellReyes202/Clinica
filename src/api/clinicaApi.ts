import axios from "axios";

const clinicaApi = axios.create({
   baseURL: import.meta.env.VITE_API_URL,
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

export { clinicaApi };
