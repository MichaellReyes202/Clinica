import { clinicaApi } from "@/api/clinicaApi";
import type { AuthResponse } from "../interfaces/auth.response";
import type { UserCreation } from "@/interfaces/Users.response";

export const loginAction = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data } = await clinicaApi.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const registerAction = async (email: string, password: string, fullName: string) => {
  try {
    const { data } = await clinicaApi.post<AuthResponse>("/auth/register", {
      email,
      password,
      fullName,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const checkAuthAction = async (): Promise<AuthResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const { data } = await clinicaApi.get<AuthResponse>("/auth/check-status");
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    localStorage.removeItem("token");
    throw new Error("Token expired or not valid");
  }
};

export const resetPasswordAction = async (id: number): Promise<UserCreation> => {
  try {
    const { data } = await clinicaApi.post<UserCreation>(`/auth/reset-password/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
