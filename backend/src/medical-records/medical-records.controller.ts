import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Patch, ParseIntPipe } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { createMedicalRecordDto, updateMedicalRecordDto } from './dto/medical-records.dto';
import { AtGuard } from '../common/guards/at.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller('medical-records')
@UseGuards(AtGuard)
export class MedicalRecordsController {
    constructor(private medicalRecordsService: MedicalRecordsService) {}

    @Post('create')
    async create(@Body() dto: createMedicalRecordDto) {
      return this.medicalRecordsService.createMedicalRecord(dto);
    }

    @Patch('update/:id')
    async update(@Param('id') id: string, @Body() dto: updateMedicalRecordDto) {
      return this.medicalRecordsService.updateMedicalRecord(+id, dto);
    }

    @Get('get/:id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
      return this.medicalRecordsService.getMedicalRecord(id);
    }

    @Get('all')
    async getAll() {
      return this.medicalRecordsService.getAllMedicalRecord();
    }

    @Get('patient/:id')
    async getByPatient(@Param('id', ParseIntPipe) patientId: number) {
      return this.medicalRecordsService.getMedicalRecordByPatient(patientId);
    }

    @Get('doctor/:id')
    async getByDoctor(@Param('id', ParseIntPipe) doctorId: number) {
      return this.medicalRecordsService.getMedicalRecordByDoctor(doctorId);
    }

    @Delete('delete')
    async delete(@Body() ids: number[] ) {
      return this.medicalRecordsService.deleteMedicalRecords(ids);
    }

    @Delete('delete-all')
    async deleteAll(){
      return this.medicalRecordsService.deleteAllMedicalRecords();
    }
  }