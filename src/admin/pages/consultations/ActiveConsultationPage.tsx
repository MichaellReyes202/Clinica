import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation, useBlocker } from "react-router";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";
import { useConfirm } from "@/clinica/hooks/useConfirm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
   Breadcrumb,
   BreadcrumbList,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { User, Calendar, Clock, AlertCircle, FileText, Pill, FlaskConical, Save, ArrowLeft } from "lucide-react";

// Importamos tus componentes de lógica (Asumo que los convertirás a componentes puros)
// Si no los has refactorizado, puedes copiar su contenido aquí o importarlos tal cual
import { ConsultationNotesPage } from "./ConsultationNotesPage"; // Debería renombrarse a ConsultationNotesTab
import PrescriptionPage from "./PrescriptionPage"; // Debería renombrarse a PrescriptionTab
import { PrescribeExamsPage } from "./PrescribeExamsPage"; // Debería renombrarse a ExamsTab
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveConsultationData, useUpdateAppointmentStatus } from "@/clinica/hooks/useAppointments";


// ruta de acceso del componente  :   path: 'consultations/process/:appointmentId',

export const ActiveConsultationPage = () => {
   const { appointmentId } = useParams();
   const navigate = useNavigate();
   const location = useLocation();
   const { confirm } = useConfirm();

   const [activeTab, setActiveTab] = useState("notes");

   const { data, isLoading } = useActiveConsultationData(appointmentId);
   const { mutation: updateStatusMutation } = useUpdateAppointmentStatus();

   const previousPath = location.state?.from?.pathname;

   // Usar useRef para rastrear si ya se ejecutó la validación
   const hasValidated = useRef(false);

   // Bandera para permitir navegación intencional (cuando el usuario confirma finalizar/cancelar)
   const isIntentionalNavigation = useRef(false);

   // Validar fecha usando useMemo para evitar recalcular en cada render
   const isAppointmentToday = useMemo(() => {
      if (!data) return false;
      const appointmentDate = new Date(data.startTime);
      const today = new Date();
      return (
         appointmentDate.getDate() === today.getDate() &&
         appointmentDate.getMonth() === today.getMonth() &&
         appointmentDate.getFullYear() === today.getFullYear()
      );
   }, [data]);

   // Ejecutar validación solo una vez cuando los datos estén disponibles
   useEffect(() => {
      if (!data || isLoading || hasValidated.current) return;

      // Marcar como validado para evitar ejecuciones múltiples
      hasValidated.current = true;

      // 1. Validar que el estado sea "Confirmada" (statusId = 2) o "En curso" (statusId = 3)
      if (data.statusId !== 2 && data.statusId !== 3) {
         console.warn(`Consulta con estado inválido: ${data.statusId}. Se requiere estado "Confirmada" (2) o "En curso" (3)`);
         navigate("/dashboard/appointments/today", { replace: true });
         return;
      }

      // 2. Validar que la fecha de la cita sea para hoy
      if (!isAppointmentToday) {
         console.warn("La cita no es para hoy. Redirigiendo...");
         navigate("/dashboard/appointments/today", { replace: true });
         return;
      }

      // 3. Actualizar el estado a "En curso" (statusId = 3) solo si está en "Confirmada"
      if (data.statusId === 2) {
         updateStatusMutation.mutate(
            { AppointmenId: data.appointmentId, StatusId: 3 },
            {
               onError: (error) => {
                  console.error("Error al actualizar el estado de la consulta:", error);
               }
            }
         );
      }
   }, [data, isLoading, isAppointmentToday, navigate, updateStatusMutation]);

   // Protección contra salida accidental de la consulta
   // 1. Advertencia al cerrar/recargar la ventana del navegador
   useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
         e.preventDefault();
         // Chrome requiere returnValue
         e.returnValue = '';
      };

      // Agregar el listener solo cuando hay una consulta activa
      if (data && !isLoading) {
         window.addEventListener('beforeunload', handleBeforeUnload);
      }

      // Limpiar el listener al desmontar
      return () => {
         window.removeEventListener('beforeunload', handleBeforeUnload);
      };
   }, [data, isLoading]);

   // 2. Bloquear navegación a otras rutas dentro de la aplicación
   const blocker = useBlocker(
      ({ currentLocation, nextLocation }) =>
         // Bloquear solo si hay datos cargados, se intenta navegar a otra ruta
         // Y la navegación NO es intencional (confirmada por el usuario)
         !!data &&
         currentLocation.pathname !== nextLocation.pathname &&
         !isIntentionalNavigation.current
   );

   // Manejar la confirmación del blocker
   useEffect(() => {
      if (blocker.state === "blocked") {
         (async () => {
            const shouldLeave = await confirm({
               title: "Consulta en Proceso",
               description: (
                  <div>
                     <p>Tienes una consulta activa en proceso.</p>
                     <p className="mt-2">Si sales ahora, se perderá el progreso no guardado.</p>
                     <p className="mt-2 font-semibold">¿Estás seguro de que deseas salir?</p>
                  </div>
               ),
               confirmText: "Salir de todas formas",
               cancelText: "Permanecer aquí",
               variant: "warning"
            });

            if (shouldLeave) {
               // Si confirma, permitir la navegación
               blocker.proceed();
            } else {
               // Si cancela, quedarse en la página
               blocker.reset();
            }
         })();
      }
   }, [blocker, confirm]);

   if (isLoading) return <CustomFullScreenLoading />;
   if (!data) return <div>Error al cargar la consulta</div>;

   const handleFinalize = async () => {
      // Lógica para finalizar la consulta (PUT /consultations/{id}/finalize)
      const confirmed = await confirm({
         title: "Finalizar Consulta",
         description: "¿Está seguro de finalizar la consulta? Esto cerrará el historial médico de esta sesión.",
         confirmText: "Sí, finalizar",
         cancelText: "Cancelar",
         variant: "default"
      });

      if (confirmed) {
         // Marcar como navegación intencional para que el blocker no la detenga
         isIntentionalNavigation.current = true;
         alert("Consulta Finalizada");
         navigate("/dashboard/appointments/today");
      }
   };

   const handleRollback = async () => {
      // Lógica para cancelar la consulta y regresar al estado "Confirmada"
      const confirmed = await confirm({
         title: "Cancelar Consulta",
         description: (
            <div>
               <p>¿Está seguro de cancelar la consulta?</p>
               <p className="mt-2">El estado de la cita regresará a <strong>'Confirmada'</strong> y podrá retomarla después.</p>
            </div>
         ),
         confirmText: "Sí, cancelar",
         cancelText: "No, continuar",
         variant: "warning"
      });

      if (confirmed) {
         // Marcar como navegación intencional para que el blocker no la detenga
         isIntentionalNavigation.current = true;

         // Actualizar el estado de vuelta a "Confirmada" (statusId = 2)
         updateStatusMutation.mutate({ AppointmenId: data.appointmentId, StatusId: 2 },
            {
               onSuccess: () => {
                  navigate("/dashboard/appointments/today");
               },
               onError: (error) => {
                  console.error("Error al revertir el estado de la consulta:", error);
                  alert("Error al cancelar la consulta. Por favor, intente nuevamente.");
               }
            }
         );
      }
   };

   return (
      <div className="space-y-6 h-full flex flex-col">
         <Breadcrumb>
            <BreadcrumbList>
               <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                     <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
               </BreadcrumbItem>
               <BreadcrumbSeparator />
               <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                     <Link to="/dashboard/appointments/today">Citas de Hoy</Link>
                  </BreadcrumbLink>
               </BreadcrumbItem>
               <BreadcrumbSeparator />
               <BreadcrumbItem>
                  <BreadcrumbPage>Consulta Activa</BreadcrumbPage>
               </BreadcrumbItem>
            </BreadcrumbList>
         </Breadcrumb>

         {/* 1. CABECERA DE SEGURIDAD DEL PACIENTE (Siempre visible) */}
         <Card className="border-l-4 border-l-sidebar-primary shadow-sm bg-card">
            <CardContent className="p-4">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-full bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
                        <User className="h-6 w-6 text-sidebar-primary" />
                     </div>
                     <div>
                        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                           {data.patient.fullName}
                           <Badge variant="outline" className="ml-2 text-xs font-normal">
                              {data.patient.age} años
                           </Badge>
                        </h1>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                           <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Hoy</span>
                           <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> En curso</span>
                        </div>
                     </div>
                  </div>

                  {/* Alertas Médicas Críticas */}
                  <div className="flex  gap-1 bg-red-500/10 p-2 rounded-md border border-red-500/20 max-w-md">
                     <div className="flex items-center gap-2 text-sm font-semibold">
                        <AlertCircle className="h-4 w-4" /> Alertas Clínicas:
                     </div>
                     <p className="text-xs">
                        <strong>Alergias:</strong> {data.patient.allergies}
                     </p>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* 2. ÁREA DE TRABAJO (Tabs) */}
         <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
               <div className="flex justify-between items-center">
                  <TabsList className="h-12 p-1 bg-muted/50 border border-border">
                     <TabsTrigger value="notes" className="h-full px-4 gap-2">
                        <FileText className="h-4 w-4" /> Notas (SOAP)
                     </TabsTrigger>
                     <TabsTrigger value="prescription" className="h-full px-4 gap-2">
                        <Pill className="h-4 w-4" /> Receta
                     </TabsTrigger>
                     <TabsTrigger value="exams" className="h-full px-4 gap-2">
                        <FlaskConical className="h-4 w-4" /> Exámenes
                     </TabsTrigger>
                     <TabsTrigger value="history" className="h-full px-4 gap-2">
                        <Clock className="h-4 w-4" /> Historial Previo
                     </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2">
                     {/* Calcelar la consulta (Regresar a la vista anterior y regresar al estado inicial de la cita) */}
                     <Button onClick={handleRollback} className="bg-red-600 hover:bg-red-700 text-white">
                        <ArrowLeft className="h-4 w-4 mr-2" /> {previousPath == "/dashboard/appointments/today" ? "Regresar / Cancelar" : "Cancelar"}
                     </Button>
                     <Button onClick={handleFinalize} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="h-4 w-4 mr-2" /> Finalizar Consulta
                     </Button>

                  </div>
               </div>

               {/* CONTENIDO DE LOS TABS */}
               {/* Aquí renderizamos tus componentes adaptados. 
                        Nota: En una app real, pasarías props como 'patientId' o 'consultationId' a estos componentes 
                        para que sepan qué guardar. */}

               <TabsContent value="notes" className="mt-0">
                  {/* Renderizamos tu componente existente */}
                  {/* Idealmente, modifica ConsultationNotesPage para que acepte props y quite su propio Header */}
                  <ConsultationNotesPage />
               </TabsContent>

               <TabsContent value="prescription" className="mt-0">
                  <PrescriptionPage />
               </TabsContent>

               <TabsContent value="exams" className="mt-0">
                  <PrescribeExamsPage />
               </TabsContent>

               <TabsContent value="history" className="mt-0">
                  <Card>
                     <CardContent className="pt-6 text-center text-muted-foreground">
                        Aquí se mostraría un resumen rápido de las últimas 3 consultas.
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>

         {/* Diálogo de confirmación personalizado */}
         <ConfirmDialog />
      </div>
   );
};
