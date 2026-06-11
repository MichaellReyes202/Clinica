

































import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { Lock, Mail, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

import img_back from '../../assets/108329.jpg';
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthMutation } from "@/clinica/hooks/useAuthMutations";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useState } from "react";
import { forgotPasswordAction } from "../actions/login.action";

// --- Importaciones de tsParticles ---
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { BackgroundParticles } from "@/clinica/components/BackgroundParticles";
import { BlockedTimer } from "@/clinica/components/BlockedTimer";

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
  const [initParticles, setInitParticles] = useState(false);
  const isBlocked = useAuthStore((state) => state.isBlocked);

  // Estados de Forgot Password
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInitParticles(true));
  }, []);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useAuthMutation(
    (data) => {
      if (data.user?.requiresPasswordChange) {
        navigate("/auth/change-password", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
    setError,
    (val) => toast(val, { duration: 6000 })
  );

  const handleLogin = (data: LoginFormValues) => {
    if (!isBlocked) mutate(data);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return toast.error("Ingresa tu correo");
    try {
      setIsSendingForgot(true);
      const res = await forgotPasswordAction(forgotEmail);
      toast.success(res.message || "Revisa tu correo personal");
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error("Error al enviar el correo");
    } finally {
      setIsSendingForgot(false);
    }
  };



  return (

    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden p-4">

      <BackgroundParticles init={initParticles} />

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

              {!isForgotPassword ? (
                <>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo</Label>
                      <Input id="email" type="email" placeholder="usuario@oficentro.com" {...register("email")} />
                      {errors.email && (<p className="text-sm font-medium text-red-500 mt-1">{errors.email.message}</p>)}
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Contraseña</Label>
                        <button type="button" onClick={() => setIsForgotPassword(true)} className="ml-auto inline-block cursor-pointer text-sm underline text-blue-500 hover:text-blue-700">
                          ¿Olvidó su contraseña?
                        </button>
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
                      <BlockedTimer />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Ingresa tu correo de la clínica. Te enviaremos un código de recuperación a tu <strong>correo personal</strong> registrado.
                  </p>
                  <div className="grid gap-2">
                    <Label htmlFor="forgot-email">Correo de Clínica</Label>
                    <Input id="forgot-email" type="email" placeholder="usuario@oficentro.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                  </div>
                  <Button type="button" onClick={handleForgotPassword} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors" disabled={isSendingForgot}>
                    {isSendingForgot ? 'Enviando...' : 'Enviar Código'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setIsForgotPassword(false)} className="w-full">
                    Volver a iniciar sesión
                  </Button>
                </div>
              )}
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
