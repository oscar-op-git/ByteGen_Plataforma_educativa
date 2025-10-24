import {Pool} from 'pg'

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'oscar',
    database: 'edumasterdos',
    port: 5432
})