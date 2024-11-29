const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const url = 'https://tv3.idlix.asia/episode/when-the-phone-rings-season-1-episode-1/'; // Ganti dengan URL target

  try {
    // Luncurkan Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Diperlukan untuk Vercel
    });
    const page = await browser.newPage();

    // Buka halaman target
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Tunggu dan cari URL yang sesuai
    const dataUrl = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href*="jeniusplay.com/player/index.php?data="]');
      return anchors.length > 0 ? anchors[0].href : null;
    });

    // Tutup browser
    await browser.close();

    // Jika URL ditemukan, kembalikan respons JSON
    if (dataUrl) {
      return res.status(200).json({
        success: true,
        message: 'Data successfully retrieved',
        data: dataUrl,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No matching data found',
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred',
      error: error.message,
    });
  }
};
