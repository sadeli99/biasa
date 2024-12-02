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
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // API URL dari Site24x7 untuk email validation
        const apiUrl = `https://www.site24x7.com/tools/email-validator?emails=${email}`;
        
        // Mengirimkan permintaan GET ke API dengan node-fetch
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Memeriksa apakah reason-nya berisi 'OK'
        const emailResult = data.results && data.results[gmail.com] && data.results[gmail.com][email];
        
        if (emailResult && emailResult.reason.includes('OK')) {
            return res.status(200).json({ emailExists: true, message: 'Email terdaftar dan valid!' });
        } else {
            return res.status(200).json({ emailExists: false, message: 'Email tidak terdaftar atau tidak valid.' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi email.' });
    }
};
