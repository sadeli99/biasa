const https = require('https');

// API key ScraperAPI
const scraperApiKey = 'fa084d28b09f1e6719a55c0eabbec3e2';

// Daftar Accept-Language yang akan digunakan secara acak
const acceptLanguages = [
    "en-US,en;q=0.9",
    "fr-FR,fr;q=0.9",
    "de-DE,de;q=0.9",
    "es-ES,es;q=0.9",
    "ja-JP,ja;q=0.9",
    "it-IT,it;q=0.9"
];

// Fungsi untuk memilih Accept-Language secara acak
function getRandomAcceptLanguage() {
    const randomIndex = Math.floor(Math.random() * acceptLanguages.length);
    return acceptLanguages[randomIndex];
}

// Fungsi untuk memilih User-Agent secara acak
function getRandomUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0"
    ];
    
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
}

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
            "content-length": data.length.toString(),
            "content-type": "application/json",
            "accept": "application/json, text/plain, */*",
            "user-agent": getRandomUserAgent(), // Gunakan User-Agent acak
            "origin": "https://likesjet.com",
            "referer": "https://likesjet.com/",
            "accept-language": getRandomAcceptLanguage(), // Gunakan Accept-Language acak
        };

        // Membuat request ke ScraperAPI
        const options = {
            hostname: 'api.scraperapi.com',
            path: `?api_key=${scraperApiKey}&url=https://api.likesjet.com/freeboost/7`, // Path ScraperAPI
            method: 'GET',
            headers: headers
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

        // Kirimkan request
        request.end();
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
