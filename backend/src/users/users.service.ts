import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_POOL } from '../database/database.module';
import * as oracledb from 'oracledb';
import { OBJ } from '../database/db.helper';
import { User } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(@Inject(DB_POOL) private readonly pool: oracledb.Pool) {}
    
    async getAllUsers(): Promise<{message: string, users: User[]}>{
        const connection = await this.pool.getConnection();
        try {
            const users = await connection.execute(`SELECT * FROM users`,{}, OBJ);

            if(!users.rows || users.rows.length === 0){
                throw new NotFoundException('Users no found');
            }
            
            return {
                message: "All users found successfully",
                users: users.rows.map((response: any) => ({
                    id: response.USER_ID,
                    name: response.NAME,
                    email: response.EMAIL,
                    dob: response.DOB,
                    phone: response.PHONE,
                    role: response.ROLE
                }))
            }
        } catch (error){
            throw error;
        } finally {
            connection.release();
        }
    }

    async getUser(userId: number): Promise<{message: string, user: User}>{
        const connection = await this.pool.getConnection();
        try {
            const user = await connection.execute(`SELECT * FROM users WHERE user_Id= :userId`, {userId}, OBJ);

            if(!user.rows || user.rows.length === 0){
                throw new NotFoundException('Users no found');
            }

            const response: any = user.rows[0];
            
            return {
                message: 'User found successfully',
                user: {
                    id: response.USER_ID,
                    name: response.NAME,
                    email: response.EMAIL,
                    dob: response.DOB,
                    phone: response.PHONE,
                    role: response.ROLE
                }
            }
        } catch (error){
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteUsers(userIds: number[]): Promise<{message: string}> {
        const connection = await this.pool.getConnection();
        try {
            for (const userId of userIds) {
                const userResult: any = await connection.execute(
                    'SELECT role FROM users WHERE user_id = :userId',
                    { userId }, OBJ
                );

                if (!userResult.rows || userResult.rows.length === 0) {
                    throw new NotFoundException(`User ${userId} not found`);
                }

                const role = userResult.rows[0].ROLE;

                if (role === 'doctor') {
                    await connection.execute(
                        'DELETE FROM doctors WHERE user_id = :userId', { userId }
                    );
                } else if (role === 'patient') {
                    await connection.execute(
                        'DELETE FROM patients WHERE user_id = :userId', { userId }
                    );
                } else if (role === 'admin') {
                    await connection.execute(
                        'DELETE FROM admin WHERE user_id = :userId', { userId }
                    );
                }

                const result = await connection.execute(
                    'DELETE FROM users WHERE user_id = :userId',
                    { userId }, OBJ
                );

                if (!result.rowsAffected || result.rowsAffected === 0) {
                    throw new NotFoundException(`Failed to delete user ${userId}`);
                }
            }
            await connection.commit();
            return { message: 'User(s) deleted successfully' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
