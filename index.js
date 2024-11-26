const https = require('https');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

// Handler untuk API di Vercel
module.exports = async (req, res) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const id = urlParams.get('id');

    if (!id) {
        res.status(400).json({ error: 'ID parameter is required' });
        return;
    }

    const targetUrl = `https://poophd.vip/p0?id=${id}`;

    try {
        const response = await fetch(targetUrl);
        const html = await response.text();

        // Tambahkan log untuk melihat isi HTML
        console.log(html); 

        const dom = new JSDOM(html);
        const scriptTags = dom.window.document.querySelectorAll('script');

        let fetchUrl = '';
        let authorizationHeader = '';

        scriptTags.forEach(script => {
            const scriptContent = script.textContent;

            if (scriptContent.includes('fetch(')) {
                const fetchUrlMatch = scriptContent.match(/fetch\("([^"]+)"/);
                if (fetchUrlMatch && fetchUrlMatch[1]) {
                    fetchUrl = fetchUrlMatch[1];
                }

                const authMatch = scriptContent.match(/'Authorization':\s*'([^']+)'/);
                if (authMatch && authMatch[1]) {
                    authorizationHeader = authMatch[1];
                }
            }
        });

        if (!fetchUrl || !authorizationHeader) {
            return res.status(400).json({ error: 'Failed to extract fetch URL or Authorization header from script' });
        }

        const headers = {
            'Authorization': authorizationHeader,
            'Content-Type': 'application/json',
            'Origin': 'https://poophd.vip'
        };

        const directLinkResponse = await fetch(fetchUrl, {
            method: 'GET',
            headers: headers
        });

        const jsonResponse = await directLinkResponse.json();
        const directLink = jsonResponse.direct_link;

        res.status(200).json({ direct_link: directLink });
    } catch (error) {
        console.error('Error:', error);
        res.status (500).json({ error: 'An error occurred while fetching the direct link' });
    }
};
