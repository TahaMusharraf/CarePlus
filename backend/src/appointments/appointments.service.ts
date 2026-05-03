import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_POOL } from '../database/database.module';
import * as oracledb from 'oracledb';
import { OBJ } from '../database/db.helper';
import { Appointment, createAppointmentDto, updateAppointmentDto } from './dto/appointments.dto';

@Injectable()
export class AppointmentsService {
    constructor(@Inject(DB_POOL) private readonly pool: oracledb.Pool) {}

    async createAppointment(dto: createAppointmentDto): Promise<{message: string, appointmentDetails: Appointment}> {
        const connection = await this.pool.getConnection();
        try{
            const patientResult = await connection.execute(
                `SELECT Patient.PATIENT_ID, 
                Patient.GENDER, Patient.ADDRESS, Patient.BLOOD_GROUP, 
                users.NAME, users.EMAIL, users.PHONE, users.DOB, users.USER_ID
                FROM patients Patient
                JOIN users ON Patient.user_id = users.user_id
                WHERE Patient.patient_id = :patientId`, 
                { patientId: dto.patientId }, 
                OBJ
            );

            if(!patientResult.rows || patientResult.rows.length === 0){
                throw new NotFoundException('Patient not found');
            }

            const patient: any = patientResult.rows[0]

            const doctorResult = await connection.execute(`
                SELECT doctors.DOCTOR_ID, doctors.SPECIALIZATION, doctors.DEPT_ID,
                users.USER_ID, users.NAME, users.EMAIL, users.PHONE, users.DOB
                FROM doctors 
                JOIN users ON doctors.user_id = users.user_id
                WHERE doctors.doctor_id = :doctorId`, 
                { doctorId: dto.doctorId }, 
                OBJ
            );

            if(!doctorResult.rows || doctorResult.rows.length === 0){
                throw new NotFoundException('Doctor not found');  
            }

            const doctor: any = doctorResult.rows[0];

            const passedDateTime = new Date(`${dto.appointmentDate}T${dto.appointmentTime}:00+05:00`);

            if(passedDateTime < new Date()){
                throw new BadRequestException('Invalid appointment date');
            }

            const appointmentDateTime = this.formatDateTime(new Date(dto.appointmentDate), dto.appointmentTime);
            console.log('Appointment DateTime:', appointmentDateTime);

            // Insert appointment
            const result: any = await connection.execute(
                `INSERT INTO appointments (patient_id, doctor_id, appt_date, appt_time, reason, status)
                VALUES (:patientId, :doctorId, TO_DATE(:appointmentDate, 'YYYY-MM-DD'), :appointmentTime, :reason, :status)
                RETURNING appointment_id INTO :appointmentId`,
                {
                    patientId: dto.patientId,
                    doctorId: dto.doctorId,
                    appointmentDate: dto.appointmentDate,
                    appointmentTime: dto.appointmentTime,
                    reason: dto.reason,
                    status: dto.status,
                    appointmentId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { autoCommit: false }
            ); 

            if (!result.outBinds || !result.outBinds.appointmentId || result.outBinds.appointmentId.length === 0) {
                throw new BadRequestException('Failed to create appointment');
            }   

            const appointmentId = result.outBinds.appointmentId[0];

            const appointmentResult: any = await connection.execute(
                `SELECT * FROM appointments
                WHERE appointment_id = :appointmentId`, 
                {
                    appointmentId: appointmentId
                },
                OBJ
            );

            const appointment: any = appointmentResult.rows[0];

            await connection.commit();
            
            return {
                message: 'Appointment created successfully',
                appointmentDetails: {
                    appointmentId: appointment.APPOINTMENT_ID,
                    patientId: appointment.PATIENT_ID,
                    patientEmail: patient.Email,
                    patientName: patient.NAME,
                    doctorId: appointment.DOCTOR_ID,
                    doctorEmail: doctor.EMAIL,
                    doctorName: doctor.NAME,
                    appointmentDateTime: appointmentDateTime,
                    reason: appointment.REASON,
                    status: appointment.STATUS
                }
            }

        } catch (error) {
            throw error;
        } finally {            
            connection.release();
        }
    }

    async updateAppointment(appointmentId: number, dto: updateAppointmentDto): Promise<{message: string, appointmentDetails: Appointment}> {
        const connection = await this.pool.getConnection();
        try{
            const appointmentResult = await connection.execute(
                `SELECT * FROM appointments WHERE appointment_id = :appointmentId`,
                { appointmentId },
                OBJ
            )

            if(!appointmentResult.rows || appointmentResult.rows.length === 0){
                throw new NotFoundException('Appointment not found');
            }

            const exist: any = appointmentResult.rows[0];
            let patient: any = null;
            let doctor: any = null;

        
            const patientResult = await connection.execute(`SELECT Patient.PATIENT_ID, 
                Patient.GENDER, Patient.ADDRESS, Patient.BLOOD_GROUP, 
                users.NAME, users.EMAIL, users.PHONE, users.DOB, users.USER_ID
                FROM patients Patient
                JOIN users ON Patient.user_id = users.user_id
                WHERE Patient.patient_id = :patientId`,
                {patientId: exist.PATIENT_ID},
                OBJ
            )

            if (!patientResult.rows || patientResult.rows.length === 0){
                throw new NotFoundException(`Patient not found`)
            }

            patient = patientResult.rows[0]
                        
            const doctorResult = await connection.execute(
                `SELECT doctors.DOCTOR_ID, doctors.SPECIALIZATION, doctors.DEPT_ID,
                users.USER_ID, users.NAME, users.EMAIL, users.PHONE, users.DOB
                FROM doctors 
                JOIN users ON doctors.user_id = users.user_id
                WHERE doctors.doctor_id = :doctorId`,
                {doctorId: exist.DOCTOR_ID},
                OBJ
            )

            if (!doctorResult.rows || doctorResult.rows.length === 0){
                throw new NotFoundException(`Doctor not found`)
            }

            doctor = doctorResult.rows[0];
            

            if(dto.appointmentDate && dto.appointmentTime){
                const passedDateTime = new Date(`${dto.appointmentDate}T${dto.appointmentTime}:00+05:00`);
                if(passedDateTime < new Date()){
                    throw new BadRequestException('Invalid appointment date');
                }
            }

            await connection.execute(`
                UPDATE appointments SET 
                    patient_Id = :patientId, 
                    doctor_id = :doctorId, 
                    appt_date = :appointmentDate,   -- remove TO_DATE wrapper
                    appt_time = :appointmentTime, 
                    reason = :reason, 
                    status = :status
                WHERE appointment_id = :appointmentId`,
                {
                    patientId: exist.PATIENT_ID,
                    doctorId: exist.DOCTOR_ID,
                    appointmentDate: dto.appointmentDate 
                        ? new Date(dto.appointmentDate)         
                        : new Date(exist.APPT_DATE),            
                    appointmentTime: dto.appointmentTime ?? exist.APPT_TIME,
                    reason: dto.reason ?? exist.REASON,
                    status: dto.status ?? exist.STATUS,
                    appointmentId
                }
            );

            const updatedResult: any = await connection.execute(
                `SELECT * FROM appointments WHERE appointment_id = :appointmentId`,
                { appointmentId },
                OBJ
            );

            if (!updatedResult.rows || updatedResult.rows.length === 0) {
                throw new NotFoundException('Appointment not found after update');
            }

            const appointment: any = updatedResult.rows[0];

            const appointmentDateTime = this.formatDateTime(new Date(appointment.APPT_DATE), appointment.APPT_TIME);

            await connection.commit();

            return {
                message: 'Appointment updated successfully',
                appointmentDetails: {
                    appointmentId: appointment.APPOINTMENT_ID,
                    patientId: appointment.PATIENT_ID,
                    patientEmail: patient.EMAIL,
                    patientName: patient.NAME,
                    doctorId: appointment.DOCTOR_ID,
                    doctorEmail: doctor.EMAIL,
                    doctorName: doctor.NAME,
                    appointmentDateTime: appointmentDateTime,
                    reason: appointment.REASON,
                    status: appointment.STATUS

                }
            }

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAppointmentDetails(appointmentId: number): Promise<{message: string, appointmentDetails: Appointment}> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT a.*, 
                        u1.name as patient_name,u1.email as patient_email,
                        u2.name as doctor_name, u2.email as doctor_email
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN users u1 ON p.user_id = u1.user_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                JOIN users u2 ON d.user_id = u2.user_id
                WHERE a.appointment_id = :appointmentId`,
                { appointmentId },
                OBJ
            );

            if (!result.rows || result.rows.length === 0) {
                throw new NotFoundException('Appointment not found');
            }

            const appointment: any = result.rows[0];
            
            const appointmentDateTime = this.formatDateTime(appointment.APPT_DATE, appointment.APPT_TIME);
            
            return {
                message: 'Appointment retrieved successfully',
                appointmentDetails: {
                    appointmentId: appointment.APPOINTMENT_ID,
                    patientId: appointment.PATIENT_ID,
                    patientEmail: appointment.PATIENT_EMAIL,
                    patientName: appointment.PATIENT_NAME,
                    doctorId: appointment.DOCTOR_ID,
                    doctorEmail: appointment.DOCTOR_EMAIL,
                    doctorName: appointment.DOCTOR_NAME,
                    appointmentDateTime: appointmentDateTime,
                    reason: appointment.REASON,
                    status: appointment.STATUS
                }
            }               
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAllAppointments(): Promise<{message: string, appointments: Appointment[]}> {
        const connection = await this.pool.getConnection();
        try{
            const result: any = await connection.execute(
                `SELECT a.*, 
                        u1.name as patient_name,u1.email as patient_email,
                        u2.name as doctor_name, u2.email as doctor_email
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN users u1 ON p.user_id = u1.user_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                JOIN users u2 ON d.user_id = u2.user_id`,
                {},
                OBJ
            );      
            
            if (!result.rows || result.rows.length === 0) {
                return{
                    message: 'No appointments found',
                    appointments: []
                }
            }
            
            
            const appointments = result.rows.map((appointment: any) => {
                const appointmentDateTime = this.formatDateTime(appointment.APPT_DATE, appointment.APPT_TIME);
                return {
                    appointmentId: appointment.APPOINTMENT_ID,
                    patientId: appointment.PATIENT_ID,
                    patientEmail: appointment.PATIENT_EMAIL,
                    patientName: appointment.PATIENT_NAME,
                    doctorId: appointment.DOCTOR_ID,
                    doctorEmail: appointment.DOCTOR_EMAIL,
                    doctorName: appointment.DOCTOR_NAME,
                    appointmentDateTime: appointmentDateTime,
                    reason: appointment.REASON,
                    status: appointment.STATUS
                }
            });

            return {
                message: 'Appointments retrieved successfully',
                appointments: appointments
            }
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAppointmentsByPatient(patientId: number): Promise<{message: string, appointments: Appointment[]}> {
        const connection = await this.pool.getConnection();
        try{
            const result = await connection.execute(
                `SELECT a.*, 
                        u1.name as patient_name,u1.email as patient_email,
                        u2.name as doctor_name, u2.email as doctor_email
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN users u1 ON p.user_id = u1.user_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                JOIN users u2 ON d.user_id = u2.user_id
                WHERE a.patient_id = :patientId`,
                { patientId },
                OBJ
            );

            if (!result.rows || result.rows.length === 0) {
                return{
                    message: 'No appointments found',
                    appointments: []
                }
            }

            const appointments = result.rows.map((appointment: any) => {
                const appointmentDateTime = this.formatDateTime(appointment.APPT_DATE, appointment.APPT_TIME);
                return {
                    appointmentId: appointment.APPOINTMENT_ID,
                    patientId: appointment.PATIENT_ID,
                    patientEmail: appointment.PATIENT_EMAIL,
                    patientName: appointment.PAITENT_NAME,
                    doctorId: appointment.DOCTOR_ID,
                    doctorEmail: appointment.DOCTOR_EMAIL,
                    doctorName: appointment.DOCTOR_NAME,
                    appointmentDateTime: appointmentDateTime,
                    reason: appointment.REASON,
                    status: appointment.STATUS
                }
            });

            return {
                message: 'Appointments retrieved successfully',
                appointments: appointments
            }

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAppointmentsByDoctor(doctorId: number): Promise<{message: string, appointments: Appointment[]}> {
        const connection = await this.pool.getConnection();
        try{
            const result = await connection.execute(
                `SELECT a.*, 
                        u1.name as patient_name,u1.email as patient_email,
                        u2.name as doctor_name, u2.email as doctor_email
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN users u1 ON p.user_id = u1.user_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                JOIN users u2 ON d.user_id = u2.user_id
                WHERE a.doctor_id = :doctorId`,
                { doctorId },
                OBJ
            );

            if (!result.rows || result.rows.length === 0) {
                return{
                    message: 'No appointments found',
                    appointments: []
                }
            }

            const appointments = result.rows.map((appointment: any) => {
                const appointmentDateTime = this.formatDateTime(appointment.APPT_DATE, appointment.APPT_TIME);
                return {
                    appointmentId: appointment.APPOINTMENT_ID,
                    patientId: appointment.PATIENT_ID,
                    patientEmail: appointment.PATIENT_EMAIL,
                    patientName: appointment.PATIENT_NAME,
                    doctorId: appointment.DOCTOR_ID,
                    doctorEmail: appointment.DOCTOR_EMAIL,
                    doctorName: appointment.DOCTOR_NAME,
                    appointmentDateTime: appointmentDateTime,
                    reason: appointment.REASON,
                    status: appointment.STATUS
                }
            });

            return {
                message: 'Appointments retrieved successfully',
                appointments: appointments
            }
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteAppointment(appointmentIds: number[]): Promise<{message: string}> {
        const connection = await this.pool.getConnection();
        try {
            for (const apptId of appointmentIds) {
                const result = await connection.execute(
                    `DELETE FROM appointments WHERE appointment_id = :apptId`,
                    { apptId }
                )
                if (!result.rowsAffected || result.rowsAffected === 0) {
                    throw new NotFoundException(`Appointment with ID ${apptId} not found`);
                }
            }
            await connection.commit();
            return { message: 'Appointment(s) deleted successfully' };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteAllAppointments(): Promise<{message: string}> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute(`TRUNCATE TABLE appointments`, {}, OBJ);
            if(!result){
                throw new NotFoundException('Failed to delete all appointments');
            }
            await connection.commit();
            return { message: 'All appointments deleted successfully' };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    formatDateTime (date: Date, time: string) {
        const d = new Date(date).toLocaleDateString('en-PK', {
            timeZone: 'Asia/Karachi',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `${d} ${time}`;
    };

}