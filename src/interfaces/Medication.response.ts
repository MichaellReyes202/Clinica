export interface MedicationDto {
    id: number;
    name: string;
    genericName: string;
    presentation: string;
    concentration: string;
    description?: string;
    price: number;
    isActive: boolean;
}
