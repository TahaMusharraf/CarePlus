import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_POOL } from '../database/database.module';
import * as oracledb from 'oracledb';
import { createDepartmentDto, Department, updateDepartmentDto } from './dto/departments.dto';
import { OBJ } from '../database/db.helper';

@Injectable()
export class DepartmentsService {
	constructor(@Inject(DB_POOL) private readonly pool: oracledb.Pool) {}
	
	async createDepartment(dto: createDepartmentDto): Promise<{message: string, department: Department}> {
		const connection = await this.pool.getConnection();
		try { 
			const exist = await connection.execute(
				'SELECT * FROM departments WHERE LOWER(name) = LOWER(:name)',
				{ name: dto.name }
			);

			if (exist.rows && exist.rows.length > 0) {
			throw new ConflictException('Department already exists');
			}

			await connection.execute('INSERT INTO departments (name) VALUES (:name)', { name: dto.name });
			
			const result = await connection.execute('SELECT * FROM departments WHERE name = :name', { name: dto.name }, OBJ);
			
			if(! result.rows || result.rows.length === 0) {
				throw new BadRequestException('Failed to create department');
			} 

			const department: any =  result.rows[0];
			
			await connection.commit();
			
			return { 
				message: 'Department created successfully', 
				department: {
					id: department.DEPT_ID,
					name: department.NAME
				}
			} ;
		} catch (error) {    
			throw error;
		} finally {
			connection.release();
		}
	}

	async getAllDepartments(): Promise<{ message: string; departments: Department[] }> {
		const connection = await this.pool.getConnection();
		try {
			const result = await connection.execute('SELECT * FROM departments', {}, OBJ);

			if(!result.rows || result.rows.length === 0) {
				return {
					message: 'No deparments found',
					departments: []
				}
			}

			return { 
				message: 'Departments retrieved successfully',
				departments: result.rows.map((department: any) => ({
					id: department.DEPT_ID,
					name: department.NAME
				}))
			};

		} catch(error){
			throw error;
		} finally {
			connection.release();
		}
	}

	async getDepartmentById(id: number): Promise<{ message: string; department: Department }> {
		const connection = await this.pool.getConnection();
		try {
			const result = await connection.execute('SELECT * FROM departments WHERE dept_Id = :id', { id }, OBJ);
			if (!result.rows || result.rows.length === 0) {
				throw new NotFoundException('Department not found');
			}
			const department: any = result.rows[0];
			await connection.commit();
			return {
				message: 'Department retrieved successfully',
				department: {
					id: department.DEPT_ID,
					name: department.NAME
				}
			};
		} catch(error){
			throw error;
		} finally {
			connection.release();
		}
	}

	async updateDepartment(departmentId: number, dto: updateDepartmentDto): Promise<{ message: string; departments: Department }> {
		const connection = await this.pool.getConnection();
		try{
			const result = await connection.execute('UPDATE departments SET name = :name WHERE dept_Id = :id', { name: dto.name, departmentId });
			if(result.rowsAffected === 0) {
				throw new NotFoundException(`Failed to update department ${departmentId}`);
			}

			const updatedDept = await connection.execute('SELECT * FROM departments WHERE dept_Id = :departmentId', { departmentId }, OBJ);
			if(!updatedDept.rows) {
				throw new NotFoundException(`Failed to retrieve updated department ${departmentId}`);
			};
			
			const response: any = updatedDept.rows[0]
			await connection.commit();
			return { 
				message: 'Departments updated successfully', 
				departments: {
					id: response.DEPT_ID,
					name: response.NAME
				} 
			};
		} catch(error){
			throw error;
		} finally {
			connection.release();
		}
	}

	async deleteDeparments(ids: number[]): Promise<{ message: string }> {
		const connection = await this.pool.getConnection();
		try {
			for(const id of ids){
				const result = await connection.execute('DELETE FROM departments WHERE dept_Id = :id', { id });
				if(!result.rowsAffected || result.rowsAffected === 0) {
					throw new NotFoundException(`Failed to delete department ${id}`);
				}
			}
			await connection.commit();
			return { message: 'Departments deleted successfully' };
		} catch(error){
			throw error;
		} finally {
			connection.release();
		}
	}

	async deleteAllDepartments(): Promise<{ message: string }> {
		const connection = await this.pool.getConnection();
		try {
			const result = await connection.execute('TRUNCATE TABLE departments');

			if (!result) {
				throw new BadRequestException('Failed to delete all departments');
			}
			await connection.commit();
			return { message: 'All departments deleted successfully' };
		} catch(error){
			throw error;
		} finally {
			connection.release();
		}
	}
}
	