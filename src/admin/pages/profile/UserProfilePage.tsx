import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/auth/store/auth.store";
import { useEmployeeDetail } from "@/clinica/hooks/useEmployeeDetail";
import { useClinicSchedules } from "@/clinica/hooks/useSchedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Phone, Briefcase, Shield, Calendar, Clock,
  KeyRound, CheckCircle2, Loader2, Building2, Stethoscope,
  Activity, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { clinicaApi } from "@/api/clinicaApi";

// ── Schema contraseña ─────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requerido"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Requerido"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-red-100 text-red-700 border-red-200",
  Doctor: "bg-blue-100 text-blue-700 border-blue-200",
  Recepcionista: "bg-purple-100 text-purple-700 border-purple-200",
  Gerente: "bg-amber-100 text-amber-700 border-amber-200",
};

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ── Info Row ──────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3 py-2">
    <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
    </div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => (
  <div className={`rounded-xl border p-4 flex items-center gap-3 ${color}`}>
    <Icon className="h-5 w-5 shrink-0 opacity-80" />
    <div>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

// ── Página principal ──────────────────────────────────────────────────────────

export const UserProfilePage = () => {
  const { user } = useAuthStore();
  const { employee, isLoading: loadingEmployee } = useEmployeeDetail(
    user?.employeeId ?? null
  );
  const { data: clinicSchedules } = useClinicSchedules();
  const [changingPassword, setChangingPassword] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmitPassword = async (values: PasswordForm) => {
    try {
      setChangingPassword(true);
      await clinicaApi.post("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success("Contraseña actualizada correctamente");
      form.reset();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Error al cambiar la contraseña"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Stats derivadas del horario de la clínica
  const openDays = clinicSchedules?.filter((s) => s.isOpen).length ?? 0;
  const todaySchedule = clinicSchedules?.find(
    (s) => s.dayOfWeek === new Date().getDay()
  );

  const initials = user?.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const roleClass =
    ROLE_COLORS[user?.roles?.[0] ?? ""] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Header hero ──────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sidebar-primary via-blue-600 to-indigo-700 p-8 text-white shadow-xl">
        {/* decorative circles */}
        <div className="absolute top-[-40px] right-[-40px] h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-20px] h-48 w-48 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/30 shadow-lg shrink-0">
            <AvatarImage src={employee?.photoUrl} />
            <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{user?.fullName}</h1>
            <p className="text-blue-200 mt-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {user?.roles.map((r) => (
                <span
                  key={r}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30"
                >
                  {r}
                </span>
              ))}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user?.isActive
                    ? "bg-emerald-400/20 border border-emerald-300/40 text-emerald-100"
                    : "bg-red-400/20 border border-red-300/40 text-red-100"
                }`}
              >
                {user?.isActive ? "✓ Cuenta activa" : "✗ Cuenta inactiva"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Días laborales"
          value={openDays}
          color="bg-blue-50 border-blue-200 text-blue-800"
        />
        <StatCard
          icon={Clock}
          label="Horario hoy"
          value={
            todaySchedule?.isOpen
              ? `${todaySchedule.openTime} – ${todaySchedule.closeTime}`
              : "Cerrado"
          }
          color="bg-indigo-50 border-indigo-200 text-indigo-800"
        />
        <StatCard
          icon={Activity}
          label="Estado cuenta"
          value={user?.isActive ? "Activa" : "Inactiva"}
          color="bg-emerald-50 border-emerald-200 text-emerald-800"
        />
        <StatCard
          icon={Shield}
          label="Rol principal"
          value={user?.roles?.[0] ?? "—"}
          color="bg-violet-50 border-violet-200 text-violet-800"
        />
      </div>

      {/* ── Contenido principal ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna izquierda — Info usuario + empleado */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info usuario */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-sidebar-primary" />
                Información de cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <InfoRow icon={Mail} label="Correo de acceso" value={user?.email} />
              <InfoRow
                icon={Shield}
                label="Roles"
                value={user?.roles?.join(", ")}
              />
              <InfoRow
                icon={Activity}
                label="Estado"
                value={user?.isActive ? "Activo" : "Inactivo"}
              />
              <InfoRow
                icon={Lock}
                label="Cambio de contraseña requerido"
                value={user?.requiresPasswordChange ? "Sí" : "No"}
              />
            </CardContent>
          </Card>

          {/* Info empleado */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-sidebar-primary" />
                Información del empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {loadingEmployee ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : employee ? (
                <>
                  <InfoRow icon={User} label="Nombre completo" value={user?.fullName} />
                  <InfoRow icon={Briefcase} label="Cargo" value={(employee as any).positionName ?? "—"} />
                  <InfoRow icon={Stethoscope} label="Especialidad" value={(employee as any).especialtyName ?? "—"} />
                  <InfoRow icon={Phone} label="Teléfono" value={employee.contactPhone} />
                  <InfoRow icon={Mail} label="Correo personal" value={employee.email} />
                  <InfoRow
                    icon={Building2}
                    label="Fecha de contratación"
                    value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString("es-NI") : "—"}
                  />
                  <InfoRow icon={User} label="Cédula" value={employee.dni} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin información de empleado asociada.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Horario semanal mini */}
          {clinicSchedules && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sidebar-primary" />
                  Horario de la clínica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const s = clinicSchedules.find((cs) => cs.dayOfWeek === d);
                    const isToday = new Date().getDay() === d;
                    return (
                      <div
                        key={d}
                        className={`flex flex-col items-center rounded-lg p-2 text-xs ${
                          isToday
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : s?.isOpen
                            ? "bg-muted text-foreground"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <span className="font-semibold">{DAY_LABELS[d]}</span>
                        <span className="mt-1 text-[10px]">
                          {s?.isOpen ? s.openTime : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha — Cambiar contraseña */}
        <div className="lg:col-span-3">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-sidebar-primary" />
                Cambiar contraseña
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tu contraseña debe tener al menos 8 caracteres. Por seguridad, nunca la compartas con nadie.
              </p>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitPassword)}
                  className="space-y-5"
                >
                  {/* Contraseña actual */}
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5" />
                          Contraseña actual
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Ingresa tu contraseña actual"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-2" />

                  {/* Nueva contraseña */}
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <KeyRound className="h-3.5 w-3.5" />
                          Nueva contraseña
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirmar contraseña */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirmar nueva contraseña
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Repite la nueva contraseña"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Requisitos visuales */}
                  <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos de contraseña:</p>
                    {[
                      { label: "Mínimo 8 caracteres", met: (form.watch("newPassword")?.length ?? 0) >= 8 },
                      { label: "Las contraseñas coinciden", met: form.watch("newPassword") === form.watch("confirmPassword") && form.watch("confirmPassword").length > 0 },
                    ].map(({ label, met }) => (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        <div className={`h-2 w-2 rounded-full ${met ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                        <span className={met ? "text-emerald-600 font-medium" : "text-muted-foreground"}>{label}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4 mr-2" />
                        Actualizar contraseña
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
