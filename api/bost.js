const https = require('https');

// API key ScraperAPI
const scraperApiKey = 'fa084d28b09f1e6719a55c0eabbec3e2';

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

    // Menangani permintaan POST
    if (req.method === 'POST') {
        // Mendapatkan data dari request body
        const { username, link } = req.body;
        const email = `whisper${Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000}@gmail.com`;

        const data = JSON.stringify({
            instagram_username: username,
            link: link,
            email: email
        });

        const headers = {
            "Host": "api.likesjet.com",
            "content-length": data.length.toString(),
            "content-type": "application/json",
            "accept": "application/json, text/plain, */*",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
            "origin": "https://likesjet.com",
            "referer": "https://likesjet.com/",
            "accept-language": "en-US,en;q=0.9"
        };

        // Membuat request ke ScraperAPI
        const options = {
            hostname: 'api.scraperapi.com',
            port: 443,
            path: `/`, // Path ScraperAPI
            method: 'POST',
            headers: {
                ...headers,
                "api_key": scraperApiKey,
                "url": 'https://api.likesjet.com/freeboost/7'
            }
        };

        const request = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                // Mengirimkan respons JSON ke client
                res.status(200).json(JSON.parse(data));
            });
        });

        request.on('error', (error) => {
            res.status(500).json({ error: error.message });
        });

        // Kirimkan data request
        request.write(data);
        request.end();
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
