import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router";
import { KeyRound, Mail, ArrowRight, Loader2, Eye, EyeOff, Hash } from "lucide-react";
import { resetPasswordWithCodeAction } from "../actions/login.action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BackgroundParticles } from "@/clinica/components/BackgroundParticles";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const formSchema = z.object({
  code: z.string().min(6, "El código debe tener al menos 6 caracteres"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof formSchema>;

export const ResetPasswordPage = () => {
  const [initParticles, setInitParticles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      toast.error("Enlace inválido. Falta el correo electrónico.");
      navigate("/auth/login", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInitParticles(true));
  }, []);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    if (!email) return;
    try {
      setIsLoading(true);
      await resetPasswordWithCodeAction(email, values.code, values.newPassword, values.confirmPassword);
      toast.success("¡Contraseña restablecida exitosamente! Por favor inicia sesión.");
      navigate("/auth/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al restablecer la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden">
      {/* Background decorations */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" /> */}

      <BackgroundParticles init={initParticles} />

      <Card className="w-full max-w-md shadow-2xl border-slate-200/60 backdrop-blur-sm z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-base text-slate-500">
            Ingresa el código que enviamos a tu correo personal para {email}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Código de Recuperación</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Ingresa el código de 6 dígitos"
                          className="pl-10"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="Min. 8 caracteres, 1 mayúscula, 1 número"
                          className="pl-10 pr-10"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="Repite tu nueva contraseña"
                          className="pl-10 pr-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-base font-semibold tracking-wide transition-all duration-300 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Restablecer Contraseña
                    <ArrowRight className="ml-2 h-5 w-5" />
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
