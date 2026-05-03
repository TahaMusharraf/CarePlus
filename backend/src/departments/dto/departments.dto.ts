import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class createDepartmentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name!: string
}

export class updateDepartmentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name!: string
    @ApiProperty({ type: [Number] })
    @IsNotEmpty()
    @IsArray()
    ids!: number[]
}

export interface Department {
    id: number;
    name: string;
}