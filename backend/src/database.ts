import {Pool} from 'pg'

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'oscar',
    database: 'edumaster',
    port: 5432
})