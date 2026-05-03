import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createAppointmentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    patientId!: number;
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    doctorId!: number;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    appointmentDate!: string;
    @ApiProperty()
    @IsNotEmpty() 
    @IsString()
    appointmentTime!: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    reason!: string;
    @ApiProperty({ enum: ['scheduled', 'completed', 'cancelled', 'pending', 'pending'] })
    @IsNotEmpty()
    status!: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}

export class updateAppointmentDto {
    @ApiProperty({required: false})
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    appointmentDate?: Date;
    @ApiProperty({required: false})
    @IsOptional() 
    @IsString()
    appointmentTime?: string;
    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    reason?: string;
    @ApiProperty({ enum: ['scheduled', 'completed', 'cancelled'] })
    @IsOptional()
    status?: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}


export interface Appointment{
    appointmentId: number;
    patientId: number;
    patientEmail: string,
    patientName: string;
    doctorId: number;
    doctorEmail: string,
    doctorName: string;
    appointmentDateTime: string;
    reason: string;
    status: 'Scheduled' | 'completed' | 'cancelled';
}

export interface Patient{
    patientId: number;
    userId: number;
    name: string;
    email: string;
    phone: string;
    gender: 'M' | 'F';
    address: string;
    dob: Date;
    bloodGroup: string;
}

export interface Doctor{
    id: number;
    name: string;
    email: string;
    phone: string;
    dob: Date;
    specialization: string;
}
