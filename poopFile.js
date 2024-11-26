const axios = require('axios');
const cheerio = require('cheerio');

const defaultDomain = 'poop.run';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
};

class PoopFile {
    constructor() {
        this.file = [];
        this.domain = defaultDomain;
        this.r = axios.create({ headers });
    }

    /**
     * Redirect URL untuk mendapatkan URL akhir setelah redirect.
     * @param {string} url 
     * @returns {string} Redirected URL
     */
    async redirect(url) {
        try {
            const response = await this.r.head(url, { maxRedirects: 0 });
            return response.request.res.responseUrl;
        } catch (error) {
            return error.response?.request?.res?.responseUrl || url;
        }
    }

    /**
     * Mengambil semua file dari URL.
     * @param {string} url 
     */
    async getAllFile(url) {
        if (url.includes('/e/')) {
            const id = url.replace('//', '/').split('/').pop().split('?')[0].toLowerCase();
            url = `https://${defaultDomain}/d/${id}`;
            await this.getAllFile(url);
            return;
        }

        const baseUrl = (await this.redirect(url)).split('?')[0];
        const req = await this.r.get(baseUrl);
        this.domain = new URL(req.request.res.responseUrl).hostname;

        const $ = cheerio.load(req.data);
        const typeUrl = req.request.res.responseUrl.split('/')[2].toLowerCase();

        if (typeUrl === 'f') {
            const listPage = [...new Set(this.getAllPage($))];
            for (const page of listPage) {
                try {
                    const pageReq = await this.r.get(page);
                    const page$ = cheerio.load(pageReq.data);
                    this.multiFile(page$);
                } catch {
                    continue;
                }
            }
        } else if (typeUrl === 'd') {
            await this.singleFile(req.request.res.responseUrl);
        } else if (typeUrl === 'top') {
            for (let i = 1; i <= 10; i++) {
                try {
                    const topReq = await this.r.get(`https://${this.domain}/top?p=${i}`);
                    const top$ = cheerio.load(topReq.data);
                    this.multiFile(top$);
                } catch {
                    continue;
                }
            }
        }
    }

    /**
     * Mendapatkan semua halaman dari link pagination.
     * @param {cheerio.Root} $ 
     * @returns {Array} Array of page URLs
     */
    getAllPage($) {
        return $('a.page-link').map((_, el) => `https://${this.domain}${$(el).attr('href')}`).get();
    }

    /**
     * Mengambil data file dari halaman multi-file.
     * @param {cheerio.Root} $ 
     */
    multiFile($) {
        const list = $('div:has(strong)').map((_, el) => {
            const id = $(el).find('a').attr('href').split('/').pop().split('?')[0];
            const name = $(el).find('strong').text().trim();
            const image = $(el).find('img').attr('src');
            return { domain: this.domain, id, name, image };
        }).get();

        this.file.push(...list);
    }

    /**
     * Mengambil data file tunggal dari URL.
     * @param {string} url 
     */
    async singleFile(url) {
        try {
            const req = await this.r.get(url);
            const $ = cheerio.load(req.data);
            const id = url.split('/').pop().split('?')[0];
            const name = $('h4').text().trim();
            const image = $('img').attr('src');
            const item = { domain: this.domain, id, name, image };
            this.file.push(item);
        } catch (error) {
            console.error(`Failed to fetch single file from ${url}:`, error.message);
        }
    }
}

module.exports = PoopFile;
