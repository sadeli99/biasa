const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api', async (req, res) => {
    const id = req.query.id;  // Ambil parameter 'id' dari URL
    if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
    }

    const url = `https://poophd.vip/p0?id=${id}`;  // URL untuk mengambil halaman

    try {
        // Ambil HTML dari URL
        const response = await fetch(url);
        const html = await response.text();

        // Parse HTML menggunakan jsdom
        const dom = new JSDOM(html);

        // Cari seluruh tag script di dalam halaman
        const scriptTags = dom.window.document.querySelectorAll('script');

        let fetchUrl = '';
        let authorizationHeader = '';

        // Loop untuk mencari bagian fetch URL dan Authorization
        scriptTags.forEach(script => {
            const scriptContent = script.textContent;

            // Periksa apakah script berisi 'fetch' dan 'Authorization'
            if (scriptContent.includes('fetch(') && scriptContent.includes('Authorization')) {
                // Ambil URL yang digunakan dalam fetch
                const fetchUrlStart = scriptContent.indexOf('https://');
                if (fetchUrlStart !== -1) {
                    fetchUrl = scriptContent.slice(fetchUrlStart, scriptContent.indexOf('"', fetchUrlStart));  // Ambil URL hingga tanda petik
                }

                // Ambil Authorization header
                const authStart = scriptContent.indexOf("'Authorization':");
                if (authStart !== -1) {
                    authorizationHeader = scriptContent.slice(authStart + 17, scriptContent.indexOf("'", authStart + 17));  // Ambil Authorization
                }
            }
        });

        // Pastikan URL dan Authorization ditemukan
        if (!fetchUrl || !authorizationHeader) {
            return res.status(400).json({ error: 'Failed to extract fetch URL or Authorization header from script' });
        }

        // Menambahkan header 'Origin' dengan nilai 'https://poophd.vip'
        const headers = {
            'Authorization': authorizationHeader,
            'Content-Type': 'application/json',
            'Origin': 'https://poophd.vip'  // Menambahkan Origin header
        };

        // Ambil direct link menggunakan fetch dengan URL dan Authorization yang ditemukan
        const directLinkResponse = await fetch(fetchUrl, {
            method: 'GET',
            headers: headers  // Sertakan header Origin
        });

        const jsonResponse = await directLinkResponse.json();
        const directLink = jsonResponse.direct_link;  // Ambil direct link dari respons JSON

        // Kirimkan direct link sebagai respons API
        return res.json({ direct_link: directLink });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while fetching the direct link' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
