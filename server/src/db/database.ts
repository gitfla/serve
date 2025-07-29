import {Kysely, PostgresDialect} from 'kysely';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { DB } from './dbtypes';

dotenv.config({ path: './vars/.env'});

const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
} = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Missing DB environment variables');
}

const pool = new Pool({
    host: DB_HOST,
    port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});


const db = new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
});

export default db;