

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Calendar, MapPin, Droplet, AlertCircle, FileText, Edit } from "lucide-react";
import { Link } from "react-router";
import type { PatientListDto } from "@/interfaces/Patient.response";

interface PatientCardProps {
   patient: PatientListDto,
   showActions?: boolean,
   viewMode?: "grid" | "list",
}
export const PatientCard = ({ patient, showActions = true, viewMode = "grid" }: PatientCardProps) => {
   const fullName = `${patient.firstName} ${patient.middleName} ${patient.lastName} ${patient.secondLastName}`.replace(/\s+/g, " ").trim()
   const age = Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / 3.15576e+10);

   if (viewMode === "list") {
      return (
         <Card className="w-full border border-border shadow-sm hover:bg-accent/30 transition-colors">
            <div className="flex items-center justify-between  px-2 py-1 gap-4 flex-wrap">
               <div className="flex items-center gap-3 shrink-0">
                  <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                     <User className="h-5 w-5 text-sidebar-primary" />
                  </div>
                  <span className="font-semibold text-card-foreground whitespace-nowrap">{fullName}</span>
               </div>
               <div className="text-sm text-muted-foreground whitespace-nowrap">
                  <strong>Edad:</strong> {age}
               </div>
               <div className="text-sm text-muted-foreground  whitespace-nowrap">
                  <strong>DNI:</strong> {patient.dni || "N/D"}
               </div>
               <div className="text-sm text-muted-foreground  whitespace-nowrap">
                  <strong>Teléfono:</strong> {patient.contactPhone || "N/D"}
               </div>
               <div className="text-sm text-muted-foreground whitespace-nowrap truncate">
                  <strong>Correo:</strong> {patient.contactEmail || "N/D"}
               </div>
               <div className="flex gap-2 shrink-0">
                  <Link to={`/dashboard/patients/edit/${patient.id}`}>
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
                        <Edit className="h-4 w-4" />
                     </Button>
                  </Link>
                  <Link to={`/dashboard/consultations/create?patientId=${patient.id}`} className="flex-1">
                     <Button variant="outline" size="sm" className="w-full text-card-foreground border-border bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        Nueva Consulta
                     </Button>
                  </Link>
                  <Link to={`/dashboard/patients/${patient.id}/history`} className="flex-1">
                     <Button size="sm" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                        Ver Historial
                     </Button>
                  </Link>
               </div>
            </div>
         </Card>
      )
   }
   return (
      <Card className="bg-card border-border hover:border-sidebar-primary/50 transition-colors">
         <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4 flex-grow">
               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                     <User className="h-6 w-6 text-chart-1" />
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-card-foreground">{fullName}</h3>
                     <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                           {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / 3.15576e+10)} años
                        </Badge>
                        {patient.bloodTypeId && (
                           <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                              <Droplet className="h-3 w-3 mr-1" />
                              {patient.bloodTypeId}
                           </Badge>
                        )}
                     </div>
                  </div>
               </div>
               {showActions && (
                  <Link to={`/dashboard/patients/edit/${patient.id}`}>
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
                        <Edit className="h-4 w-4" />
                     </Button>
                  </Link>
               )}
            </div>

            <div className="space-y-3 flex-grow">
               <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                     <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                     <span className="text-card-foreground">{patient.contactPhone === null ? "No disponible" : patient.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                     <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                     <span className="text-card-foreground truncate">{patient.contactEmail === null ? "No disponible" : patient.contactEmail}</span>
                  </div>
               </div>

               <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-card-foreground">{patient.address === null ? "No disponible" : patient.address}</span>
               </div>
               {/* {patient.address && (
          )} */}

               <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-yellow-400 font-medium">Alergias:</p>
                     <p className="text-card-foreground">{patient.allergies === null ? "Ninguna" : patient.allergies}</p>
                  </div>
               </div>


               {patient.guardian && (
                  <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-secondary/30">
                     <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                     <div>
                        <p className="text-muted-foreground text-xs">Contacto de Emergencia: {patient.guardian.relationship}</p>
                        <p className="text-card-foreground font-medium">{patient.guardian.fullName}</p>
                        {patient.guardian.contactPhone && <p className="text-card-foreground text-xs">{patient.guardian.contactPhone}</p>}
                     </div>
                  </div>
               )}

               {/* {patient.lastVisit && (
            <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Última visita: {patient.lastVisit}</span>
            </div>
          )} */}
               {patient.createdAt && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                     {/* Dar formato a la fecha */}
                     <span className="text-muted-foreground">Última visita: {new Date(patient.createdAt).toLocaleDateString()}</span>
                  </div>
               )}
            </div>

            {showActions && (
               <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                  <Link to={`/dashboard/consultations/create?patientId=${patient.id}`} className="flex-1">
                     <Button variant="outline" size="sm" className="w-full text-card-foreground border-border bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        Nueva Consulta
                     </Button>
                  </Link>
                  <Link to={`/dashboard/patients/${patient.id}/history`} className="flex-1">
                     <Button size="sm" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                        Ver Historial
                     </Button>
                  </Link>
               </div>
            )}
         </CardContent>
      </Card>
   )
}