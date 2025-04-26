import jwt from "jsonwebtoken"
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { pool } from '../db/index.js'

const SECRET = 'test';

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const existingUser = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { email: existingUser.email, id: existingUser.id },
            SECRET,
            { expiresIn: "1h" }
        );

        const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [existingUser.id]);
        const userProfile = profileResult.rows[0];

        res.status(200).json({ result: existingUser, userProfile, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const signup = async (req, res) => {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords don't match" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const name = `${firstName} ${lastName}`;

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        const token = jwt.sign(
            { email: result.rows[0].email, id: result.rows[0].id },
            SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ result: result.rows[0], token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expireToken = new Date(Date.now() + 3600000); // 1 hour

        await pool.query(
            'UPDATE users SET reset_token = $1, expire_token = $2 WHERE email = $3',
            [token, expireToken, email]
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'youremail@gmail.com',
            to: email,
            subject: 'Password Reset Link',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   ${process.env.CLIENT_URL}/reset-password/${token}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (error, response) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: "Error sending email" });
            }
            res.status(200).json({ message: 'Recovery email sent' });
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const resetPassword = async (req, res) => {
    const { password, token } = req.body;

    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1 AND expire_token > NOW()',
            [token]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, expire_token = NULL WHERE reset_token = $2',
            [hashedPassword, token]
        );

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
