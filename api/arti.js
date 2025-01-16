const fetch = require('node-fetch'); // Mengimpor node-fetch untuk melakukan HTTP request
const FormData = require('form-data'); // Mengimpor FormData untuk membuat form-data

// Fungsi untuk mengirimkan data ke API dan mengambil hasil
async function translateText(q) {
    // Membuat form-data
    const form = new FormData();
    
    // Menambahkan data ke form-data
    form.append('q', q); // Kata yang akan diterjemahkan
    form.append('source', 'en'); // Bahasa sumber
    form.append('target', 'id'); // Bahasa target
    form.append('format', 'text'); // Format teks
    form.append('alternatives', '3'); // Jumlah alternatif
    form.append('api_key', ''); // API key jika ada
    form.append('secret', '1VG5UIE'); // Secret key

    // Mengirimkan request menggunakan fetch
    const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST', // Metode HTTP yang digunakan
        headers: {
            'Origin': 'https://libretranslate.com', // Origin yang sesuai
            'Referer': 'https://libretranslate.com/?source=en&target=id&q=Hi', // Referer untuk API
            'Accept': '*/*', // Accept header
        },
        body: form, // Body menggunakan form-data
    });

    // Menunggu respons dari API
    const data = await response.json(); // Mengubah respons menjadi JSON

    // Mengambil dan menampilkan bagian alternatives dan translatedText
    const alternatives = data.alternatives; 
    const translatedText = data.translatedText;

    // Membuat hasil dalam format JSON
    const result = {
        alternatives: alternatives,
        translatedText: translatedText
    };

    // Mengembalikan hasil sebagai JSON
    return result;
}

// API Handler untuk Vercel
module.exports = async (req, res) => {
    try {
        // Mengambil parameter q dari query string
        const { q } = req.query;

        // Memanggil fungsi untuk menerjemahkan
        const result = await translateText(q);

        // Mengirimkan respons dalam format JSON
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
