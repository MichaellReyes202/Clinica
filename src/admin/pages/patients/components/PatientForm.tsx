import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, FileText, Calendar, IdCard, Car } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Patient } from "@/interfaces/Patient.response"
import { useForm } from "react-hook-form"
import { PatientSchema, type PatientFormValue } from "@/admin/Validation/Patient.Schema"
import { zodResolver } from "@hookform/resolvers/zod"
import type { OptionDto } from "@/interfaces/OptionDto.response"
import { usePatientMutation } from "@/clinica/hooks/usePatient"

export interface PatientFormProps {
   initialPatient: Patient,
   onSuccess?: () => void,
   sexoOptions: OptionDto[];
   bloodTypeOptions: OptionDto[];
}

export const PatientForm = ({ initialPatient, sexoOptions, bloodTypeOptions, onSuccess }: PatientFormProps) => {

   const { handleSubmit, register, setValue, watch, formState: { errors }, reset, setError, clearErrors } = useForm<PatientFormValue>({
      resolver: zodResolver(PatientSchema),
      defaultValues: {
         id: initialPatient.id || 0,
         firstName: initialPatient.firstName || "",
         middleName: initialPatient.middleName || "",
         lastName: initialPatient.lastName || "",
         secondLastName: initialPatient.secondLastName || "",
         dateOfBirth: initialPatient.dateOfBirth ? new Date(initialPatient.dateOfBirth).toISOString().substring(0, 10) : "",
         dni: initialPatient.dni || "",
         contactPhone: initialPatient.contactPhone || "",
         contactEmail: initialPatient.contactEmail || "",
         address: initialPatient.address || "",
         sexId: initialPatient.sexId?.toString() || "",
         bloodTypeId: initialPatient.bloodTypeId?.toString() || "",
         consultationReasons: initialPatient.consultationReasons || "",
         chronicDiseases: initialPatient.chronicDiseases || "",
         allergies: initialPatient.allergies || "",
         guardian: initialPatient.guardian || {}

      }
   })

   const { createMutation, updateMutation, isPosting } = usePatientMutation(onSuccess, setError);

   const obSubmit = (values: PatientFormValue) => {
      clearErrors();
      reset();
      const payload: Patient = { ...values };
      if (!(values.guardian && Object.values(values.guardian).some(value => value !== undefined && value !== null && value !== ''))) {
         delete payload.guardian;
      }
      if (initialPatient.id) {
         updateMutation.mutate(payload);
      }
      else {
         delete payload.id;
         createMutation.mutate(payload);
      }
   }

   return (
      <form onSubmit={handleSubmit(obSubmit)} className="space-y-6">
         <Card className="bg-card border-border">
            <CardHeader>
               <CardTitle className="text-card-foreground">Información Personal</CardTitle>
               <CardDescription>Datos básicos del paciente</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
               <div className="grid gap-4 md:grid-cols-3">

                  <div className="space-y-2">
                     <Label htmlFor="first_name" className="text-card-foreground"> Primer nombre <span className="text-red-600">*</span></Label>
                     <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("firstName")} name="firstName" type="text" placeholder="Juan" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.firstName && (<p className="text-red-500 text-sm">{errors.firstName.message}</p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="middle_name" className="text-card-foreground"> Segundo nombre</Label>
                     <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("middleName")} name="middleName" type="text" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.middleName && (<p className="text-red-500 text-sm">{errors.middleName?.message}</p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="last_name" className="text-card-foreground">Primer Apellido<span className="text-red-600">*</span></Label>
                     <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("lastName")} name="lastName" type="text" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.lastName && (<p className="text-red-500 text-sm">{errors.lastName?.message}</p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="second_last_name" className="text-card-foreground">Segundo Apellido </Label>
                     <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("secondLastName")} name="secondLastName" type="text" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.secondLastName && (<p className="text-red-500 text-sm">{errors.secondLastName?.message}</p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="birth_date" className="text-card-foreground">Fecha de Nacimiento <span className="text-red-600">*</span></Label>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("dateOfBirth")} name="dateOfBirth" type="date" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.dateOfBirth && (<p className="text-red-500 text-sm">{errors.dateOfBirth?.message}</p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="dni" className="text-card-foreground">Cedula</Label>
                     <div className="relative">
                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("dni")} name="dni" type="text" placeholder="000-000000-00000" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.dni && (<p className="text-red-500 text-sm">{errors.dni?.message}</p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="phone" className="text-card-foreground"> Teléfono </Label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("contactPhone")} name="contactPhone" type="tel" placeholder="(505) 8765-4321" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.contactPhone && (<p className="text-red-500 text-sm">{errors.contactPhone?.message}</p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="email" className="text-card-foreground">Correo Electrónico</Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("contactEmail")} name="contactEmail" type="email" placeholder="paciente@ejemplo.com" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.contactEmail && (<p className="text-red-500 text-sm">{errors.contactEmail?.message}</p>)}
                  </div>


                  <div className="space-y-2 w-full">
                     <Label>Tipo de Sangre</Label>
                     <Select onValueChange={(value) => setValue("bloodTypeId", value)} value={watch("bloodTypeId")}>
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Seleccione un tipo de sangre" />
                        </SelectTrigger>
                        <SelectContent>
                           {bloodTypeOptions.map((bloodType) => (<SelectItem key={bloodType.id} value={bloodType.id.toString()}>{bloodType.name}</SelectItem>))}
                        </SelectContent>
                     </Select>
                     {errors.bloodTypeId && (<p className="text-red-500 text-sm">{errors.bloodTypeId.message} </p>)}
                  </div>
                  <div className="space-y-2 w-full">
                     <Label>Sexo</Label>
                     <Select onValueChange={(value) => setValue("sexId", value)} value={watch("sexId")}>
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Seleccione un género" />
                        </SelectTrigger>
                        <SelectContent>
                           {sexoOptions.map((sex) => (<SelectItem key={sex.id} value={sex.id.toString()}>{sex.name}</SelectItem>))}
                        </SelectContent>
                     </Select>
                     {errors.sexId && (<p className="text-red-500 text-sm">{errors.sexId.message} </p>)}
                  </div>

               </div>

               <div className="space-y-2">
                  <Label htmlFor="address" className="text-card-foreground"> Dirección </Label>
                  <div className="relative">
                     <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input {...register("address")} type="text" name="address" placeholder="Calle Principal, Casa #123, Masaya" className="pl-10 bg-background text-foreground" />
                  </div>
                  {errors.address && (<p className="text-red-500 text-sm">{errors.address.message} </p>)}
               </div>
            </CardContent>
         </Card>

         <Card className="bg-card border-border">
            <CardHeader>
               <CardTitle className="text-card-foreground">Información Médica</CardTitle>
               <CardDescription>Antecedentes</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
               <div className="grid gap-4 md:grid-cols-2">

                  <div className="space-y-2">
                     <Label htmlFor="allergies" className="text-card-foreground"> Motivos de la consulta </Label>
                     <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea {...register("consultationReasons")} name="allergies" placeholder="Ralizar examen" className="pl-10 bg-background text-foreground min-h-[100px]" />
                     </div>
                     {errors.consultationReasons && (<p className="text-red-500 text-sm">{errors.consultationReasons.message} </p>)}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="chronicDiseases" className="text-card-foreground"> Enfermedades Crónicas </Label>
                     <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea {...register("chronicDiseases")} name="chronicDiseases" placeholder="Diabetes, hipertensión, etc." className="pl-10 bg-background text-foreground min-h-[100px]" />
                     </div>
                     {errors.chronicDiseases && (<p className="text-red-500 text-sm">{errors.chronicDiseases.message} </p>)}
                  </div>

               </div>

               <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-card-foreground"> Alergias </Label>
                  <div className="relative">
                     <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Textarea {...register("allergies")} name="allergies" placeholder="Penicilina, mariscos, etc." className="pl-10 bg-background text-foreground min-h-[100px]" />
                  </div>
                  {errors.allergies && (<p className="text-red-500 text-sm">{errors.allergies.message} </p>)}
               </div>
            </CardContent>
         </Card>

         <Card className="bg-card border-border">
            <CardHeader>
               <CardTitle className="text-card-foreground">Información del Tutor</CardTitle>
               <CardDescription> Datos del contacto de emergencia o tutor legal</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
               <div className="grid gap-4 md:grid-cols-3">

                  <div className="space-y-2">
                     <Label htmlFor="guardian_name" className="text-card-foreground"> Nombre Completo </Label>
                     <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("guardian.fullName")} type="text" placeholder="María Pérez" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.guardian?.fullName && (<p className="text-red-500 text-sm">{errors.guardian.fullName.message} </p>)}
                  </div>

                  {/* DNI - Cedula */}
                  <div className="space-y-2">
                     <Label htmlFor="guardian_dni" className="text-card-foreground">Cédula</Label>
                     <div className="relative">
                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("guardian.dni")} type="text" placeholder="000-000000-00000" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.guardian?.dni && (<p className="text-red-500 text-sm">{errors.guardian.dni.message} </p>)}
                  </div>

                  {/* Parentesco   */}
                  <div className="space-y-2">
                     <Label htmlFor="relationship" className="text-card-foreground"> Parentesco </Label>
                     <div className="relative">
                        <Car className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("guardian.relationship")} type="text" placeholder="Madre, Hermano, Esposo" className="pl-10 bg-background text-foreground" />
                     </div>
                     {errors.guardian?.relationship && (<p className="text-red-500 text-sm">{errors.guardian.relationship.message} </p>)}
                  </div>

                  {/* numero de contacto  */}
                  <div className="space-y-2">
                     <Label htmlFor="guardian.contactPhone" className="text-card-foreground"> Teléfono de Contacto </Label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...register("guardian.contactPhone")} type="text" placeholder="88887777" className="pl-10 bg-background text-foreground" />
                        {errors.guardian?.contactPhone && (<p className="text-red-500 text-sm">{errors.guardian.contactPhone.message} </p>)}
                     </div>
                  </div>

                  {/* Error agrupado del bloque de tutor */}
                  {errors.guardian && (
                     <p className="text-red-500 text-sm mt-2">
                        {errors.guardian?.message ?? "Por favor complete todos los campos del tutor si llena alguno."}
                     </p>
                  )}
               </div>
            </CardContent>
         </Card>



         <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="text-card-foreground border-border bg-transparent" disabled={isPosting} onClick={() => window.history.back()}>
               Cancelar
            </Button>
            <Button type="submit" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" disabled={isPosting} >
               {initialPatient.id ? "Actualizar Paciente" : "Crear Paciente"}
            </Button>
         </div>
      </form>
   )
}













