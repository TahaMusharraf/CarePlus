import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientsModule } from './patients/patient.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    DepartmentsModule,
    DoctorModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    UsersModule,
  ]
})
export class AppModule {}
