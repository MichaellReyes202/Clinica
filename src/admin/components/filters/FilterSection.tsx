import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, X, Search, ChevronDownIcon } from "lucide-react";
import { useUrlFilters } from "@/clinica/hooks/useUrlFilters";
import type { OptionDto } from "@/interfaces/OptionDto.response";

export interface StatusOption {
   value: string;
   label: string;
}

export interface DoctorBySpecialty {
   id: number;
   name: string;
   doctors: OptionDto[];
}

interface FilterSectionProps {
   title?: string;
   statusOptions: StatusOption[];
   specialtyOptions: Array<{ id: number; name: string }>;
   showDoctorFilter?: boolean;
   doctorsBySpecialty?: DoctorBySpecialty[];
}

export const FilterSection = ({ title = "Filtros", statusOptions, specialtyOptions, showDoctorFilter = false, doctorsBySpecialty = [] }: FilterSectionProps) => {
   const [openDateFrom, setOpenDateFrom] = useState(false);
   const [openDateTo, setOpenDateTo] = useState(false);

   const { filters, updateFilter, clearFilters, hasActiveFilters, activeFilterCount } = useUrlFilters();

   // Convertir fechas de string a Date
   const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
   const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;

   // Filtrar doctores según especialidad seleccionada (por ID)
   const filteredDoctors = doctorsBySpecialty.filter(
      (d) => filters.specialty && filters.specialty !== "all" && d.id.toString() === filters.specialty
   );

   return (
      <Card className="bg-card border-border">
         <CardContent className="p-4">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Filter className="h-5 w-5 text-muted-foreground" />
                     <h3 className="font-semibold text-foreground">{title}</h3>
                     {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-2">
                           {activeFilterCount} activos
                        </Badge>
                     )}
                  </div>
                  {hasActiveFilters && (
                     <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                        <X className="h-4 w-4" />
                        Limpiar Filtros
                     </Button>
                  )}
               </div>

               <div className="flex flex-col gap-4">
                  <div className="relative">
                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input type="text" placeholder="Buscar..." value={filters.search || ""} onChange={(e) => updateFilter("search", e.target.value)} className="pl-9 bg-background text-foreground" />
                  </div>

                  {/* Fila 2: Selectores */}
                  <div className="flex gap-4 flex-wrap items-end">
                     {/* Especialidad */}
                     <div>
                        <Label htmlFor="specialty" className="text-sm mb-2 block">
                           Especialidad
                        </Label>
                        <Select value={filters.specialty || "all"} onValueChange={(value) => updateFilter("specialty", value)}>
                           <SelectTrigger className="bg-background text-foreground">
                              <SelectValue placeholder="Todas" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">Todas las especialidades</SelectItem>
                              {specialtyOptions.map((specialty) => (
                                 <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                    {specialty.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     {/* Médico (solo si showDoctorFilter es true) */}
                     {showDoctorFilter && (
                        <div>
                           <Label htmlFor="doctor" className="text-sm mb-2 block">
                              Médico
                           </Label>
                           <Select value={filters.doctor || "all"} onValueChange={(value) => updateFilter("doctor", value)} disabled={!filters.specialty || filters.specialty === "all"}>
                              <SelectTrigger className="bg-background text-foreground">
                                 <SelectValue placeholder={!filters.specialty || filters.specialty === "all" ? "Seleccione especialidad" : "Todos"} />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">Todos los médicos</SelectItem>
                                 {filteredDoctors.flatMap((specialty) =>
                                    specialty.doctors.map((doctor) => (
                                       <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                          Dr. {doctor.name}
                                       </SelectItem>
                                    ))
                                 )}
                              </SelectContent>
                           </Select>
                        </div>
                     )}

                     {/* Estado */}
                     <div>
                        <Label htmlFor="status" className="text-sm mb-2 block">
                           Estado
                        </Label>
                        <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
                           <SelectTrigger className="bg-background text-foreground">
                              <SelectValue placeholder="Todos" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              {statusOptions.map((option) => (
                                 <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     {/* Fecha Desde */}
                     <div className="flex flex-col gap-2">
                        <Label htmlFor="dateFrom" className="text-sm">
                           Desde
                        </Label>
                        <Popover open={openDateFrom} onOpenChange={setOpenDateFrom}>
                           <PopoverTrigger asChild>
                              <Button variant="outline" id="dateFrom" className="w-[160px] justify-between font-normal">
                                 {dateFrom ? dateFrom.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }) : "Fecha"}
                                 <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                              <Calendar mode="single" selected={dateFrom} captionLayout="dropdown" onSelect={(date) => {
                                 updateFilter("dateFrom", date?.toISOString().split("T")[0]);
                                 setOpenDateFrom(false);
                              }}
                              />
                           </PopoverContent>
                        </Popover>
                     </div>

                     {/* Fecha Hasta */}
                     <div className="flex flex-col gap-2">
                        <Label htmlFor="dateTo" className="text-sm">
                           Hasta
                        </Label>
                        <Popover open={openDateTo} onOpenChange={setOpenDateTo}>
                           <PopoverTrigger asChild>
                              <Button variant="outline" id="dateTo" className="w-[160px] justify-between font-normal">
                                 {dateTo ? dateTo.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }) : "Fecha"}
                                 <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                              <Calendar mode="single" selected={dateTo} captionLayout="dropdown" onSelect={(date) => {
                                 updateFilter("dateTo", date?.toISOString().split("T")[0]);
                                 setOpenDateTo(false);
                              }}
                              />
                           </PopoverContent>
                        </Popover>
                     </div>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
   );
};
