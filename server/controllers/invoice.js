import { pool } from '../db/index.js'

export const getInvoices = async (req, res) => {
    const userId = req.user.id;
    try {
        const invoices = await pool.query(
            'SELECT * FROM invoices WHERE creator = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(invoices.rows);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const createInvoice = async (req, res) => {
    const invoice = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `INSERT INTO invoices (
                due_date, currency, items, rates, vat, total, 
                sub_total, notes, status, invoice_number, 
                type, creator, total_amount_received, client, 
                payment_records
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [
                invoice.dueDate,
                invoice.currency,
                JSON.stringify(invoice.items),
                invoice.rates,
                invoice.vat,
                invoice.total,
                invoice.subTotal,
                invoice.notes,
                invoice.status,
                invoice.invoiceNumber,
                invoice.type,
                userId,
                invoice.totalAmountReceived,
                JSON.stringify(invoice.client),
                JSON.stringify(invoice.paymentRecords)
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    const { id } = req.params;
    const invoice = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE invoices SET 
                due_date = $1, currency = $2, items = $3, rates = $4,
                vat = $5, total = $6, sub_total = $7, notes = $8,
                status = $9, invoice_number = $10, type = $11,
                total_amount_received = $12, client = $13, payment_records = $14
            WHERE id = $15 AND creator = $16 RETURNING *`,
            [
                invoice.dueDate,
                invoice.currency,
                JSON.stringify(invoice.items),
                invoice.rates,
                invoice.vat,
                invoice.total,
                invoice.subTotal,
                invoice.notes,
                invoice.status,
                invoice.invoiceNumber,
                invoice.type,
                invoice.totalAmountReceived,
                JSON.stringify(invoice.client),
                JSON.stringify(invoice.paymentRecords),
                id,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'DELETE FROM invoices WHERE id = $1 AND creator = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};