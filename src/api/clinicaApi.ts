import axios from "axios";

const clinicaApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// TODO: agregar la parte de los interceptores

export { clinicaApi };
