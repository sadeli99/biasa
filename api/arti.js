const fetch = require('node-fetch'); // Mengimpor node-fetch untuk HTTP request
const FormData = require('form-data'); // Mengimpor FormData untuk membuat form-data

// Fungsi untuk memuat data dari API 2short
async function fetch2ShortData(videoId) {
    const url = `https://api.2short.ai/shorts?youtubeVideoId=${videoId}&language=id`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json', // Header Content-Type
        },
    });

    if (!response.ok) {
        throw new Error('Gagal memuat data dari API 2short.');
    }
    return await response.json();
}

// Fungsi untuk menerjemahkan teks menggunakan API LibreTranslate
async function translateText(text) {
    const form = new FormData();
    form.append('q', text); // Kata yang akan diterjemahkan
    form.append('source', 'id'); // Bahasa sumber
    form.append('target', 'en'); // Bahasa target
    form.append('format', 'text'); // Format teks

    const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: { Accept: '*/*' },
        body: form,
    });

    if (!response.ok) {
        throw new Error('Gagal menerjemahkan teks.');
    }

    const data = await response.json();
    return data.translatedText;
}

// Fungsi utama untuk menggabungkan kedua API
module.exports = async (req, res) => {
    try {
        const { videoId } = req.query; // Mendapatkan videoId dari query parameter

        if (!videoId) {
            return res.status(400).json({ error: 'Parameter videoId diperlukan.' });
        }

        // Memuat data dari API 2short
        const data = await fetch2ShortData(videoId);

        // Menerjemahkan setiap title di dalam shorts
        const translatedShorts = await Promise.all(
            data.shorts.map(async (short) => {
                const translatedTitle = await translateText(short.title);
                return {
                    ...short,
                    title: translatedTitle, // Mengganti title dengan hasil terjemahan
                };
            })
        );

        // Mengembalikan data lengkap dengan title yang diterjemahkan
        res.status(200).json({
            ...data,
            shorts: translatedShorts, // Menggunakan shorts dengan title yang telah diterjemahkan
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
