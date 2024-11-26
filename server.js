const express = require('express');
const bodyParser = require('body-parser');
const PoopFile = require('./poopFile'); // Pastikan file PoopFile.js berada di direktori yang sama

const app = express();
const port = 3000;

// Middleware untuk meng-parse body request ke format JSON
app.use(bodyParser.json());

// Endpoint untuk menerima URL dan domain
app.post('/files', async (req, res) => {
    const { url, domain } = req.body;  // Ambil URL dan domain dari request body

    if (!url || !domain) {
        return res.status(400).json({
            status: 'failed',
            message: 'URL dan domain diperlukan',
            file: []
        });
    }

    try {
        // Inisialisasi objek PoopFile dan panggil metode getAllFile
        const poopFile = new PoopFile();
        await poopFile.getAllFile(url, domain);  // Kirim URL dan domain yang diterima dari request body

        // Mengembalikan hasil file yang ditemukan
        return res.json({
            status: 'success',
            message: '',
            file: poopFile.file
        });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            status: 'failed',
            message: `Terjadi kesalahan: ${error.message}`,
            file: []
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
