import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AtGuard } from '../common/guards/at.guard';
import { createAppointmentDto, updateAppointmentDto } from './dto/appointments.dto';

@ApiBearerAuth('Authorization')
@Controller('appointments')
@UseGuards(AtGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}
  
  @Post('create')
  async createAppointment(@Body() dto: createAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }
  
  @Patch('update/:id')
  async updateAppointment(@Param('id', ParseIntPipe) appointmentId: number, @Body() dto: updateAppointmentDto) {
    return this.appointmentsService.updateAppointment(appointmentId, dto);
  }

  @Get('get/:id')
  async getAppointmentDetails(@Param('id', ParseIntPipe) appointmentId: number) {
    return this.appointmentsService.getAppointmentDetails(appointmentId);
  }
  
  @Get('all')
  async getAllAppointments() {
    return this.appointmentsService.getAllAppointments();
  }

  @Get('patient/:id')
  async getAppointmentsByPatient(@Param('id', ParseIntPipe) patientId: number) {
    return this.appointmentsService.getAppointmentsByPatient(patientId);
  }

  @Get('doctor/:id')
  async getAppointmentsByDoctor(@Param('id', ParseIntPipe) doctorId: number) {
    return this.appointmentsService.getAppointmentsByDoctor(doctorId);
  }

  @Delete('delete')
  async deleteAppointment(@Body() appointmentIds: number[]) {
    return this.appointmentsService.deleteAppointment(appointmentIds);
  }

  @Delete('delete-all')
  async deleteAllAppointments() {
    return this.appointmentsService.deleteAllAppointments();
  }
}
