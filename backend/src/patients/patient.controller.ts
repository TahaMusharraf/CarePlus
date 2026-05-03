import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { PatientsService } from './patient.service';
import { updatePatientDto } from './dto/patient.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AtGuard } from '../common/guards/at.guard';

@ApiBearerAuth('Authorization')
@Controller('patients')
@UseGuards(AtGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Patch('update/:id')
  async updatePatient(@Param('id', ParseIntPipe) id: number, @Body() dto: updatePatientDto) {
    return await this.patientsService.updatePatient(id, dto);
  }

  @Get('get/:id')
  async getPatient(@Param('id', ParseIntPipe) id: number) {
    return await this.patientsService.getPatient(id);
  }

  @Get('getByPatientId/:id')
  async getPatientByPatientId(@Param('id', ParseIntPipe) id: number) {
    return await this.patientsService.getPatientByPatientId(id);
  }

  @Get('all')
  async getAllPatients() {
    return await this.patientsService.getAllPatients();
  }

  @Delete('delete')
  async deletePatient(@Body() patientIds: number[]) {
    return await this.patientsService.deletePatient(patientIds);
  }

  @Delete('delete-all')
  async deleteAllPatients() {
    return await this.patientsService.deleteAllPatients();
  }
}
