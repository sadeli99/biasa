const puppeteer = require('puppeteer');

async function getVideoUrl() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://tv4.idlix.asia/episode/gangnam-b-side-season-1-episode-1/', {
    waitUntil: 'networkidle2',
  });

  // Tunggu elemen .dooplay_player_option tersedia
  await page.waitForSelector('.dooplay_player_option');

  // Klik elemen kedua jika ada
  const elems = await page.$$('.dooplay_player_option');
  if (elems.length > 1) {
    await elems[1].click();
  }

  // Tunggu beberapa detik agar halaman diperbarui
  await page.waitForTimeout(5000);

  // Ambil URL video setelah klik
  const videoUrl = await page.evaluate(() => {
    const videoElement = document.querySelector('video');
    return videoElement ? videoElement.src : null;
  });

  console.log('URL Video:', videoUrl);

  await browser.close();
}

getVideoUrl().catch(console.error);
