import { pool } from '../db/index.js'

export const getClients = async (req, res) => {
    const userId = req.user.id;
    try {
        const clients = await pool.query(
            'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(clients.rows);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const createClient = async (req, res) => {
    const client = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'INSERT INTO clients (name, email, phone, address, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [client.name, client.email, client.phone, client.address, userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const updateClient = async (req, res) => {
    const { id } = req.params;
    const client = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [client.name, client.email, client.phone, client.address, id, userId]
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
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json({ message: "Client deleted successfully" });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};