import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Users, Calendar, Activity } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useQuery } from "@tanstack/react-query"
import { getAppointments } from "@/clinica/actions/Appointments.action"
import { useEmployes } from "@/clinica/hooks/useEmployes"
import { usePatients } from "@/clinica/hooks/usePatient"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"

export const ManagerDashboard = () => {
    const today = new Date();
    const dateTo = format(today, 'yyyy-MM-dd');
    const dateFrom = format(subDays(today, 6), 'yyyy-MM-dd');

    // Fetch Employees Stats
    const { data: employeesData } = useEmployes();

    // Fetch Patients Stats
    const { data: patientsData } = usePatients();

    // Fetch Weekly Appointments
    const { data: weeklyAppointments } = useQuery({
        queryKey: ["manager-dashboard-appointments", dateFrom, dateTo],
        queryFn: () => getAppointments({
            dateFrom: dateFrom,
            dateTo: dateTo
        }),
        staleTime: 1000 * 60 * 5
    });

    // Process Weekly Data for Chart
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(today, 6 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayName = format(d, 'EEE', { locale: es });

        // Count appointments for this day
        const count = weeklyAppointments?.filter(a => {
            const appDate = new Date(a.startTime);
            const appDateStr = format(appDate, 'yyyy-MM-dd');
            return appDateStr === dateStr;
        }).length || 0;

        return { day: dayName.charAt(0).toUpperCase() + dayName.slice(1), citas: count };
    });

    // Calculate totals
    const totalEmployees = employeesData?.count || 0;
    const totalPatients = patientsData?.count || 0;
    const totalWeeklyAppointments = weeklyAppointments?.length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard - Gerente</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Citas Semanales</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{totalWeeklyAppointments}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Últimos 7 días
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Personal Activo</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">Total registrados</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Pacientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{totalPatients}</div>
                        <p className="text-xs text-muted-foreground">Total registrados</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">Actividad</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">Active</div>
                        <p className="text-xs text-muted-foreground">Sistema operativo</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Weekly Appointments Chart */}
                <Card className="bg-card border-border md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-card-foreground">Resumen de Citas Semanal</CardTitle>
                        <CardDescription>Volumen de citas de los últimos 7 días</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                citas: {
                                    label: "Citas",
                                    color: "hsl(var(--chart-1))",
                                },
                            }}
                            className="h-[300px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="citas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Inventory Alerts - Placeholder */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-card-foreground">Alertas de Inventario</CardTitle>
                        <CardDescription>Medicamentos con stock bajo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                            <p>Módulo de inventario no conectado</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Reports - Placeholder */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-card-foreground">Asistencia</CardTitle>
                        <CardDescription>Reporte diario</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                            <p>Módulo de asistencia no conectado</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
