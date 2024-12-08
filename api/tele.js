const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  try {
    // Peluncuran Puppeteer tanpa sandbox
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const url = 'https://tv4.idlix.asia/episode/gangnam-b-side-season-1-episode-1/';

    // Navigasi ke halaman
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Tunggu dan klik elemen pertama
    await page.waitForSelector('.dooplay_player_option', { timeout: 10000 });
    const elems = await page.$$('.dooplay_player_option');
    if (elems.length > 1) {
      await elems[1].click();
    }

    // Tangkap log aktivitas jaringan
    const responseUrls = [];
    page.on('response', async (response) => {
      const requestUrl = response.url();
      if (requestUrl.includes('https://jeniusplay.com/player/index.php')) {
        responseUrls.push(requestUrl);
      }
    });

    await page.waitForTimeout(5000); // Tunggu 5 detik

    // Kirim hasil dalam format JSON
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
