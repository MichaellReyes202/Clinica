import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, FileText, Download, Activity, FlaskConical, UserX, Stethoscope } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { clinicaApi } from "@/api/clinicaApi"

export const ReportsPage = () => {
    const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
        to: new Date()
    })

    const [loading, setLoading] = useState<string | null>(null)

    const handleDownload = async (reportType: string, formatType: 'pdf' | 'excel') => {
        if (!date?.from || !date?.to) {
            toast.error("Por favor seleccione un rango de fechas")
            return
        }

        const reportId = `${reportType}-${formatType}`
        setLoading(reportId)

        try {
            const response = await clinicaApi.get(`/reports/${reportType}`, {
                params: {
                    from: format(date.from, 'yyyy-MM-dd'),
                    to: format(date.to, 'yyyy-MM-dd'),
                    format: formatType
                },
                responseType: 'blob'
            })

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = formatType === 'excel' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `${reportType}_${format(new Date(), 'yyyyMMdd')}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up

            toast.success(`Reporte descargado correctamente`)
        } catch (error) {
            console.error("Error downloading report:", error)
            toast.error("Error al descargar el reporte")
        } finally {
            setLoading(null)
        }
    }

    const reports = [
        {
            id: "medical-productivity",
            title: "Productividad Médica",
            description: "Análisis de citas atendidas, canceladas y duración promedio por doctor.",
            icon: Stethoscope,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            id: "morbidity",
            title: "Morbilidad / Diagnósticos",
            description: "Top 10 diagnósticos más frecuentes clasificados por edad y sexo.",
            icon: Activity,
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            id: "lab-volume",
            title: "Volumen de Laboratorio",
            description: "Total de exámenes solicitados agrupados por tipo y estado.",
            icon: FlaskConical,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            id: "patient-absenteeism",
            title: "Ausentismo de Pacientes",
            description: "Listado detallado de citas canceladas o pacientes que no asistieron (No-Show).",
            icon: UserX,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        }
    ]

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Centro de Reportes</h1>
                    <p className="text-muted-foreground">Generación de reportes operativos y clínicos</p>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                            {format(date.to, "LLL dd, y", { locale: es })}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y", { locale: es })
                                    )
                                ) : (
                                    <span>Seleccionar fechas</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(range) => setDate(range as { from: Date; to: Date })}
                                numberOfMonths={2}
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {reports.map((report) => (
                    <Card key={report.id} className="bg-card border-border hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start gap-4 pb-2">
                            <div className={cn("p-3 rounded-lg", report.bg)}>
                                <report.icon className={cn("h-6 w-6", report.color)} />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-semibold text-card-foreground">
                                    {report.title}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    {report.description}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3 mt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => handleDownload(report.id, 'pdf')}
                                    disabled={!!loading}
                                >
                                    {loading === `${report.id}-pdf` ? (
                                        <span className="animate-spin">⏳</span>
                                    ) : (
                                        <FileText className="h-4 w-4 text-red-500" />
                                    )}
                                    Descargar PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => handleDownload(report.id, 'excel')}
                                    disabled={!!loading}
                                >
                                    {loading === `${report.id}-excel` ? (
                                        <span className="animate-spin">⏳</span>
                                    ) : (
                                        <Download className="h-4 w-4 text-green-600" />
                                    )}
                                    Descargar Excel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
