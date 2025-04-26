import { pool } from '../db/index.js'

export const getProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const profile = await pool.query(
            'SELECT * FROM profiles WHERE user_id = $1',
            [userId]
        );
        res.status(200).json(profile.rows[0]);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const createProfile = async (req, res) => {
    const userId = req.user.id;
    const {
        name,
        email,
        phoneNumber,
        businessName,
        contactAddress,
        logo,
        website
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO profiles (
                name, email, phone_number, business_name,
                contact_address, logo, website, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, email, phoneNumber, businessName, contactAddress, logo, website, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const {
        name,
        email,
        phoneNumber,
        businessName,
        contactAddress,
        logo,
        website
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE profiles SET 
                name = $1, email = $2, phone_number = $3,
                business_name = $4, contact_address = $5,
                logo = $6, website = $7
            WHERE user_id = $8 RETURNING *`,
            [name, email, phoneNumber, businessName, contactAddress, logo, website, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};