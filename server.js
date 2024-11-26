const express = require('express');
const bodyParser = require('body-parser');
const PoopFile = require('./poopFile'); // Sesuaikan path dengan lokasi poopFile.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Route untuk handle POST request
app.post('/file', async (req, res) => {
    // Default response
    let result = {
        status: 'failed',
        message: 'invalid params',
        file: []
    };

    try {
        // Ambil URL dari body request
        const data = req.body;
        const url = data.url;

        if (url) {
            const PF = new PoopFile();

            // Proses URL untuk mendapatkan file
            await PF.getAllFile(url);
            const listFile = PF.file;

            // Kondisi respons
            if (listFile.length > 0) {
                result = {
                    status: 'success',
                    message: '',
                    file: listFile
                };
            } else {
                result = {
                    status: 'failed',
                    message: 'file not found',
                    file: []
                };
            }
        }
    } catch (error) {
        result = {
            status: 'failed',
            message: `I don't know why error in poop app: ${error.message}`,
            file: []
        };
    }

    // Kirim respons dalam format JSON
    res.json(result);
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
