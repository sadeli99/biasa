const fetch = require('node-fetch');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Token Bot Telegram
const botToken = '8008269281:AAGoVj_hOBCxv_p2ku3YUcqpBPFkypJJV5w';
const telegramApiUrl = `https://api.telegram.org/bot${botToken}/`;

// Middleware untuk menangani JSON body
app.use(bodyParser.json());

// Menyimpan status user (digunakan untuk melacak apakah proses dihentikan atau tidak)
const userStatus = {}; // Format: { chatId: { stopped: boolean } }

// Fungsi untuk mengirim pesan ke pengguna Telegram dengan markdown
async function sendMessage(chatId, message) {
    const url = `${telegramApiUrl}sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
    await fetch(url);
}

// Fungsi untuk mengirim foto ke pengguna Telegram
async function sendPhoto(chatId, photoUrl) {
    const url = `${telegramApiUrl}sendPhoto?chat_id=${chatId}&photo=${encodeURIComponent(photoUrl)}`;
    await fetch(url);
}

// Fungsi untuk menangani perintah /start
async function handleStartCommand(chatId) {
    userStatus[chatId] = { stopped: false }; // Set status awal: tidak dihentikan
    const message = "**Selamat datang di Kilike!** 🎉\nAutolike Instagram gratis hanya untuk Anda! 📸\nKetik `/link` untuk mengirimkan link Instagram Anda. 🔗";
    await sendMessage(chatId, message);
}

// Fungsi untuk menangani perintah /link
async function handleLinkCommand(chatId) {
    if (userStatus[chatId]?.stopped) {
        const message = "*Proses sedang dihentikan.* Ketik `/start` untuk memulai kembali. ❌";
        await sendMessage(chatId, message);
        return;
    }

    const message = "**Silakan masukkan URL foto atau Reels Instagram Anda:** 🔗\n*Contoh:* https://www.instagram.com/p/CZz7ABxI1Yo/";
    await sendMessage(chatId, message);
}

// Fungsi untuk menangani perintah /stop
async function handleStopCommand(chatId) {
    if (!userStatus[chatId]) {
        userStatus[chatId] = { stopped: false };
    }
    userStatus[chatId].stopped = true; // Tandai bahwa proses dihentikan
    const message = "*Semua proses telah dihentikan.* 🚫\nKetik `/start` untuk memulai kembali.";
    await sendMessage(chatId, message);
}

// Fungsi untuk menangani perintah /tentang
async function handleTentangCommand(chatId) {
    // Kirim foto terlebih dahulu
    const photoUrl = 'https://ucarecdn.com/179afbe5-99dc-4d20-a1ed-002452324f97/akhirpetang-20241209-0001.jpg'; // Ganti dengan URL foto yang ingin dikirim
    await sendPhoto(chatId, photoUrl);

    // Kirim pesan setelah foto, dengan link Instagram
    const message = `**Tentang Bot ini**:\n\nBot ini digunakan secara gratis dan tidak untuk dijual atau diperjualbelikan. 🚫\nDikembangkan oleh **Zakia Kaidzan** 💻\nNikmati layanan autolike Instagram tanpa biaya! 🎉\n\nIkuti Instagram saya di: [Instagram](https://instagram.com/akhirpetang)`;
    await sendMessage(chatId, message);
}

// Fungsi untuk menangani update dari Telegram
async function handleUpdate(update) {
    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const userMessage = update.message.text.trim();

        if (userMessage === '/start') {
            // Kirimkan pesan sambutan ketika perintah /start diterima
            await handleStartCommand(chatId);
        } else if (userMessage === '/link') {
            // Kirimkan pesan untuk meminta link Instagram
            await handleLinkCommand(chatId);
        } else if (userMessage === '/stop') {
            // Hentikan semua proses saat ini
            await handleStopCommand(chatId);
        } else if (userMessage === '/tentang') {
            // Kirimkan pesan tentang bot
            await handleTentangCommand(chatId);
        } else if (userMessage.startsWith("http") || userMessage.includes("instagram.com")) {
            if (userStatus[chatId]?.stopped) {
                await sendMessage(chatId, "*Proses sedang dihentikan.* Ketik `/start` untuk memulai kembali. ❌");
                return;
            }

            // Kirimkan notifikasi proses
            await sendMessage(chatId, '*Processing...* 🔄');

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
                        userMessage = "*Kamu hanya bisa submit 1 kali sehari untuk satu foto target.* 🚫";
                    } else if (result.message.includes("Success! You will receive likes within next few minutes.")) {
                        userMessage = "*Sukses!* 👍 Anda akan menerima likes dalam beberapa menit ke depan. ⏳";
                    } else if (result.message.includes("It looks like this instagram post is private. We can only provide likes if your instagram account is public. Make your instagram account public and try again with new link.")) {
                        userMessage = "📢 *Pesan:* \nSepertinya postingan Instagram ini bersifat *privat*. Kami hanya dapat memberikan *likes* jika akun Instagram Anda bersifat *publik*. \n\n🔓 *Jadikan akun Instagram Anda publik, lalu coba lagi dengan tautan baru.*";
                    } else {
                        userMessage = `*Pesan:* ${result.message}`; // Gunakan pesan asli jika tidak ada kecocokan
                    }
                    await sendMessage(chatId, userMessage);
                }
            } catch (error) {
                let errorMessage = '';
                if (error.message.includes("Unexpected token")) {
                    errorMessage = "*Harap coba lagi nanti.* 🔄";
                } else {
                    errorMessage = `*Gagal untuk boost:* ${error.message} ❌`;
                }

                await sendMessage(chatId, errorMessage);
            }
        } else {
            await sendMessage(chatId, "*Silakan kirimkan link Instagram yang valid.* 📝");
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
