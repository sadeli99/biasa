const fetch = require('node-fetch');

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

    const { email } = req.body;

    // Pastikan email ada di body
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // API URL dari Site24x7 untuk email validation
        const apiUrl = `https://www.site24x7.com/tools/email-validator?emails=${encodeURIComponent(email)}`;

        // Mengirimkan permintaan GET ke API dengan email di parameter
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        // Memeriksa status pada hasil response
        const emailResult = data.results && data.results['gmail.com'] && data.results['gmail.com'][email];
        
        if (emailResult) {
            // Jika status adalah 250, maka email valid
            if (emailResult.status === 250) {
                return res.status(200).json({
                    emailExists: true,
                    message: 'Email terdaftar dan valid!',
                });
            }

            // Jika status bukan 250, berarti email tidak valid
            return res.status(200).json({
                emailExists: false,
                message: 'Email tidak valid (akun tidak ada atau salah)',
            });
        }

        // Jika tidak ada data hasil yang sesuai
        return res.status(200).json({
            emailExists: false,
            message: 'Email tidak terdaftar atau tidak valid.',
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi email.' });
    }
};
