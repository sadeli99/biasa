const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Menjalankan browser di background
      args: ['--disable-dev-shm-usage'], // Tambahkan argumen untuk mengatasi masalah memori di server
    });

    const page = await browser.newPage();
    const url = 'https://tv4.idlix.asia/episode/gangnam-b-side-season-1-episode-1/';
    
    // Akses halaman
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Tunggu hingga elemen tertentu muncul
    await page.waitForSelector('.dooplay_player_option', { timeout: 10000 });

    // Klik elemen kedua jika ada
    const elems = await page.$$('.dooplay_player_option');
    if (elems.length > 1) {
      await elems[1].click();
    }

    // Tangkap URL yang diminta
    const responseUrls = [];
    page.on('response', async (response) => {
      const requestUrl = response.url();
      if (requestUrl.includes('https://jeniusplay.com/player/index.php')) {
        responseUrls.push(requestUrl);
      }
    });

    // Tunggu beberapa detik untuk menangkap data
    await page.waitForTimeout(5000);

    // Kirim hasil dalam format JSON
    res.status(200).json({
      message: 'Data successfully scraped',
      urls: responseUrls,
      total: responseUrls.length
    });

    // Tutup browser
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error occurred', error: err.message });
  }
};
