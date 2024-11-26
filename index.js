const https = require('https');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

// Handler untuk API di Vercel
module.exports = async (req, res) => {
    // Mengambil query parameter 'id' dari URL
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const id = urlParams.get('id');

    if (!id) {
        // Jika id tidak ada, kirim error 400
        res.status(400).json({ error: 'ID parameter is required' });
        return;
    }

    const targetUrl = `https://poophd.vip/p0?id=${id}`;  // URL halaman yang akan diambil

    try {
        // Mengambil HTML dari URL target
        const response = await fetch(targetUrl);
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

            // Periksa apakah script berisi 'fetchDirectLink'
            if (scriptContent.includes('fetchDirectLink')) {
                // Ambil URL yang digunakan dalam fetch
                const fetchUrlStart = scriptContent.indexOf('fetch("') + 7; // Menambahkan 7 untuk melewati 'fetch("'
                const fetchUrlEnd = scriptContent.indexOf('"', fetchUrlStart);
                if (fetchUrlStart !== -1 && fetchUrlEnd !== -1) {
                    fetchUrl = scriptContent.slice(fetchUrlStart, fetchUrlEnd);  // Ambil URL hingga tanda petik
                }

                // Ambil Authorization header
                const authStart = scriptContent.indexOf("'Authorization':") + 17; // Menambahkan 17 untuk melewati 'Authorization': '
                const authEnd = scriptContent.indexOf("'", authStart);
                if (authStart !== -1 && authEnd !== -1) {
                    authorizationHeader = scriptContent.slice(authStart, authEnd);  // Ambil Authorization
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
        res.status(200).json({ direct_link: directLink });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching the direct link' });
    }
};
