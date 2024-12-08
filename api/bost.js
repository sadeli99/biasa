const fetch = require('node-fetch');

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

// Fungsi untuk memilih nama secara acak dengan nomor 2 digit
function getRandomUsername() {
    const names = [
    "aulia", "budi", "citra", "dian", "eka", "fajar", 
    "gita", "hadi", "indra", "joko", "karin", "lina", 
    "maya", "nina", "okta", "putra", "qila", "rani", 
    "santi", "tina", "utami", "vira", "wawan", "xena", 
    "yana", "zaki", "bima", "cici", "didi", "eka", 
    "fina", "gilang", "hendra", "ivan", "joni", "kiki", 
    "lusi", "mira", "nando", "opik", "pandu", "qory", 
    "rina", "siska", "tomo", "umi", "vita", "wulan"
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNumber = Math.floor(Math.random() * 90) + 10; // Angka 2 digit (10-99)
    return `${randomName}${randomNumber}`;
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
            const email = `${username}${Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000}@yahoo.com`;

            const payload = {
                instagram_username: username,
                link: link,
                email: email
            };

            const headers = {
                "content-type": "application/json",
                "accept": "application/json",
                "user-agent": getRandomUserAgent(),
                "origin": "https://likesjet.com",
                "referer": "https://likesjet.com/",
            };

            // Request ke ScraperAPI
            const apiUrl = "https://api.likesjet.com/freeboost/7";
            
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
