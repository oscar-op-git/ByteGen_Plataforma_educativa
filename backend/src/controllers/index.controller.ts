import {type Request, type Response} from 'express'
import type {QueryResult} from 'pg'

import {pool} from '../database.js'

export const getUsers = async (req: Request, res: Response) =>{
    const response:QueryResult = await pool.query('SELECT * FROM usuario');
    console.log(response.rows)
    res.send('users')
}