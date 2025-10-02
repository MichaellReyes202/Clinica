import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Users, DollarSign } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const weeklyData = [
  { day: "Lun", ingresos: 2400 },
  { day: "Mar", ingresos: 1800 },
  { day: "Mié", ingresos: 3200 },
  { day: "Jue", ingresos: 2800 },
  { day: "Vie", ingresos: 3500 },
  { day: "Sáb", ingresos: 2100 },
  { day: "Dom", ingresos: 1500 },
]

export const ManagerDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard - Gerente</h2>
        <p className="text-muted-foreground">Vista general administrativa y financiera</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Ingresos Semanales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">$17,300</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              +12% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">8</div>
            <p className="text-xs text-muted-foreground">5 inventario, 3 asistencia</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Personal Activo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">18/20</div>
            <p className="text-xs text-muted-foreground">2 ausencias hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Tasa de Ocupación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">87%</div>
            <p className="text-xs text-muted-foreground">Promedio semanal</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Financial Summary */}
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground">Resumen Financiero Semanal</CardTitle>
            <CardDescription>Ingresos diarios de la última semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ingresos: {
                  label: "Ingresos",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ingresos" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Low Inventory Alerts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Alertas de Inventario Bajo</CardTitle>
            <CardDescription>Medicamentos que requieren reabastecimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { item: "Paracetamol 500mg", current: 15, min: 50, status: "critical" },
                { item: "Ibuprofeno 400mg", current: 28, min: 50, status: "warning" },
                { item: "Amoxicilina 500mg", current: 35, min: 50, status: "warning" },
                { item: "Omeprazol 20mg", current: 8, min: 30, status: "critical" },
                { item: "Losartán 50mg", current: 22, min: 40, status: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{item.item}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stock actual: {item.current} | Mínimo: {item.min}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      item.status === "critical"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {item.status === "critical" ? "Crítico" : "Bajo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Reports */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Reportes de Asistencia</CardTitle>
            <CardDescription>Estado de asistencia del personal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-2xl font-bold text-green-400">18</p>
                  <p className="text-xs text-muted-foreground">Presentes</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-2xl font-bold text-red-400">2</p>
                  <p className="text-xs text-muted-foreground">Ausentes</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-2xl font-bold text-yellow-400">1</p>
                  <p className="text-xs text-muted-foreground">Tardanza</p>
                </div>
              </div>

              {/* Absent Staff */}
              <div>
                <p className="text-sm font-medium text-card-foreground mb-2">Personal Ausente Hoy</p>
                <div className="space-y-2">
                  {[
                    { name: "Dra. Carmen López", role: "Médico General", reason: "Permiso médico" },
                    { name: "Enf. Roberto Martínez", role: "Enfermero", reason: "Permiso personal" },
                  ].map((staff, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/30">
                      <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-red-400">{staff.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.role}</p>
                        <p className="text-xs text-muted-foreground mt-1">{staff.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Attendance Rate */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tasa de Asistencia Semanal</span>
                  <span className="text-sm font-medium text-card-foreground">94%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: "94%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
