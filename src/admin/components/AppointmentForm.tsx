


// import { useState, type Dispatch, type SetStateAction } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent } from "@/components/ui/card"
// import { Textarea } from "@/components/ui/textarea"
// import { Calendar, FileText } from "lucide-react"
// import { SelectMultiple } from "../pages/appointments/components/SelectMultiple"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { AppointmentSchema, type AppointmentFormValues } from "../Validation/AppointmentSchema"
// import type { Appointment, DoctorBySpecialtyDto } from "@/interfaces/Appointment.response"
// import type { OptionDto } from "@/interfaces/OptionDto.response"


// interface AppointmentFormProps {
//   initialData?: Appointment,
//   doctorBySpecialty: DoctorBySpecialtyDto[],
//   onSubmit?: (data: any) => void
//   submitLabel?: string,
//   setOpen: Dispatch<SetStateAction<boolean>>
// }

// export const AppointmentForm = ({ initialData, onSubmit, submitLabel = "Agendar Cita", setOpen, doctorBySpecialty }: AppointmentFormProps) => {

//   const [doctors, setDoctors] = useState<OptionDto[]>([])


//   const { handleSubmit, register, setValue, watch, formState: { errors }, reset } = useForm<AppointmentFormValues>({
//     resolver: zodResolver(AppointmentSchema),
//     defaultValues: {
//       patientId: "",
//       employeeId: "",
//       startTime: "",
//       duration: "30",
//       reason: "",
//     }
//   });

//   const handleSetDoctors = (id: string) => {
//     const dc = doctorBySpecialty.find(e => e.id.toString() == id);
//     console.log(dc?.doctors)
//     setDoctors(dc?.doctors || [])
//   }



//   // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//   //   setFormData((prev) => ({
//   //     ...prev,
//   //     [e.target.name]: e.target.value,
//   //   }))
//   // }
//   const obSubmit = async (value: AppointmentFormValues) => {
//     console.log(value)
//   }


//   return (
//     <form onSubmit={handleSubmit(obSubmit)} className="space-y-6">
//       <Card className="bg-card border-border">
//         <CardContent className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-2">

//             <div className="space-y-4">
//               <SearchPatient setValue={setValue} />
//               {errors.employeeId && (<p className="text-red-500 text-sm">{errors.employeeId.message} </p>)}
//             </div>

//             <div className="space-y-4">

//               <div className="space-y-2 w-full">
//                 <Label>Seleccione la especialidad</Label>
//                 <Select onValueChange={value => {
//                   handleSetDoctors(value)
//                 }}>
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Seleccione un Especialidad" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {doctorBySpecialty?.map(sp => (<SelectItem key={sp.id} value={sp.id.toString()}>{sp.name}</SelectItem>))}
//                   </SelectContent>
//                 </Select>
//                 {/* {errors.sexId && (<p className="text-red-500 text-sm">{errors.sexId.message} </p>)} */}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="doctor" className="text-card-foreground"> Doctor * </Label>
//                 <div className="relative">
//                   <Select disabled={doctors.length == 0} onValueChange={(value) => setValue("employeeId", value)} value={watch("employeeId")}>
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Seleccionar doctor" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {doctors?.map(dc => (<SelectItem key={dc.id} value={dc.id.toString()}>{dc.name}</SelectItem>))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {errors.employeeId && (<p className="text-red-500 text-sm">{errors.employeeId.message} </p>)}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="date" className="text-card-foreground"> Fecha * </Label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input {...register("startTime")} type="date" className="pl-10 bg-background text-foreground" required />
//                 </div>
//               </div>

//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="time" className="text-card-foreground"> Hora de Inicio* </Label>
//               <Input id="time" name="time" type="time" className="bg-background text-foreground" required />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="time" className="text-card-foreground"> Hora de Fin * </Label>
//               <Input id="time" name="time" type="time" className="bg-background text-foreground" required />
//             </div>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="reason" className="text-card-foreground"> Motivo de la Consulta * </Label>
//               <div className="relative">
//                 <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Textarea id="reason" name="reason" placeholder="Describa el motivo de la consulta..." className="pl-10 bg-background text-foreground min-h-[100px]" required />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="reason" className="text-card-foreground"> Seleccione el examen a realizar</Label>
//               <SelectMultiple />
//             </div>
//           </div>



//         </CardContent>
//       </Card>

//       <div className="flex justify-end gap-3">
//         {/* cerrar el modal  */}

//         <Button type="button" variant="outline" className="text-card-foreground border-border bg-transparent" onClick={() => setOpen(value => !value)}  >
//           Cancelar
//         </Button>
//         <Button type="submit" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" >
//           "Guardando..."
//         </Button>
//       </div>
//     </form>
//   )
// }


// components/AppointmentForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DoctorBySpecialtyDto } from "@/interfaces/Appointment.response";
import type { OptionDto } from "@/interfaces/OptionDto.response";
import { AppointmentSchema, type AppointmentFormValues } from "../Validation/AppointmentSchema";
import { SearchPatient } from "../pages/appointments/components/SearchPatient";

interface AppointmentFormProps {
  initialStart?: string;
  setOpen: (open: boolean) => void;
  doctorBySpecialty: DoctorBySpecialtyDto[];
  onEventAdded: (event: { title: string; start: string; end: string }) => void;
}

export const AppointmentForm = ({
  initialStart = "",
  setOpen,
  doctorBySpecialty,
  onEventAdded,
}: AppointmentFormProps) => {
  const [doctors, setDoctors] = useState<OptionDto[]>([]);

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      patientId: "",
      employeeId: "",
      startTime: initialStart.slice(0, 16), // "2025-11-08T09:30"
      duration: "30",
      reason: "",
    },
  });

  const handleSetDoctors = (id: string) => {
    const specialty = doctorBySpecialty.find((e) => e.id.toString() === id);
    setDoctors(specialty?.doctors || []);
  };

  const onSubmit = (data: AppointmentFormValues) => {
    const start = new Date(data.startTime);
    const end = new Date(start.getTime() + parseInt(data.duration, 10) * 60000);

    const patient = watch("patientId");
    const doctor = doctors.find((d) => d.id.toString() === data.employeeId);

    onEventAdded({
      title: `${doctor?.name || "Dr."} - Paciente ${patient}`,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Paciente */}
            <div className="space-y-4">
              <SearchPatient setValue={setValue} />
              {errors.patientId && <p className="text-red-500 text-sm">{errors.patientId.message}</p>}
            </div>

            {/* Especialidad + Doctor */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Especialidad</Label>
                <Select onValueChange={handleSetDoctors}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorBySpecialty.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id.toString()}>
                        {sp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select
                  disabled={doctors.length === 0}
                  onValueChange={(v) => setValue("employeeId", v)}
                  value={watch("employeeId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((dc) => (
                      <SelectItem key={dc.id} value={dc.id.toString()}>
                        {dc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && <p className="text-red-500 text-sm">{errors.employeeId.message}</p>}
              </div>
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Fecha y Hora *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("startTime")}
                  type="datetime-local"
                  className="pl-10"
                />
              </div>
              {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Duración (min) *</Label>
              <select
                {...register("duration")}
                className="w-full border rounded-md px-3 py-2"
              >
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
              {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label>Motivo de la consulta</Label>
            <Textarea {...register("reason")}
              placeholder="Describa el motivo..."
              className="min-h-[80px]"
            />
            {errors.reason && <p className="text-red-500 text-sm">{errors.reason.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-sidebar-primary text-sidebar-primary-foreground">
          Agendar Cita
        </Button>
      </div>
    </form>
  );
};