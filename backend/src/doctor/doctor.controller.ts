import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AtGuard } from '../common/guards/at.guard';
import { UpdateDoctorDto } from './dto/doctor.dto';

@ApiBearerAuth('Authorization')
@Controller('doctor')
@UseGuards(AtGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Patch('update/:id')
  async updateDoctor(@Param('id', ParseIntPipe) doctorId: number, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.updateDoctor(doctorId, dto);
  }

  @Get('all')
  async getAllDoctors() {
    return this.doctorService.getAllDoctors();
  }

  @Get('get/:id')
  async getDoctorById(@Param('id', ParseIntPipe) doctorId: number) {
    return this.doctorService.getDoctorById(doctorId);
  }

  @Get('getByDoctorId/:id')
  async getDoctorByDoctorId(@Param('id', ParseIntPipe) doctorId: number) {
    return this.doctorService.getDoctorByDoctorId(doctorId);
  }

  @Delete('delete')
  async deleteDoctor(@Body() doctorIds: number[]) {
    return this.doctorService.deleteDoctor(doctorIds);
  }

  @Delete('delete-all')
  async deleteAllDoctors() {
    return this.doctorService.deleteAllDoctores();
  }
}
