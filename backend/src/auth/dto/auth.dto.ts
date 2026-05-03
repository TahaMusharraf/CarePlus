import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name!: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone!: string;
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    dob!: Date;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!: string;
    @ApiProperty({ enum: ['patient', 'doctor', 'admin'] })
    @IsNotEmpty()
    @IsString()
    role!: 'patient' | 'doctor' | 'admin';

    // doctor
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    specialization?: string;
    @ApiProperty({required: false})
    @IsNumber()
    @IsOptional()
    dept_id?: number;

    // patient
    @ApiProperty({ enum: ['M', 'F'], required: false })
    @IsString()
    @IsOptional()
    gender?: 'M' | 'F';
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    blood_group?: string;
}

export class SigninDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password!: string;
}

export interface AuthResponseDto {
    message: string;
    user: User;
    access_token: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    dob: Date;
    role: 'patient' | 'doctor' | 'admin';
}