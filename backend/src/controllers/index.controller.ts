import {type Request, type Response} from 'express'
import type {QueryResult} from 'pg'

import {pool} from '../database.js'

export const getUsers = async (req: Request, res: Response): Promise<Response> =>{
    try{
        const response:QueryResult = await pool.query('SELECT * FROM usuario');
        return res.status(200).json(response.rows)
    }
    catch(e){
        console.log(e)
        return res.status(500).json('Internal server error')
    }
}


export const getUsersbyID = async (req: Request, res: Response): Promise<Response> =>{
    const id:number = parseInt(req.params.id!)
    const response: QueryResult = await pool.query('SELECT * FROM usuario where id_usuario = $1',[id]);
    return res.json(response.rows)
}

export const createUser = async (req: Request, res: Response): Promise<Response> =>{
    const {nombre, email} = req.body;
    const response: QueryResult = await pool.query('INSERT INTO usuario (nombre, email) VALUES ($1, $2)', [nombre,email])
    return res.json({
        message: 'Usuarios creado exitosamente', 
        body:{
            user:{
                nombre,
                email
            }
        }
    })

}

export const UpdateUser = async (req: Request, res: Response): Promise<Response> =>{
    const id = parseInt(req.params.id!)
    const { nombre, email} = req.body;
    await pool.query('UPDATE usuario SET nombre = $1, email = $2 WHERE id = $3', [nombre,email,id]);
    return res.json(`Usuarios con el ${id} actualizado con exito`)
}
export const deleteUser = async (req: Request, res: Response): Promise<Response> =>{
    const id:number = parseInt(req.params.id!)
    await pool.query('DELETE FROM usuario WHERE id = $1', [id]);
    return res.json(`Usuario ${id} eliminado correctamente`)    
}