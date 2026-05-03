import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_POOL } from '../database/database.module';
import * as oracledb from 'oracledb';
import { OBJ } from '../database/db.helper';
import { Patient, updatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
    constructor(@Inject(DB_POOL) private readonly pool: oracledb.Pool) {}

    async updatePatient(patientId: number, dto: updatePatientDto): Promise<{ message: string; patient: Patient }> {
        const connection = await this.pool.getConnection();
        try{
            const result = await connection.execute(`SELECT * FROM patients WHERE patient_id = :patientId`,
                { patientId },
                OBJ
            );

            if(!result.rows || result.rows.length === 0) {
                throw new NotFoundException('Patient not found');
            }

            const patient: any = result.rows[0];

            const userResult = await connection.execute(`SELECT * FROM users WHERE user_id = :userId`,
                { userId: patient.USER_ID },
                OBJ
            );

            if(!userResult.rows || userResult.rows.length === 0) {
                throw new NotFoundException('Associated user not found');
            }

            const user: any = userResult.rows[0];

            await connection.execute(`UPDATE patients SET gender= :gender, address= :address, blood_group= :blood_group WHERE patient_id = :patientId`,
                { 
                    gender: dto.gender ?? patient.GENDER,
                    address: dto.address ?? patient.ADDRESS,
                    blood_group: dto.blood_group ?? patient.BLOOD_GROUP,
                    patientId
                },
                OBJ
            );

            await connection.execute(`UPDATE users SET name= :name, email= :email, phone= :phone, dob= :dob WHERE user_id = :userId`,
                { 
                    name: dto.name ?? user.NAME,
                    email: dto.email ?? user.EMAIL,
                    phone: dto.phone ?? user.PHONE,
                    dob: dto.dob ?? user.DOB,
                    userId: patient.USER_ID
                },
                OBJ
            );

            await connection.commit();

            const updatedResult: any = await connection.execute(`
                SELECT Patient.PATIENT_ID, 
                Patient.GENDER, Patient.ADDRESS, Patient.BLOOD_GROUP, 
                users.NAME, users.EMAIL, users.PHONE, users.DOB, users.USER_ID
                FROM patients Patient
                JOIN users ON Patient.user_id = users.user_id
                WHERE Patient.patient_id = :patientId`,
                { patientId },
                OBJ
            );

            const response: any = updatedResult.rows[0];

            return { 
                message: 'Patient updated successfully', 
                patient:  {
                    id: response.PATIENT_ID,
                    name: response.NAME,
                    email: response.EMAIL,
                    phone: response.PHONE,
                    dob: response.DOB,
                    gender: response.GENDER,
                    address: response.ADDRESS,
                    bloodGroup: response.BLOOD_GROUP
                }
            };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getPatient(patientId: number): Promise<{message: string; patient: Patient}> {
        const connection = await this.pool.getConnection();
        try{
            const result = await connection.execute(
                `SELECT Patient.PATIENT_ID, 
                 Patient.GENDER, Patient.ADDRESS, Patient.BLOOD_GROUP, 
                 users.NAME, users.EMAIL, users.PHONE, users.DOB, users.USER_ID
                 FROM patients Patient
                 JOIN users ON Patient.user_id = users.user_id
                 WHERE Patient.user_id = :patientId`,
                { patientId },
                OBJ
            );

            if(!result.rows || result.rows.length === 0) {
                throw new NotFoundException('Patient not found');
            }

            const response: any = result.rows[0];

            return {
                message: 'Patient retrieved successfully',
                patient: {
                    id: response.PATIENT_ID,
                    name: response.NAME,
                    email: response.EMAIL,
                    phone: response.PHONE,
                    dob: response.DOB,
                    gender: response.GENDER,
                    address: response.ADDRESS,
                    bloodGroup: response.BLOOD_GROUP
                }
            };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }   
    }

    async getPatientByPatientId(patientId: number): Promise<{message: string; patient: Patient}> {
        const connection = await this.pool.getConnection();
        try{
            const result = await connection.execute(
                `SELECT Patient.PATIENT_ID, 
                 Patient.GENDER, Patient.ADDRESS, Patient.BLOOD_GROUP, 
                 users.NAME, users.EMAIL, users.PHONE, users.DOB, users.USER_ID
                 FROM patients Patient
                 JOIN users ON Patient.user_id = users.user_id
                 WHERE Patient.patient_id = :patientId`,
                { patientId },
                OBJ
            );

            if(!result.rows || result.rows.length === 0) {
                throw new NotFoundException('Patient not found');
            }

            const response: any = result.rows[0];

            return {
                message: 'Patient retrieved successfully',
                patient: {
                    id: response.PATIENT_ID,
                    name: response.NAME,
                    email: response.EMAIL,
                    phone: response.PHONE,
                    dob: response.DOB,
                    gender: response.GENDER,
                    address: response.ADDRESS,
                    bloodGroup: response.BLOOD_GROUP
                }
            };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }   
    }

    async getAllPatients(): Promise<{message: string; patient: Patient[]}> {
        const connection = await this.pool.getConnection();
        try{
            const result = await connection.execute(
                `SELECT Patient.PATIENT_ID, 
                 Patient.GENDER, Patient.ADDRESS, Patient.BLOOD_GROUP, 
                 users.NAME, users.EMAIL, users.PHONE, users.DOB, users.USER_ID
                 FROM patients Patient
                 JOIN users ON Patient.user_id = users.user_id`,
                {},
                OBJ
            );

            if(!result.rows || result.rows.length === 0) {
                return {
                    message: 'No patients found',
                    patient: []
                }
            }


            return {
                message: 'Patient retrieved successfully',
                patient: result.rows.map((patient: any) => ({
                    id: patient.PATIENT_ID,
                    name: patient.NAME,
                    email: patient.EMAIL,
                    phone: patient.PHONE,
                    dob: patient.DOB,
                    gender: patient.GENDER,
                    address: patient.ADDRESS,
                    bloodGroup: patient.BLOOD_GROUP
                }))
            };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }

    }

    async deletePatient(patientIds: number[]): Promise<{ message: string }> {
        const connection = await this.pool.getConnection();
        try{
            for (const patientId of patientIds) {
                const patient: any = await connection.execute(`SELECT * FROM patients WHERE patient_id = :patientId`,
                    {patientId},
                    OBJ
                )

                if(!patient) {
                    throw new NotFoundException('Patient Not found');
                }

                const id = patient.rows[0].USER_ID

                const result = await connection.execute(`DELETE FROM patients WHERE patient_id = :patientId`,
                    { patientId },
                    OBJ
                );
                
                if (!result.rowsAffected || result.rowsAffected === 0) {
                    throw new NotFoundException(`Failed to delete patient with ID ${patientId}`);
                }
                
                const user = await connection.execute(`DELETE FROM users WHERE user_id = :id`, {id}, OBJ)

                if(!user.rowsAffected || user.rowsAffected === 0){
                    throw new NotFoundException(`Failed to delete user with ID ${id}`);
                }
            }
            await connection.commit();
            return { message: 'Patient deleted successfully' };
        } catch (error) {
            throw error;
        } finally {            
            connection.release();
        }
    }

    async deleteAllPatients(): Promise<{ message: string }> {
        const connection = await this.pool.getConnection();
        try{
            const result = await connection.execute(`TRUNCATE TABLE patients`, {}, OBJ);

            if(!result) {
                throw new NotFoundException('Failed to delete patients');
            }
            await connection.commit();
            return { message: 'All patients deleted successfully' };
        } catch (error) {
            throw error;
        } finally {            
            connection.release();
        }
    }
}