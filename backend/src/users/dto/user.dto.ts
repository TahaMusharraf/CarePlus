export interface User {
    id: number;
    name: string;
    email: string;
    dob: Date;
    phone: string;
    role: 'patient' | 'doctor' | 'admin';
}