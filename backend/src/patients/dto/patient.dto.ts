import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class updatePatientDto{
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    email?: string;
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phone?: string;
    @ApiProperty({ required: false })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dob?: Date;
    @ApiProperty({ required: false, enum: ['M', 'F'] })
    @IsString()
    @IsOptional()
    gender?: 'M' | 'F';
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    blood_group?: string;
}

export interface Patient {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: 'M' | 'F';
    address: string;
    dob: Date;
    bloodGroup: string;
}