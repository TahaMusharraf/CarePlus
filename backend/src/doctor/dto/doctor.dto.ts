import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class UpdateDoctorDto{
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
    phone?: string
    @ApiProperty({ required: false })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dob?: Date;
}

export interface Doctor{
    id: number;
    name: string;
    email: string;
    deptName: string;
    phone: string;
    dob: Date;
    specialization: string;
}