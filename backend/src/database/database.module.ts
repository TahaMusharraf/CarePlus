import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as oracledb from 'oracledb';

export const DB_POOL = 'DB_POOL';

@Global()
@Module({
  providers: [
    {
      provide: DB_POOL,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const pool = await oracledb.createPool({
          user: config.get('ORACLE_USER'),
          password: config.get('ORACLE_PASSWORD'),
          connectString: config.get('ORACLE_CONNECTION_STRING'),
          poolMin: 2,
          poolMax: 10,
          poolIncrement: 1,
        });
        Logger.log('Database connection pool created successfully');
        return pool;
      },
    },
  ],
  exports: [DB_POOL],
})
export class DatabaseModule {}