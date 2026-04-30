import { clinicaApi } from "@/api/clinicaApi";
import type { ChangePasswordFormData } from "../pages/ForceChangePasswordPage";


export const changePasswordAction = async (data: ChangePasswordFormData): Promise<{ message: string }> => {
  const response = await clinicaApi.post<{ message: string }>("/auth/change-password", {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  });
  return response.data;
};
