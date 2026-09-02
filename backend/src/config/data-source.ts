import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * Standalone DataSource used by the TypeORM CLI (migration generate/run/revert).
 * The Nest runtime builds its own connection in `app.module.ts`.
 */
export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
