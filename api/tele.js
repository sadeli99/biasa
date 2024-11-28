const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const TOKEN = "your-telegram-bot-token"; // Ganti dengan token bot Anda
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://your-vercel-domain.vercel.app${URI}`; // Ganti dengan domain Vercel Anda

// Route GET untuk memastikan bot berjalan
app.get("/api/tele", (req, res) => {
  res.send("Bot Telegram Anda sudah berjalan!");
});

// Endpoint webhook
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

// Endpoint untuk set webhook
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
