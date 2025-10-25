// para mostrar los elementos en una tabla
export interface PositionListDto {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
  employees: number;
}

export interface PositionCreation {
  name: string;
  description: string;
}

export interface PositionUpdate extends PositionCreation {
  id: number;
  isActive: boolean;
}
