const axios = require('axios');
const cheerio = require('cheerio');

const defaultDomain = 'poop.run';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
};

class PoopFile {
    constructor() {
        this.file = [];
        this.r = require('axios').create({ headers });
    }

    async redirect(url) {
        try {
            const response = await this.r.head(url, { maxRedirects: 0 }).catch(err => err.response);
            return response?.request?.res?.responseUrl || null;
        } catch (error) {
            console.error('Error in redirect:', error.message);
            throw new Error('Failed to redirect URL');
        }
    }

    async getAllFile(url) {
        if (!url) {
            throw new Error('URL is required');
        }

        try {
            if (url.includes('/e/')) {
                const id = url.replace('//', '/').split('/').pop().split('?')[0].toLowerCase();
                url = `https://${defaultDomain}/d/${id}`;
                await this.getAllFile(url);
                return;
            }

            const redirectedUrl = await this.redirect(url);
            if (!redirectedUrl) {
                throw new Error('Failed to resolve redirected URL');
            }

            const baseUrl = redirectedUrl.split('?')[0];
            const req = await this.r.get(baseUrl);
            this.domain = new URL(req.request.res.responseUrl).hostname;

            const cheerio = require('cheerio');
            const $ = cheerio.load(req.data);
            const typeUrl = req.request.res.responseUrl.split('/')[2]?.toLowerCase();

            if (typeUrl === 'f') {
                const listPage = [...new Set(this.getAllPage($))];
                for (const page of listPage) {
                    try {
                        const pageReq = await this.r.get(page);
                        const page$ = cheerio.load(pageReq.data);
                        this.multiFile(page$);
                    } catch (error) {
                        console.error('Error processing page:', error.message);
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
                    } catch (error) {
                        console.error('Error processing top page:', error.message);
                        continue;
                    }
                }
            }
        } catch (error) {
            console.error('Error in getAllFile:', error.message);
            throw error;
        }
    }

    getAllPage($) {
        return $('a.page-link')
            .map((_, el) => `https://${this.domain}${$(el).attr('href')}`)
            .get();
    }

    multiFile($) {
        const list = $('div:has(strong)')
            .map((_, el) => {
                const id = $(el).find('a').attr('href')?.split('/').pop()?.split('?')[0];
                const name = $(el).find('strong').text().trim();
                const image = $(el).find('img').attr('src');
                if (id && name && image) {
                    return { domain: this.domain, id, name, image };
                }
                return null;
            })
            .get()
            .filter(Boolean); // Remove null entries

        this.file.push(...list);
    }

    async singleFile(url) {
        try {
            const req = await this.r.get(url);
            const cheerio = require('cheerio');
            const $ = cheerio.load(req.data);
            const id = url.split('/').pop()?.split('?')[0];
            const name = $('h4').text().trim();
            const image = $('img').attr('src');
            if (id && name && image) {
                const item = { domain: this.domain, id, name, image };
                this.file.push(item);
            }
        } catch (error) {
            console.error('Error in singleFile:', error.message);
        }
    }
}

module.exports = PoopFile;
