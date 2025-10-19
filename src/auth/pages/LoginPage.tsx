


import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label"
import * as z from "zod";
import { Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";



import img_back from '../../assets/108329.jpg'
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Por favor ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handler para el envío del formulario
  const handleLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    const isValid = await login(data.email, data.password);
    if (isValid) {
      navigate("/dashboard")
      return;
    }
    toast.error("Incorrect email or password");
    setIsSubmitting(false);
  };


  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          {/* 1. VINCULAR el submit del formulario con el handler de RHF */}
          <form className="p-6 md:p-8" onSubmit={handleSubmit(handleLogin)}>
            <div className="text-center space-y-6 my-4">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Oficentro Masaya
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Iniciar Sesión en el Sistema de Gestión
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" placeholder="usuario@oficentro.com" {...register("email")} />
                {errors.email && (
                  <p className="text-sm font-medium text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input id="password" type="password" placeholder="Password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm font-medium text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-blue-500" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img src={img_back} alt="Image" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
