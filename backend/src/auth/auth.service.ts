import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponseDto, SigninDto, SignupDto, User } from './dto/auth.dto';
import { DB_POOL } from '../database/database.module';
import * as oracledb from 'oracledb';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { OBJ } from '../database/db.helper';

@Injectable()
export class AuthService {
    constructor(@Inject(DB_POOL) private pool: oracledb.Pool) {}
    
    async signup(dto: SignupDto): Promise<AuthResponseDto> {
        const connection = await this.pool.getConnection();
        try {
            
            const exist = await connection.execute('SELECT * FROM users WHERE email = :email', [dto.email], OBJ);
            console.log("Exist:", exist.rows);
            if (exist.rows && exist.rows.length > 0) {
            throw new ConflictException('User already exists');
            }

            const hashedPassword = await bcrypt.hash(dto.password, 10);
        
            // inserting user
            await connection.execute('BEGIN INSERT INTO users (name, email, password, phone, dob, role) VALUES (:name, :email, :password, :phone, :dob, :role) RETURNING user_id INTO :user_id; END;',
                { name: dto.name, email: dto.email, password: hashedPassword, phone: dto.phone, dob: dto.dob, role: dto.role, user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
            );

            const result = await connection.execute(
                'SELECT * FROM users WHERE email = :email',
                { email: dto.email },
                OBJ
            );
            
            if(!result.rows || result.rows.length === 0) {
                throw new BadRequestException('User not created');
            }
            const user: any = result.rows[0];
            if (dto.role === 'doctor') {
                if (!dto.specialization || !dto.dept_id) {
                    throw new BadRequestException('Specialization and Department ID are required for doctors');
                }

                if(dto.dept_id){
                    const dept = await connection.execute('SELECT * FROM departments WHERE dept_id = :dept_id', { dept_id: dto.dept_id }, OBJ);
                    if(!dept.rows || dept.rows.length === 0){
                        throw new BadRequestException('Department not found');
                    }
                }
                await connection.execute(
                    'INSERT INTO doctors (user_id, specialization, dept_id) VALUES (:user_id, :specialization, :dept_id)',
                    { user_id: user.USER_ID, specialization: dto.specialization, dept_id: dto.dept_id },
                );
            } else if (dto.role === 'patient') {
                if (!dto.gender || !dto.dob) {
                    throw new BadRequestException('Gender is required for patients');
                }
                await connection.execute(
                    'INSERT INTO patients (user_id, gender, address, blood_group) VALUES (:user_id, :gender, :address, :blood_group)',      
                    { user_id: user.USER_ID, gender: dto.gender, address: dto.address, blood_group: dto.blood_group } ,
                );
            } else if(dto.role === 'admin') {
                await connection.execute('INSERT INTO admin (user_id) VALUES (:user_id)', { user_id: user.USER_ID });
            } else {
                throw new BadRequestException('Invalid role');
            }

            const response: User = {
                id: user.USER_ID,
                name: user.NAME,        
                email: user.EMAIL,
                dob: user.DOB,
                role: user.ROLE
            }

            if(!response){
                throw new BadRequestException('User not created');
            }

            const token = await this.token(response);

            console.log("Token:", token);

            await connection.commit();
            
            return { message: 'Signup successful' ,
                user: response ,
                access_token: token
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async signin(dto: SigninDto): Promise<AuthResponseDto> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.execute('SELECT * FROM users WHERE email = :email', { email: dto.email }, OBJ);
            if (!result.rows || result.rows.length === 0) {
                throw new UnauthorizedException('Invalid Credentials');
            }
            const user: any = result.rows[0];
            if (!user) {
                throw new Error('User not found');
            }
            
            const matches = await bcrypt.compare(dto.password, user.PASSWORD);
            
            if (!matches) throw new UnauthorizedException("Invalid Credentials");

            const response: User = {
                id: user.USER_ID,
                name: user.NAME,        
                email: user.EMAIL,
                dob: user.DOB,
                role: user.ROLE
            }

            const token = await this.token(user);
            return {
                message: 'Signin successful',
                user: response,
                access_token: token
            }
        
        } catch (error) {
            throw error;
        }
    }

    token(user: any) {
        try{
            const token = jwt.sign(
                {
                    id: user.USER_ID, 
                    email: user.EMAIL, 
                    role: user.ROLE
                }, 
                process.env.JWT_SECRET, 
                {expiresIn: '7d'}
            )
            return token;
        }catch{
            throw new Error("Token not generated")
        }
    }
}
