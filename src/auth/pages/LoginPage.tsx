


import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label"
import * as z from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "react-router";


import img_back from '../../assets/108329.jpg'

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

interface LoginFormProps {
  onSubmit?: (data: LoginFormValues) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

export const LoginPage: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración del formulario con React Hook Form y Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handler para el envío del formulario
  const handleSubmit = async (data: LoginFormValues) => {
    if (isLoading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Simulación de llamada a API por defecto
        console.log("Login data:", data);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      // Aquí podrías manejar errores específicos y mostrarlos al usuario
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          <form className="p-6 md:p-8" >
            <div className="text-center space-y-6 my-4">
              {/* Logo/Icono de la clínica */}
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
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Olvidate tu contraseña?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required placeholder="Contraseña" />
              </div>
              <Button type="submit" className="w-full bg-blue-500">
                Ingresar
              </Button>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src={img_back}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>

        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Haciendo click, estaras de acuerdo con los
        <a href="#">
          terminos y condiciones
        </a> y <a href="#">politicas de uso</a>.
      </div>
    </div>
  );
};
