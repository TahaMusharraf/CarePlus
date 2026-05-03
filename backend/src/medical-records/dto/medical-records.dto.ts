import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createMedicalRecordDto{
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
    @IsNumber()
    appointmentId!: number;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    diagnosis!: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    prescription!: string;
}

export class updateMedicalRecordDto{
    @ApiProperty({required:false})
    @IsOptional()
    @IsNumber()
    patientId?: number;
    @ApiProperty({required:false})
    @IsOptional()
    @IsNumber()
    appointmentId?: number;
    @ApiProperty({required:false})
    @IsOptional()
    @IsNumber()
    doctorId?: number;
    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    diagnosis?: string;
    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    prescription?: string;
}

export interface MedicalRecord {
    recordId: number;
    patientId: number;
    doctorId: number;
    appointmentId: number;
    diagnosis: string;
    prescription: string;
    createdAt: string; 
}