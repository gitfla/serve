import {Kysely, MysqlDialect} from 'kysely';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config({ path: './vars/.env'});

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
} = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Missing DB environment variables');
}

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

const db = new Kysely({
    dialect: new MysqlDialect({ pool }),
});

module.exports = db;