import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_POOL } from '../database/database.module';
import * as oracledb from 'oracledb';
import { createMedicalRecordDto, MedicalRecord, updateMedicalRecordDto } from './dto/medical-records.dto';
import { OBJ } from '../database/db.helper';

@Injectable()
export class MedicalRecordsService {
    constructor(@Inject(DB_POOL) private readonly pool: oracledb.Pool) {}

    async createMedicalRecord(dto: createMedicalRecordDto): Promise<{message: string, medicalRecord: MedicalRecord}>{
        const connection = await this.pool.getConnection();
        try{
            
            const patient = await connection.execute(`SELECT * FROM patients WHERE patient_Id = :patientId`,
                {patientId: dto.patientId},
                OBJ
            )

            if (!patient.rows || patient.rows.length === 0){
                throw new NotFoundException(`Patient not found`)
            }

            const doctor = await connection.execute(`SELECT * FROM doctors WHERE doctor_Id = :doctorId`,
                {doctorId: dto.doctorId},
                OBJ
            )

            if (!doctor.rows || doctor.rows.length === 0){
                throw new NotFoundException(`Patient not found`)
            }

            const result: any = await connection.execute(`
                INSERT INTO medical_records (patient_Id, doctor_Id, diagnosis, prescription, appointment_Id) 
                VALUES (:patientId, :doctorId, :diagnosis, :prescription, :appointmentId) RETURNING record_Id into :recordId`,
                {
                    patientId: dto.patientId,
                    doctorId: dto.doctorId,
                    diagnosis: dto.diagnosis,
                    prescription: dto.prescription,
                    appointmentId: dto.appointmentId,
                    recordId: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER },     
                },
                {autoCommit: false}
            )
            
            const recordId = result.outBinds.recordId[0];

            await connection.commit();

            const medicalRecord = await connection.execute(`SELECT * FROM medical_records WHERE record_Id = :recordId`,
                {recordId}, OBJ
            )

            if (!medicalRecord.rows || medicalRecord.rows.length === 0){
                throw new NotFoundException('Medical Record not found')
            }

            const response: any = medicalRecord.rows[0];

            return {
                message: 'Medical record created successfully',
                medicalRecord: {
                    recordId: response.RECORD_ID,
                    patientId: response.PATIENT_ID,
                    doctorId: response.DOCTOR_ID,
                    appointmentId: response.APPOINTMENT_ID,
                    diagnosis: response.DIAGNOSIS,
                    prescription: response.PRESCRIPTION,
                    createdAt: response.CREATED_AT
                }
            }

        } catch(error){
            throw error
        } finally {
            connection.release();
        }
    }

    async updateMedicalRecord(recordId: number, dto: updateMedicalRecordDto): Promise<{message: string, medicalRecord: MedicalRecord}> {
        const connection = await this.pool.getConnection();
        try {
            const existing: any = await connection.execute(
                'SELECT * FROM medical_records WHERE record_id = :recordId',
                { recordId }, OBJ
            );
            if (!existing.rows || existing.rows.length === 0) {
                throw new NotFoundException('Record not found');
            }

            const exist = existing.rows[0];
            
            if(dto.patientId){ 
                const patient = await connection.execute(`SELECT * FROM patients WHERE patient_Id = :patientId`,
                    {patientId: dto.patientId},
                    OBJ
                )
    
                if (!patient.rows || patient.rows.length === 0){
                    throw new NotFoundException(`Patient not found`)
                }
            }

            if (dto.doctorId){
                const doctor = await connection.execute(`SELECT * FROM doctors WHERE doctor_Id = :doctorId`,
                    {doctorId: dto.doctorId},
                    OBJ
                )
    
                if (!doctor.rows || doctor.rows.length === 0){
                    throw new NotFoundException(`Patient not found`)
                }
            }

            await connection.execute(`UPDATE medical_records SET patient_Id= :patientId, doctor_Id= :doctorId, diagnosis= :diagnosis, prescription= :prescription, appointment_Id= :appointmentId WHERE record_id = :recordId`,
                {
                    patientId: dto.patientId ?? exist.PATIENT_ID,
                    doctorId: dto.doctorId ?? exist.DOCTOR_ID,
                    diagnosis: dto.diagnosis ?? exist.DIAGNOSIS,
                    prescription: dto.prescription ?? exist.PRESCRIPTION,
                    appointmentId: dto.appointmentId ?? exist.APPOINTMENT_ID,
                    recordId
                }
            );

            const updated: any = await connection.execute(
                'SELECT * FROM medical_records WHERE record_id = :recordId',
                { recordId }, OBJ
            );

            const response = updated.rows[0];
            await connection.commit();

            return {
                message: 'Medical Record updated successfully',
                medicalRecord: {
                    recordId: response.RECORD_ID,
                    patientId: response.PATIENT_ID,
                    doctorId: response.DOCTOR_ID,
                    appointmentId: response.APPOINTMENT_ID,
                    diagnosis: response.DIAGNOSIS,
                    prescription: response.PRESCRIPTION,
                    createdAt: response.CREATED_AT
                }
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getMedicalRecord(recordId: number): Promise<{message: string, medicalRecord: MedicalRecord}>{
        const connection = await this.pool.getConnection();
        try {

            const medicalRecord = await connection.execute(`SELECT * FROM medical_records WHERE record_Id= :recordId`,
                {recordId}, OBJ
            )

            if (!medicalRecord.rows || medicalRecord.rows.length === 0){
                throw new NotFoundException('Medical Record not found')
            }

            const response: any = medicalRecord.rows[0];

            return {
                message: 'Medical Record found successfully',
                medicalRecord: {
                    recordId: response.RECORD_ID,
                    patientId: response.PATIENT_ID,
                    doctorId: response.DOCTOR_ID,
                    appointmentId: response.APPOINTMENT_ID,
                    diagnosis: response.DIAGNOSIS,
                    prescription: response.PRESCRIPTION,
                    createdAt: response.CREATED_AT
                }
            }
        } catch (error){
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAllMedicalRecord(): Promise<{message: string, medicalRecord: MedicalRecord[]}>{
        const connection = await this.pool.getConnection();
        try {

            const medicalRecord = await connection.execute(`SELECT * FROM medical_records`, {}, OBJ)

            if (!medicalRecord.rows || medicalRecord.rows.length === 0){
                throw new NotFoundException('Medical Record not found')
            }

            return {
                message: 'Medical Record found successfully',
                medicalRecord: medicalRecord.rows.map((response: any) => ({
                    recordId: response.RECORD_ID,
                    patientId: response.PATIENT_ID,
                    doctorId: response.DOCTOR_ID,
                    appointmentId: response.APPOINTMENT_ID,
                    diagnosis: response.DIAGNOSIS,
                    prescription: response.PRESCRIPTION,
                    createdAt: response.CREATED_AT
                }))
            };
        } catch (error){
            throw error;
        } finally {
            connection.release();
        }
    }

    async getMedicalRecordByDoctor(doctorId: number): Promise<{message: string, medicalRecord: MedicalRecord[]}>{
        const connection = await this.pool.getConnection();
        try {

            const medicalRecord = await connection.execute(`SELECT * FROM medical_records WHERE doctor_Id= :doctorId`,
                {doctorId}, OBJ
            )

            if (!medicalRecord.rows || medicalRecord.rows.length === 0){
                return {
                    message: 'No medical record found',
                    medicalRecord: []
                }
            }
            
            return {
                message: 'Medical Record found successfully',
                medicalRecord: medicalRecord.rows.map((record: any) => ({
                    recordId: record.RECORD_ID,
                    patientId: record.PATIENT_ID,
                    doctorId: record.DOCTOR_ID,
                    appointmentId: record.APPOINTMENT_ID,
                    diagnosis: record.DIAGNOSIS,
                    prescription: record.PRESCRIPTION,
                    createdAt: record.CREATED_AT
                }))
            };
        } catch (error){
            throw error;
        } finally {
            connection.release();
        }        
    }

    async getMedicalRecordByPatient(patientid: number): Promise<{message: string, medicalRecord: MedicalRecord[]}>{
        const connection = await this.pool.getConnection();
        try {

            const medicalRecord = await connection.execute(`SELECT * FROM medical_records WHERE patient_Id= :patientid`,
                {patientid}, OBJ
            )

            if (!medicalRecord.rows || medicalRecord.rows.length === 0){
                return {
                    message: 'No medical record found',
                    medicalRecord: []
                }
            }

            return {
                message: 'Medical Record found successfully',
                medicalRecord: medicalRecord.rows.map((record: any) => ({
                    recordId: record.RECORD_ID,
                    patientId: record.PATIENT_ID,
                    doctorId: record.DOCTOR_ID,
                    appointmentId: record.APPOINTMENT_ID,
                    diagnosis: record.DIAGNOSIS,
                    prescription: record.PRESCRIPTION,
                    createdAt: record.CREATED_AT
                }))
            };
        } catch (error){
            throw error;
        } finally {
            connection.release();
        }        
    }

    async deleteMedicalRecords(recordIds: number[]): Promise<{message: string}>{
        const connection = await this.pool.getConnection();
        try {
            for (const recordId of recordIds){
                const result = await connection.execute(`DELETE FROM medical_records WHERE record_Id= :recordId`,
                    {recordId}, OBJ
                )
                if (!result.rowsAffected || result.rowsAffected === 0) {
                    throw new NotFoundException(`Failed to delete patient with ID ${recordId}`);
                }
            }

            await connection.commit();

            return {
                message: 'Medical Record deleted successfully'
            }
        } catch(error){
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteAllMedicalRecords(): Promise<{message: string}>{
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute(`TRUNCATE TABLE medical_records`, {}, OBJ)
            
            if (!result){
                throw new NotFoundException('Failed to delete medical records')
            }

            await connection.commit();

            return {
                message: 'All medical records deleted successfully'
            }
        } catch(error){
            throw error;
        } finally {
            connection.release();
        }
    }
}
