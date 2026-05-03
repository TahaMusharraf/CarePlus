import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { DB_POOL } from '../database/database.module';
import { OBJ } from '../database/db.helper';
import { Doctor, UpdateDoctorDto } from './dto/doctor.dto';
import { response } from 'express';

@Injectable()
export class DoctorService {
    constructor(@Inject(DB_POOL) private readonly pool: oracledb.Pool) {}
    
    async updateDoctor(doctorId: number, dto: UpdateDoctorDto): Promise<{ message: string; doctor: Doctor }> {
        const connection = await this.pool.getConnection();
        try{    
            const result = await connection.execute(`SELECT * FROM doctors WHERE doctor_id = :doctorId`,
                { doctorId },
                OBJ
            );

            if(!result.rows || result.rows.length === 0) {
                throw new NotFoundException('Doctor not found');
            }

            const doctor: any = result.rows[0];

            const userResult = await connection.execute(`SELECT * FROM users WHERE user_id = :userId`,
                { userId: doctor.USER_ID },
                OBJ
            );

            if(!userResult.rows || userResult.rows.length === 0) {
                throw new NotFoundException('Associated user not found');
            }

            const user: any = userResult.rows[0];


            await connection.execute(`UPDATE users SET name= :name, email= :email, phone= :phone, dob= :dob WHERE user_Id= :user_id`,
                {
                    name: dto.name ?? user.NAME,  
                    email: dto.email ?? user.EMAIL,
                    phone: dto.phone ?? user.PHONE,
                    dob: dto.dob ?? user.DOB,
                    user_Id: doctor.USER_ID
                }
            )

            await connection.commit();

            const updatedResult: any = await connection.execute(`
                SELECT doctors.DOCTOR_ID, doctors.SPECIALIZATION, doctors.DEPT_ID,
                users.USER_ID, users.NAME, users.EMAIL, users.PHONE, users.DOB,
                departments.NAME as DEPT_NAME
                FROM doctors
                JOIN users ON doctors.user_id = users.user_id
                JOIN departments ON doctors.dept_id = departments.dept_id
                WHERE doctors.DOCTOR_ID = :doctorId`,
                { doctorId },
                OBJ
            );

            const response: any = updatedResult.rows[0];

            return {
                message: 'Doctor Updated Successfully',
                doctor: {
                    id: response.DOCTOR_ID,
                    name: response.NAME,
                    email: response.EMAIL,
                    deptName:  response.DEPT_NAME,
                    phone: response.PHONE,
                    dob: response.DOB,
                    specialization: response.SPECIALIZATION
                }
            }
            
        } catch(error){
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAllDoctors(): Promise<{ message: string; doctors: Doctor[] }> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT doctors.DOCTOR_ID, doctors.SPECIALIZATION, doctors.DEPT_ID,
                users.USER_ID, users.NAME, users.EMAIL, users.PHONE, users.DOB,
                departments.NAME as DEPT_NAME
                FROM doctors
                JOIN users ON doctors.user_id = users.user_id
                JOIN departments ON doctors.dept_id = departments.dept_id`,
                {},
                OBJ
            );            
            if (!result.rows || result.rows.length === 0) {
                return {
                    message: 'No doctors found',
                    doctors: []
                }
            }

            return { 
                message: 'Doctors retrieved successfully',
                doctors: result.rows.map((doctor : any) => ({
                    id: doctor.DOCTOR_ID,
                    name: doctor.NAME,
                    email: doctor.EMAIL,
                    deptName:  doctor.DEPT_NAME,
                    phone: doctor.PHONE,
                    dob: doctor.DOB,
                    specialization: doctor.SPECIALIZATION
                }))
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getDoctorById(doctorId: number): Promise<{ message: string; doctor: Doctor }> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT doctors.DOCTOR_ID, doctors.SPECIALIZATION, doctors.DEPT_ID,
                users.USER_ID, users.NAME, users.EMAIL, users.PHONE, users.DOB,
                departments.NAME as DEPT_NAME
                FROM doctors
                JOIN users ON doctors.user_id = users.user_id
                JOIN departments ON doctors.dept_id = departments.dept_id
                WHERE doctors.USER_ID = :doctorId`,
                { doctorId },
                OBJ
            );

            if (!result.rows || result.rows.length === 0) {
                throw new NotFoundException('Doctor not found');
            }

            const doctor: any = result.rows[0];

            await connection.commit();
            return {
                message: 'Doctor retrieved successfully',
                doctor: {
                    id: doctor.DOCTOR_ID,
                    name: doctor.NAME,
                    email: doctor.EMAIL,
                    deptName:  doctor.DEPT_NAME,
                    phone: doctor.PHONE,
                    dob: doctor.DOB,
                    specialization: doctor.SPECIALIZATION

                }
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getDoctorByDoctorId(doctorId: number): Promise<{ message: string; doctor: Doctor }> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT doctors.DOCTOR_ID, doctors.SPECIALIZATION, doctors.DEPT_ID,
                users.USER_ID, users.NAME, users.EMAIL, users.PHONE, users.DOB,
                departments.NAME as DEPT_NAME
                FROM doctors
                JOIN users ON doctors.user_id = users.user_id
                JOIN departments ON doctors.dept_id = departments.dept_id
                WHERE doctors.doctor_id = :doctorId`,
                { doctorId },
                OBJ
            );

            if (!result.rows || result.rows.length === 0) {
                throw new NotFoundException('Doctor not found');
            }

            const doctor: any = result.rows[0];

            await connection.commit();
            return {
                message: 'Doctor retrieved successfully',
                doctor: {
                    id: doctor.DOCTOR_ID,
                    name: doctor.NAME,
                    email: doctor.EMAIL,
                    deptName:  doctor.DEPT_NAME,
                    phone: doctor.PHONE,
                    dob: doctor.DOB,
                    specialization: doctor.SPECIALIZATION

                }
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteDoctor(doctorIds: number[]): Promise<{ message: string }> {
        const connection = await this.pool.getConnection();
        try{
            for(const doctorId of doctorIds) {
                const result = await connection.execute(`DELETE FROM doctors WHERE doctor_id = :doctorId`, { doctorId }, OBJ);
                if (!result.rowsAffected || result.rowsAffected === 0){
                    throw new NotFoundException(`Failed to delete doctor with ID ${doctorId}`);
                }
            }
            await connection.commit();
            return { message: 'Doctors deleted successfully' };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteAllDoctores() : Promise<{ message: string }> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute(`TRUNCATE TABLE doctors`, {}, OBJ);
            if(!result){
                throw new NotFoundException('Failed to delete all doctors');
            }
            await connection.commit();
            return { message: 'All doctors deleted successfully' };
        } catch(error){
            throw error;
        } finally{
            connection.release();
        }
    }
}
