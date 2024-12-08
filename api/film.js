const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  try {
    // Meluncurkan browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const url = 'https://tv4.idlix.asia/episode/gangnam-b-side-season-1-episode-1/';
    
    // Akses halaman
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Tunggu elemen dengan class .dooplay_player_option
    await page.waitForSelector('.dooplay_player_option', { timeout: 10000 });

    // Klik elemen kedua (index 1)
    const elems = await page.$$('.dooplay_player_option');
    if (elems.length > 1) {
      await elems[1].click();
    }

    // Tangkap URL atau informasi lainnya
    const responseUrls = [];
    page.on('response', async (response) => {
      const requestUrl = response.url();
      if (requestUrl.includes('https://jeniusplay.com/player/index.php')) {
        responseUrls.push(requestUrl);
      }
    });

    // Tunggu beberapa detik untuk menangkap URL
    await page.waitForTimeout(5000);

    // Kirimkan respons JSON
    res.status(200).json({
      message: 'Data successfully scraped',
      urls: responseUrls,
      total: responseUrls.length
    });

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error occurred', error: err.message });
  }
};
