

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Calendar, MapPin, Droplet, AlertCircle, FileText, Edit } from "lucide-react";
import { Link } from "react-router";

interface PatientCardProps {
  patient: {
    id: string
    fullName: string
    age: string
    phone: string
    email: string
    address?: string
    bloodType?: string
    allergies?: string
    emergencyContact?: string
    emergencyPhone?: string
    lastVisit?: string
  }
  showActions?: boolean
}


export const PatientCard = ({ patient, showActions = true }: PatientCardProps) => {
  return (
    <Card className="bg-card border-border hover:border-sidebar-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">{patient.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                  {patient.age} años
                </Badge>
                {patient.bloodType && (
                  <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                    <Droplet className="h-3 w-3 mr-1" />
                    {patient.bloodType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {showActions && (
            <Link to={`/dashboard/patients/update?id=${patient.id}`}>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-card-foreground">{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-card-foreground truncate">{patient.email}</span>
            </div>
          </div>

          {patient.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-card-foreground">{patient.address}</span>
            </div>
          )}

          {patient.allergies && (
            <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Alergias:</p>
                <p className="text-card-foreground">{patient.allergies}</p>
              </div>
            </div>
          )}

          {patient.emergencyContact && (
            <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-secondary/30">
              <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Contacto de Emergencia:</p>
                <p className="text-card-foreground font-medium">{patient.emergencyContact}</p>
                {patient.emergencyPhone && <p className="text-card-foreground text-xs">{patient.emergencyPhone}</p>}
              </div>
            </div>
          )}

          {patient.lastVisit && (
            <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Última visita: {patient.lastVisit}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <Link to={`/dashboard/consultations/create?patientId=${patient.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-card-foreground border-border bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Nueva Consulta
              </Button>
            </Link>
            <Link to={`/dashboard/patients/${patient.id}/history`} className="flex-1">
              <Button
                size="sm"
                className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              >
                Ver Historial
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}