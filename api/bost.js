const fetch = require('node-fetch');

function getRandomUsername() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let randomString = "";
    
    // Membuat 6 huruf acak
    for (let i = 0; i < 6; i++) {
        randomString += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    
    // Membuat angka 2 digit acak (10-99)
    const randomNumber = Math.floor(Math.random() * 90) + 10;
    
    return `${randomString}${randomNumber}`;
}

// Fungsi untuk membaca body request secara manual
async function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            // Membaca body request
            const { link } = await parseRequestBody(req);
            const username = getRandomUsername(); // Menghasilkan username secara acak dengan angka
            const email = `${username}@yahoo.com`;

            const payload = {
                instagram_username: username,
                link: link,
                email: email
            };

            const headers = {
                "content-type": "application/json",
                "accept": "application/json",
                "origin": "https://likesjet.com",
                "referer": "https://likesjet.com/",
            };

            // Request ke ScraperAPI
            const apiUrl = "https://api.scraperapi.com?api_key=fa084d28b09f1e6719a55c0eabbec3e2&url=https://api.likesjet.com/freeboost/7";
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error from API: ${response.statusText}`);
            }

            const result = await response.json();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
