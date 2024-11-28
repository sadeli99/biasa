const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const TOKEN = "7799759103:AAEn03hiwvEVBmG7_2H11t4eC3JFS78v-DU"; // Ganti dengan token bot Anda
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://biasa-alpha.vercel.app${URI}`; // Ganti dengan URL Vercel Anda

// Set webhook endpoint
app.post(URI, async (req, res) => {
  const chatId = req.body.message.chat.id;
  const text = req.body.message.text;

  // Balasan sederhana
  const responseText = `Halo, Anda mengirim: ${text}`;

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: responseText,
    }),
  });

  return res.send();
});

// Set webhook saat aplikasi dijalankan
app.get("/", async (req, res) => {
  const setWebhook = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: WEBHOOK_URL,
    }),
  });

  const webhookResponse = await setWebhook.json();
  res.send(webhookResponse);
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
