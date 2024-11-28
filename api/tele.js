const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Token bot Telegram Anda
const TOKEN = "7799759103:AAEn03hiwvEVBmG7_2H11t4eC3JFS78v-DU"; // Token bot yang Anda berikan
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://biasa-alpha.vercel.app${URI}`; // URL untuk webhook

// Endpoint untuk webhook
app.post(URI, async (req, res) => {
  const { message } = req.body;

  // Pastikan ada pesan yang diterima
  if (!message || !message.text) {
    return res.status(200).send();
  }

  const chatId = message.chat.id;
  const text = message.text;

  let responseText;

  // Tangani pesan /start
  if (text === "/start") {
    responseText = "Selamat datang di bot kami! Ketikkan sesuatu untuk mulai.";
  } else {
    responseText = `Halo, Anda mengirim: ${text}`;
  }

  // Kirim balasan ke Telegram
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: responseText,
    }),
  });

  return res.status(200).send(); // Selesaikan request webhook
});

// Endpoint untuk menyetel webhook
app.get("/", async (req, res) => {
  const setWebhook = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: WEBHOOK_URL,
    }),
  });

  const webhookResponse = await setWebhook.json();
  res.send(webhookResponse); // Kirim hasil penyetelan webhook
});

// Endpoint GET untuk pengujian
app.get("/api/tele", (req, res) => {
  res.send("Bot Telegram Anda sudah berjalan!");
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
