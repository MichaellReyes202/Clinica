export interface Patient {
    id?: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    secondLastName?: string;
    dateOfBirth: string; // formato ISO: 'YYYY-MM-DD'
    dni?: string;
    contactPhone?: string;
    contactEmail?: string;

    address?: string;
    sexId?: string;
    bloodTypeId?: string;
    bloodType?: {
        id: number;
        name: string;
    };
    consultationReasons?: string;
    chronicDiseases?: string;
    allergies?: string;
    guardian?: Guardian;
}

export interface PatientListDto {
    id?: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    secondLastName?: string;
    dateOfBirth: string;
    dni?: string;
    createdAt: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    sexId: string; // en el schema es string
    bloodTypeId?: string; // en el schema es string opcional
    consultationReasons?: string;
    chronicDiseases?: string;
    allergies?: string;
    guardian?: Guardian;
}

export interface Guardian {
    fullName?: string;
    relationship?: string;
    dni?: string;
    contactPhone?: string;
}

export interface PatientFilterResponse {
    id: number;
    fullName: string;
    dni?: string;
    contactPhone?: string;
}
