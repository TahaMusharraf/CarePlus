import { Body, Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AtGuard } from '../common/guards/at.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller('users')
@UseGuards(AtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  async getAllUsers(){
    return this.usersService.getAllUsers();
  }
  @Get('get/:id')
  async getUser(@Param('id', ParseIntPipe) userId: number){
    return this.usersService.getUser(userId);
  }
  @Delete('delete')
  async deleteUsers(@Body() userIds: number[]){
    return this.usersService.deleteUsers(userIds);
  }
}
