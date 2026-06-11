import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import { KeyRound, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { changePasswordAction } from "../actions/changePassword.action";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type ChangePasswordFormData = z.infer<typeof formSchema>;

export const ForceChangePasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);


  const navigate = useNavigate();
  const setRequiresPasswordChange = useAuthStore(state => state.setRequiresPasswordChange);
  const user = useAuthStore(state => state.user);
  const authStatus = useAuthStore(state => state.authStatus);

  useEffect(() => {
    if (authStatus === "not-authenticated") {
      navigate("/auth/login", { replace: true });
    } else if (authStatus === "authenticated" && !user?.requiresPasswordChange) {
      navigate("/dashboard", { replace: true });
    }
  }, [authStatus, user, navigate]);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (authStatus !== "authenticated" || !user?.requiresPasswordChange) {
    return null; // Return null to prevent flicker while redirecting
  }

  const onSubmit = async (values: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      await changePasswordAction(values);
      setRequiresPasswordChange(false);
      toast.success("¡Contraseña actualizada exitosamente!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Change password error details:", error);
      const validationErrors = error.validationErrors || error.response?.data?.validationErrors;
      const description = error.message || error.response?.data?.description;

      if (validationErrors && validationErrors.length > 0) {
        validationErrors.forEach((valError: any) => {
          toast.error(valError.errorMessage);
        });
      } else if (description) {
        toast.error(description);
      } else {
        toast.error("Error al actualizar la contraseña");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-slate-200/60 backdrop-blur-sm z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Actualizar Contraseña
          </CardTitle>
          <CardDescription className="text-base text-slate-500">
            Por razones de seguridad, debes actualizar tu contraseña temporal antes de continuar.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Contraseña Actual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input type="password" placeholder="••••••••" className="pl-10 pr-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input type="password" placeholder="Min. 8 caracteres, 1 mayúscula, 1 número" className="pl-10 pr-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input type="password" placeholder="Repite tu nueva contraseña" className="pl-10 pr-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold tracking-wide transition-all duration-300 hover:shadow-md mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    Actualizar y Continuar
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
