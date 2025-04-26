import express from 'express'
import mongoose from 'mongoose'

import ClientModel from '../models/ClientModel.js'


// export const getClients = async (req, res) => {
//     const userId = req.body

//     try {
//         const allClients = await ClientModel.find({userId: userId}).sort({_id:-1}) 
//         //find({}).sort({_id:-1}) to sort according to date of creation

//         res.status(200).json(allClients)

//     } catch (error) {
//         res.status(409).json(error.message)
        
//     }
    
// }


import { pool } from '../db/index.js'

export const getClient = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        if (client.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.status(200).json(client.rows[0]);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getClients = async (req, res) => {
    const { page } = req.query;
    try {
        const LIMIT = 8;
        const offset = (Number(page) - 1) * LIMIT;
        
        const total = await pool.query('SELECT COUNT(*) FROM clients');
        const clients = await pool.query(
            'SELECT * FROM clients ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [LIMIT, offset]
        );

        res.json({
            data: clients.rows,
            currentPage: Number(page),
            numberOfPages: Math.ceil(total.rows[0].count / LIMIT)
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const createClient = async (req, res) => {
    const client = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clients (name, email, phone, address, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [client.name, client.email, client.phone, client.address, client.userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const updateClient = async (req, res) => {
    const { id } = req.params;
    const client = req.body;
    try {
        const result = await pool.query(
            'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *',
            [client.name, client.email, client.phone, client.address, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.json({ message: "Client deleted successfully" });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const getClientsByUser = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const clients = await pool.query(
            'SELECT * FROM clients WHERE user_id = $1',
            [searchQuery]
        );
        res.json({ data: clients.rows });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

