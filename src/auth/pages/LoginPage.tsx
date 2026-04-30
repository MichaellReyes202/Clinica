

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

import img_back from '../../assets/108329.jpg';
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthMutation } from "@/clinica/hooks/useAuthMutations";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useState, useMemo } from "react";

// --- Importaciones de tsParticles ---
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

// Esquema de validación con Zod
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Por favor ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();

  // Estado para inicializar el motor de partículas
  const [initParticles, setInitParticles] = useState(false);

  const isBlocked = useAuthStore((state) => state.isBlocked);
  const getTimeLeft = useAuthStore((state) => state.getTimeLeft);
  const clearBlocked = useAuthStore((state) => state.clearBlocked);

  const [_, forceUpdate] = useState(0);

  // Inicializar tsParticles solo una vez
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInitParticles(true);
    });
  }, []);

  useEffect(() => {
    if (!isBlocked) return;

    const interval = setInterval(() => {
      const remaining = getTimeLeft();

      if (remaining <= 0) {
        clearBlocked();
        clearInterval(interval);
      } else {
        forceUpdate((x) => x + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, getTimeLeft, clearBlocked]);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const { mutate, isPending } = useAuthMutation(
    () => {
      navigate("/dashboard", { replace: true })
    }, setError,
    (value: string): void => {
      toast(value, { duration: 6000 })
    }
  );

  const handleLogin = async (data: LoginFormValues) => {
    if (isBlocked) {
      return;
    }
    mutate(data);
  };

  // Configuración interactiva de las partículas (Tema Médico / Azul)
  const particlesOptions: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent", // Transparente para que tome el color de tu app
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: { enable: true, mode: "push" },
          onHover: { enable: true, mode: "repel" },
        },
        modes: {
          push: { quantity: 4 },
          repel: { distance: 150, duration: 0.6 },
        },
      },
      particles: {
        color: { value: "#3b82f6" }, // Azul (tailwind blue-500)
        links: {
          color: "#93c5fd", // Azul claro (tailwind blue-300)
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: { default: "bounce" },
          random: false,
          speed: 1.5,
          straight: false,
        },
        number: {
          density: { enable: true, width: 800, height: 800 },
          value: 80,
        },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    /* Contenedor principal a pantalla completa para el fondo */
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden p-4">

      {/* Capa de Partículas (Fondo) */}
      {initParticles && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          className="absolute inset-0 z-0" // Posicionado detrás
        />
      )}

      {/* Capa de la Tarjeta (Frente) */}
      <div className="relative z-10 flex flex-col gap-6 animate-fade-in-up w-full max-w-4xl shadow-accent">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">

            <form className="p-6 md:p-8 bg-card" onSubmit={handleSubmit(handleLogin)}>
              <div className="text-center space-y-6 my-4">
                <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Oficentro Masaya
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Iniciar Sesión en el Sistema de Gestión Médica
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" type="email" placeholder="usuario@oficentro.com" {...register("email")} />
                  {errors.email && (<p className="text-sm font-medium text-red-500 mt-1">{errors.email.message}</p>)}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                  </div>
                  <Input id="password" type="password" placeholder="Password" {...register("password")} />
                  {errors.password && (<p className="text-sm font-medium text-red-500 mt-1">{errors.password.message}</p>)}
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 transition-colors" disabled={isPending || isBlocked}>
                  {isPending ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </div>
              <div>
                {isBlocked && (
                  <p className="text-red-500 text-center mt-4 font-medium">
                    Cuenta bloqueada. Intenta en {formatTime(getTimeLeft())} minutos.
                  </p>
                )}
              </div>
            </form>
            <div className="relative hidden bg-muted md:block">
              <img src={img_back} alt="Image" className="absolute inset-0 h-full w-full object-cover" />
              {/* Opcional: Un overlay sutil sobre la imagen para que no desentone con las partículas */}
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};





















// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Label } from "@/components/ui/label"
// import * as z from "zod";
// import { Stethoscope } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";



// import img_back from '../../assets/108329.jpg'
// import { useNavigate } from "react-router";
// import { toast } from "sonner";
// import { useAuthMutation } from "@/clinica/hooks/useAuthMutations";
// import { useAuthStore } from "../store/auth.store";
// import { useEffect, useState } from "react";


// // Esquema de validación con Zod
// export const loginSchema = z.object({
//   email: z
//     .string()
//     .min(1, "El correo electrónico es requerido")
//     .email("Por favor ingresa un correo electrónico válido"),
//   password: z
//     .string()
//     .min(1, "La contraseña es requerida")
//     .min(6, "La contraseña debe tener al menos 6 caracteres"),
// });

// export type LoginFormValues = z.infer<typeof loginSchema>;

// export const LoginPage = () => {


//   const navigate = useNavigate();

//   // 1. Extrae clearBlocked del store
//   const isBlocked = useAuthStore((state) => state.isBlocked);
//   const getTimeLeft = useAuthStore((state) => state.getTimeLeft);
//   const clearBlocked = useAuthStore((state) => state.clearBlocked);

//   const [_, forceUpdate] = useState(0);

//   // 2. Controla el desbloqueo dentro del efecto
//   useEffect(() => {
//     // Solo iniciamos el intervalo si el usuario está bloqueado
//     if (!isBlocked) return;

//     const interval = setInterval(() => {
//       const remaining = getTimeLeft();

//       if (remaining <= 0) {
//         clearBlocked();
//         clearInterval(interval); // Limpiamos el intervalo de inmediato al terminar
//       } else {
//         forceUpdate((x) => x + 1);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isBlocked, getTimeLeft, clearBlocked]); // Se reinicia solo si el estado de bloqueo cambia


//   const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const formatTime = (totalSeconds: number) => {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;

//     // padStart(2, '0') asegura que se vea "05" en lugar de "5"
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   const { mutate, isPending } = useAuthMutation(
//     () => navigate("/dashboard", { replace: true }), setError,
//     (value: string): void => {
//       toast(value, { duration: 6000 })
//     }
//   )
//   const handleLogin = async (data: LoginFormValues) => {
//     if (isBlocked) {
//       return;
//     }
//     mutate(data);
//   };

//   return (
//     <div className="flex flex-col gap-6 animate-fade-in-up">
//       <Card className="overflow-hidden p-0">
//         <CardContent className="grid p-0 md:grid-cols-2">

//           <form className="p-6 md:p-8" onSubmit={handleSubmit(handleLogin)}>
//             <div className="text-center space-y-6 my-4">
//               <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
//                 <Stethoscope className="w-8 h-8 text-white" />
//               </div>
//               <div className="space-y-2">
//                 <CardTitle className="text-2xl font-bold text-foreground">
//                   Oficentro Masaya
//                 </CardTitle>
//                 <CardDescription className="text-muted-foreground">
//                   Iniciar Sesión en el Sistema de Gestión Medica
//                 </CardDescription>
//               </div>
//             </div>

//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Correo</Label>
//                 <Input id="email" type="email" placeholder="usuario@oficentro.com" {...register("email")} />
//                 {errors.email && (<p className="text-sm font-medium text-red-500 mt-1">{errors.email.message}</p>)}
//               </div>
//               <div className="grid gap-2">
//                 <div className="flex items-center">
//                   <Label htmlFor="password">Contraseña</Label>
//                 </div>
//                 <Input id="password" type="password" placeholder="Password" {...register("password")} />
//                 {errors.password && (<p className="text-sm font-medium text-red-500 mt-1">{errors.password.message}</p>)}
//               </div>
//               <Button type="submit" className="w-full bg-blue-500" disabled={isPending || isBlocked}>
//                 {isPending ? 'Ingresando...' : 'Ingresar'}
//               </Button>
//             </div>
//             <div>
//               {isBlocked && (
//                 <p className="text-red-500 text-center">
//                   Cuenta bloqueada. Intenta en {formatTime(getTimeLeft())} minutos.
//                 </p>
//               )}
//             </div>
//           </form>
//           <div className="relative hidden bg-muted md:block">
//             <img src={img_back} alt="Image" className="absolute inset-0 h-full w-full object-cover" />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
