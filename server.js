const express = require('express');
const PoopFile = require('./poopFile');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    res.send('Welcome to PoopFile API!');
});

app.get('/files', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send({ error: 'URL parameter is required' });

    const poopFile = new PoopFile();
    try {
        await poopFile.getAllFile(url);
        res.status(200).send(poopFile.file);
    } catch (error) {
        res.status(500).send({ error: 'Failed to process the URL', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
