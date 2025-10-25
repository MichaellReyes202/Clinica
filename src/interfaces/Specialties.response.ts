// para mostrar los elementos en una tabla
export interface SpecialtyListDto {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
  employees: number;
}

export interface SpecialtiesCreation {
  name: string;
  description?: string;
}

export interface SpecialtiesUpdate extends SpecialtiesCreation {
  id: number;
  isActive: boolean;
}
