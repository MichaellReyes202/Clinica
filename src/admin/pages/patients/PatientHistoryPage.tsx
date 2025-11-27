

import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   ArrowLeft, Calendar, Stethoscope, FileText, ChevronRight,
   Pill, FlaskConical
} from "lucide-react";
import { CustomFullScreenLoading } from "@/admin/components/CustomFullScreenLoading";

// Mock Data - Reemplazar con usePatientHistoryQuery
const mockHistory = [
   {
      id: 101,
      date: "2025-09-15",
      doctor: "Dr. Juan Pérez",
      specialty: "Medicina General",
      reason: "Dolor abdominal agudo",
      diagnosis: "Gastritis erosiva",
      hasPrescription: true,
      hasExams: false
   },
   {
      id: 98,
      date: "2025-08-10",
      doctor: "Dra. Ana Silva",
      specialty: "Cardiología",
      reason: "Control de presión arterial",
      diagnosis: "Hipertensión controlada",
      hasPrescription: true,
      hasExams: true
   }
];

export const PatientHistoryPage = () => {
   const { patientId } = useParams();
   const navigate = useNavigate();

   // const { data: history, isLoading } = usePatientHistory(patientId);
   const isLoading = false;

   if (isLoading) return <CustomFullScreenLoading />;

   return (
      <div className="space-y-6 max-w-5xl mx-auto">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
               <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
               <h2 className="text-2xl font-bold text-foreground">Historial Clínico</h2>
               <p className="text-muted-foreground">Paciente ID: {patientId}</p>
            </div>
         </div>

         <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-10">
            {mockHistory.map((visit) => (
               <div key={visit.id} className="relative pl-8">
                  {/* Dot on timeline */}
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-sidebar-primary border-4 border-background" />

                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-border" onClick={() => alert(`Ver detalles consulta ${visit.id}`)}>
                     <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                 <Calendar className="h-3 w-3" />
                                 {new Date(visit.date).toLocaleDateString()}
                              </div>
                              <CardTitle className="text-lg text-sidebar-primary">
                                 {visit.reason}
                              </CardTitle>
                           </div>
                           <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                           </Button>
                        </div>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-3">
                           <div className="flex items-start gap-2">
                              <Stethoscope className="h-4 w-4 text-muted-foreground mt-1" />
                              <div>
                                 <p className="text-sm font-medium">{visit.doctor}</p>
                                 <p className="text-xs text-muted-foreground">{visit.specialty}</p>
                              </div>
                           </div>

                           <div className="bg-secondary/20 p-3 rounded-md">
                              <p className="text-sm font-medium text-foreground">Diagnóstico:</p>
                              <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
                           </div>

                           <div className="flex gap-2">
                              {visit.hasPrescription && (
                                 <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">
                                    <Pill className="h-3 w-3" /> Receta
                                 </Badge>
                              )}
                              {visit.hasExams && (
                                 <Badge variant="secondary" className="gap-1 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200">
                                    <FlaskConical className="h-3 w-3" /> Exámenes
                                 </Badge>
                              )}
                              <Badge variant="outline" className="gap-1">
                                 <FileText className="h-3 w-3" /> Notas
                              </Badge>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            ))}
         </div>
      </div>
   );
};