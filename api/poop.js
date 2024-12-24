const https = require('https');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

// Handler untuk API di Vercel
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

    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const id = urlParams.get('id');

    if (!id) {
        res.status(400).json({ error: 'ID parameter is required' });
        return;
    }

    const targetUrl = `https://poo.phd/p0?id=${id}`;
    const targetUrl2 = `https://poo.phd/d/${id}`;

    try {
        const response = await fetch(targetUrl);
        const html = await response.text();

        // Fetch data dari targetUrl2
        const response2 = await fetch(targetUrl2);
        const html2 = await response2.text();
        // Proses HTML dari targetUrl2 dengan JSDOM
        const dom2 = new JSDOM(html2);
        const doc2 = dom2.window.document;

        // Ambil elemen dari targetUrl2
        const name = doc2.querySelector('h4') ? doc2.querySelector('h4').textContent.trim() : 'n/a';
        const duration = doc2.querySelector('.length') ? doc2.querySelector('.length').textContent.trim() : 'n/a';
        const size = doc2.querySelector('.size') ? doc2.querySelector('.size').textContent.trim() : 'n/a';
        const vdate = doc2.querySelector('.uploadate') ? doc2.querySelector('.uploadate').textContent.trim() : 'n/a';

        // Tambahkan log untuk melihat isi HTML
        console.log('HTML dari targetUrl:', html);

        const dom = new JSDOM(html);
        const scriptTags = dom.window.document.querySelectorAll('script');

        let fetchUrl = '';
        let authorizationHeader = '';
        let imageUrl = '';  // Menyimpan URL gambar

        // Regex untuk mencari URL gambar setelah 'image:'
        const imageRegex = /image:\s*["']([^"']+)["']/;

        scriptTags.forEach(script => {
            const scriptContent = script.textContent;

            if (scriptContent.includes('fetch(')) {
                const fetchUrlMatch = scriptContent.match(/fetch\("([^"]+)"/);
                if (fetchUrlMatch && fetchUrlMatch[1]) {
                    fetchUrl = fetchUrlMatch[1];
                }

                const authMatch = scriptContent.match(/'Authorization':\s*'Bearer\s+([^']+)'/);
                if (authMatch && authMatch[1]) {
                    authorizationHeader = `Bearer ${authMatch[1]}`;
                }
            }

            const imageMatch = scriptContent.match(imageRegex);
            if (imageMatch && imageMatch[1]) {
                imageUrl = imageMatch[1];  // Menyimpan URL gambar yang ditemukan
            }
        });

        // Tambahkan log untuk debugging
        console.log('Extracted fetch URL:', fetchUrl);
        console.log('Extracted authorization header:', authorizationHeader);
        console.log('Extracted image URL:', imageUrl);

        if (!fetchUrl || !authorizationHeader) {
            res.status(400).json({ error: 'Failed to extract fetch URL or Authorization header from script' });
            return;
        }

        const headers = {
            'Authorization': authorizationHeader,
            'Content-Type': 'application/json',
            'Origin': 'https://poo.phd'
        };

        const directLinkResponse = await fetch(fetchUrl, {
            method: 'GET',
            headers: headers
        });

        if (!directLinkResponse.ok) {
            throw new Error('Failed to fetch direct link');
        }

        const jsonResponse = await directLinkResponse.json();
        const directLink = jsonResponse.direct_link;

        res.status(200).json({ direct_link: directLink, image: imageUrl, name: name, duration: duration, size: size, videodate: vdate });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching the direct link' });
    }
};
