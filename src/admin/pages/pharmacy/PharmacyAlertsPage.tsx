"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface InventoryAlert {
  id: string
  type: "low-stock" | "expired" | "expiring-soon"
  medicine: string
  message: string
  severity: "high" | "medium" | "low"
  date: string
}

export const PharmacyAlertsPage = () => {
  const alerts: InventoryAlert[] = [
    {
      id: "1",
      type: "low-stock",
      medicine: "Amoxicilina 500mg",
      message: "Stock bajo: 30 unidades (mínimo: 40)",
      severity: "high",
      date: "2025-01-10",
    },
    {
      id: "2",
      type: "expiring-soon",
      medicine: "Paracetamol 500mg",
      message: "Vence en 30 días",
      severity: "medium",
      date: "2025-01-10",
    },
    {
      id: "3",
      type: "low-stock",
      medicine: "Insulina",
      message: "Stock crítico: 5 unidades (mínimo: 20)",
      severity: "high",
      date: "2025-01-09",
    },
    {
      id: "4",
      type: "expiring-soon",
      medicine: "Vitamina C",
      message: "Vence en 15 días",
      severity: "high",
      date: "2025-01-08",
    },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low-stock":
        return <Package className="h-5 w-5" />
      case "expired":
        return <AlertTriangle className="h-5 w-5" />
      case "expiring-soon":
        return <Calendar className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Alertas de Inventario</h2>
          <p className="text-muted-foreground">Notificaciones de stock bajo y medicamentos próximos a vencer</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {alerts.filter((a) => a.severity === "high").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas Medias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {alerts.filter((a) => a.severity === "medium").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Activas</CardTitle>
          <CardDescription>Requieren atención inmediata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === "high" ? "destructive" : "default"}>
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 space-y-1">
                  <AlertTitle className="flex items-center gap-2">
                    {alert.medicine}
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity === "high" ? "Crítico" : alert.severity === "medium" ? "Medio" : "Bajo"}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                  <p className="text-xs text-muted-foreground mt-2">{alert.date}</p>
                </div>
                <Button size="sm">Resolver</Button>
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
