export interface ExamType {
   id: number;
   name: string;
   description: string;
   deliveryTime: number;
   pricePaid: number;
   specialtyId: number;
   isActive: boolean;
}

export interface ExamTypeCreateDto {
   name: string;
   description?: string;
   deliveryTime: number;
   pricePaid: number;
   specialtyId: number;
}

export interface ExamTypeListDto extends ExamType {
   specialtyName: string;
}

export interface ExamsBySpecialtyListDto {
   id: number;
   name: string;
   description: string;
   examTypes: ExamTypeListDto[];
}
