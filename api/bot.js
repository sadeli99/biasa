const fetch = require('node-fetch');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Token Bot Telegram
const botToken = '7497515106:AAFZNdMS1F7hfXWNUhEk8MO4CuLHYk7-Lao';
const telegramApiUrl = `https://api.telegram.org/bot${botToken}/`;

// Middleware untuk menangani JSON body
app.use(bodyParser.json());

// Fungsi untuk mengirim pesan ke pengguna Telegram
async function sendMessage(chatId, message) {
    const url = `${telegramApiUrl}sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
    await fetch(url);
}

// Fungsi untuk menangani perintah /link
async function handleLinkCommand(chatId) {
    const message = "Silakan masukkan URL foto atau Reels Instagram Anda:";
    await sendMessage(chatId, message);
}

// Fungsi untuk menangani update dari Telegram
async function handleUpdate(update) {
    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const userMessage = update.message.text.trim();

        if (userMessage === '/link') {
            // Kirimkan pesan untuk meminta link Instagram
            await handleLinkCommand(chatId);
        } else if (userMessage.startsWith("http") || userMessage.includes("instagram.com")) {
            // Kirimkan notifikasi proses
            await sendMessage(chatId, 'Processing...');

            const data = { link: userMessage };

            try {
                // Melakukan request ke server boost API
                const response = await fetch('https://biasa-alpha.vercel.app/api/bost', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                // Handle pesan berdasarkan kondisi JSON
                let userMessage = '';
                if (result.message) {
                    if (result.message.includes("You can only receive likes once per day.")) {
                        userMessage = "Kamu hanya bisa submit 1 kali sehari untuk satu foto target.";
                    } else if (result.message.includes("Success! You will receive likes within next few minutes.")) {
                        userMessage = "Sukses! Anda akan menerima likes dalam beberapa menit ke depan.";
                    } else {
                        userMessage = result.message; // Gunakan pesan asli jika tidak ada kecocokan
                    }
                    await sendMessage(chatId, userMessage);
                }
            } catch (error) {
                let errorMessage = '';
                if (error.message.includes("Unexpected token")) {
                    errorMessage = "Harap coba lagi nanti.";
                } else {
                    errorMessage = `Failed to boost: ${error.message}`;
                }

                await sendMessage(chatId, errorMessage);
            }
        } else {
            await sendMessage(chatId, "Silakan kirimkan link Instagram yang valid.");
        }
    }
}

// Fungsi untuk mengatur webhook Telegram
async function setWebhook() {
    const url = `https://biasa-alpha.vercel.app/api/bot`; // Ganti dengan URL endpoint webhook Anda di Vercel
    try {
        const response = await fetch(`${telegramApiUrl}setWebhook?url=${url}`);
        const result = await response.json();
        if (result.ok) {
            console.log(`Webhook set to: ${url}`);
        } else {
            console.log('Webhook setup failed:', result.description);
        }
    } catch (error) {
        console.error('Failed to set webhook:', error);
    }
}

// Menyediakan endpoint untuk menerima update dari Telegram
app.post('/api/bot', async (req, res) => {
    const update = req.body;
    await handleUpdate(update);
    res.status(200).send();
});

// Fungsi utama untuk menjalankan webhook
async function start() {
    // Set webhook untuk bot
    await setWebhook();
    console.log('Webhook telah diatur.');
}

// Menjalankan aplikasi tanpa menggunakan port
start();

// Export app untuk digunakan di lingkungan lain jika diperlukan
module.exports = app;
