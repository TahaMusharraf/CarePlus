import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { createDepartmentDto, updateDepartmentDto } from './dto/departments.dto';
import { AtGuard } from '../common/guards/at.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {} 

  @UseGuards(AtGuard) 
  @Post('create')
  async createDepartment(@Body() dto: createDepartmentDto) {
    return await this.departmentsService.createDepartment(dto);
  }

  @Get('all')
  async getAllDepartments() {
    return await this.departmentsService.getAllDepartments();
  }

  @UseGuards(AtGuard)
  @Get('get/:id')
  async getDepartmentById(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentsService.getDepartmentById(id);
  }

  @UseGuards(AtGuard)
  @Patch('update/:id')
  async updateDepartment(@Param('id', ParseIntPipe) departmentId: number, @Body() dto: updateDepartmentDto) {
    return await this.departmentsService.updateDepartment(departmentId, dto);
  }

  @UseGuards(AtGuard)
  @Delete('delete')
  async deleteDepartments(@Body() ids: number[]) {
    return await this.departmentsService.deleteDeparments(ids);
  }

  @UseGuards(AtGuard)
  @Delete('delete-all')
  async deleteAllDepartments() {
    return await this.departmentsService.deleteAllDepartments();
  }
}
