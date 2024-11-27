const https = require('https');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

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

    // URL sumber data dari parameter
    const sourceURL = req.query.url; // Ambil URL dari query parameter `url`
    if (!sourceURL) {
        res.status(400).json({ error: 'Parameter `url` is required.' });
        return;
    }

    // Fungsi untuk mengambil HTML dari URL
    async function fetchHTML(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`Fetch error: ${error.message}`);
        }
    }

    try {
        const html = await fetchHTML(sourceURL);
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Ambil semua elemen dengan class "col-sm col-md-6 col-lg-4"
        const elements = document.querySelectorAll('.col-sm.col-md-6.col-lg-4');
        let results = [];

        elements.forEach((element) => {
            // Ambil elemen <a> dengan class "title_video"
            const linkElement = element.querySelector('a.title_video');
            if (linkElement) {
                let url = linkElement.getAttribute('href');

                // Hapus parameter ?top=1 dari URL
                url = url.replace(/\?top=1/, '');

                // Hapus bagian /e/, /f/, atau /d/ dari URL
                url = url.replace(/\/[dfe]\//, '/');

                // Ambil teks dari elemen
                const text = linkElement.textContent.trim();
                results.push(`${text} - ${url}`);
            }
        });

        // Gabungkan hasil menjadi teks, pisahkan dengan koma
        const output = results.join(', ');

        // Kirim hasil sebagai respons
        res.status(200).json({ result: output });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
