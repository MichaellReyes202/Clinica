import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CalendarDays, UserRound, Loader2, Pencil, CheckCircle2, XCircle } from "lucide-react";
import {
  useClinicSchedules,
  useUpdateClinicSchedule,
  useEmployeeSchedules,
  useUpsertEmployeeSchedule,
  useUpdateEmployeeDuration,
} from "@/clinica/hooks/useSchedule";
import { useAllEmployees } from "@/clinica/hooks/useEmployes";
import type { ClinicScheduleDto, EmployeeScheduleDto } from "@/clinica/actions/schedule.action";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// ── Sub-componente: Editar día de la clínica ──────────────────────────────────

interface EditClinicDayModalProps {
  schedule: ClinicScheduleDto;
  onClose: () => void;
}

const EditClinicDayModal = ({ schedule, onClose }: EditClinicDayModalProps) => {
  const [isOpen, setIsOpen] = useState(schedule.isOpen);
  const [openTime, setOpenTime] = useState(schedule.openTime);
  const [closeTime, setCloseTime] = useState(schedule.closeTime);
  const mutation = useUpdateClinicSchedule();

  const handleSave = () => {
    mutation.mutate(
      { id: schedule.id, payload: { isOpen, openTime, closeTime } },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Editar — {schedule.dayName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <Label>¿Día abierto?</Label>
            <Switch checked={isOpen} onCheckedChange={setIsOpen} />
          </div>
          
          <div className="grid grid-cols-2 gap-4" >
            <div>
              <Label>Hora apertura</Label>
              <Input type="time" value={openTime} className={` ${isOpen ? '' : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-70' } `} onChange={(e) => setOpenTime(e.target.value)} disabled={!isOpen} />
            </div>
            <div>
              <Label>Hora cierre</Label>
              <Input type="time" value={closeTime} className={` ${isOpen ? '' : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-70' } `} onChange={(e) => setCloseTime(e.target.value)} disabled={!isOpen} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={mutation.isPending}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Sub-componente: Editar día de un doctor ───────────────────────────────────

interface EditEmployeeDayModalProps {
  employeeId: number;
  existingSchedule?: EmployeeScheduleDto;
  dayOfWeek: number;
  onClose: () => void;
}

const EditEmployeeDayModal = ({ employeeId, existingSchedule, dayOfWeek, onClose }: EditEmployeeDayModalProps) => {
  const [isAvailable, setIsAvailable] = useState(existingSchedule?.isAvailable ?? true);
  const [startTime, setStartTime] = useState(existingSchedule?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(existingSchedule?.endTime ?? "17:00");
  const mutation = useUpsertEmployeeSchedule(employeeId);

  const handleSave = () => {
    mutation.mutate(
      { dayOfWeek, isAvailable, startTime, endTime },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Horario — {DAY_NAMES[dayOfWeek]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <Label>¿Disponible?</Label>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Inicio de turno</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={!isAvailable} />
            </div>
            <div>
              <Label>Fin de turno</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={!isAvailable} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={mutation.isPending}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Sección: Horario de la clínica ────────────────────────────────────────────

const ClinicScheduleSection = () => {
  const { data: schedules, isLoading } = useClinicSchedules();
  const [editing, setEditing] = useState<ClinicScheduleDto | null>(null);

  if (isLoading) return <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <CardTitle>Horario General de la Clínica</CardTitle>
        </div>
        <CardDescription>Define los días y horas en que la clínica atiende pacientes.</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Día</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.dayName}</TableCell>
                <TableCell>
                  {s.isOpen ? (<Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Abierto</Badge>) 
                  : (<Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Cerrado</Badge>)}
                </TableCell>
                <TableCell>{s.isOpen ? s.openTime : "—"}</TableCell>
                <TableCell>{s.isOpen ? s.closeTime : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </CardContent>
      {editing && <EditClinicDayModal schedule={editing} onClose={() => setEditing(null)} />}
    </Card>
  );
};

// ── Sección: Horario por doctor ───────────────────────────────────────────────

const EmployeeScheduleSection = () => {
  const { data: employees = [], isLoading } = useAllEmployees();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<{ dayOfWeek: number; existing?: EmployeeScheduleDto } | null>(null);
  const [duration, setDuration] = useState("30");

  const { data: employeeSchedules } = useEmployeeSchedules(selectedId);
  const durationMutation = useUpdateEmployeeDuration(selectedId ?? 0);


  const getScheduleForDay = (day: number) => employeeSchedules?.find((s) => s.dayOfWeek === day);

  const handleEmployeeChange = (val: string) => {
    const id = parseInt(val);
    setSelectedId(id);
    const emp = employees.find((e) => e.id === id);
    setDuration("30"); // reset — se podría cargar del empleado si se expone en el DTO
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-primary" />
          <CardTitle>Horario por Empleado / Doctor</CardTitle>
        </div>
        <CardDescription>Configura la disponibilidad semanal y la duración estándar de cita de cada doctor.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (<div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>) : 
        (
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-1 block">Seleccionar Empleado</Label>
              <Select onValueChange={handleEmployeeChange}>
                <SelectTrigger><SelectValue placeholder="Seleccione un empleado..." /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedId && (
              <div className="flex items-end gap-2">
                <div>
                  <Label className="mb-1 block">Duración cita (minutos)</Label>
                  <Input
                    type="number"
                    min={5} max={120}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-28"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => durationMutation.mutate(parseInt(duration))}
                  disabled={durationMutation.isPending}
                >
                  {durationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedId && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Día</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const s = getScheduleForDay(day);
                return (
                  <TableRow key={day}>
                    <TableCell className="font-medium">{DAY_NAMES[day]}</TableCell>
                    <TableCell>
                      {!s ? (
                        <Badge variant="outline">Sin configurar</Badge>
                      ) : s.isAvailable ? (
                        <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Sí</Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />No</Badge>
                      )}
                    </TableCell>
                    <TableCell>{s?.startTime ?? "—"}</TableCell>
                    <TableCell>{s?.endTime ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDay({ dayOfWeek: day, existing: s })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {!selectedId && (
          <p className="text-center text-muted-foreground text-sm py-6">
            Selecciona un empleado para ver y editar su horario.
          </p>
        )}
      </CardContent>

      {editingDay && selectedId && (
        <EditEmployeeDayModal
          employeeId={selectedId}
          dayOfWeek={editingDay.dayOfWeek}
          existingSchedule={editingDay.existing}
          onClose={() => setEditingDay(null)}
        />
      )}
    </Card>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────

export const ScheduleManagementPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Clock className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Horarios</h2>
          <p className="text-muted-foreground">Configure el horario de la clínica y la disponibilidad de cada doctor</p>
        </div>
      </div>
      <ClinicScheduleSection />
      {/* <EmployeeScheduleSection /> */}
    </div>
  );
};
