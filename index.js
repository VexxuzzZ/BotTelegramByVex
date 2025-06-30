const TelegramBot = require('node-telegram-bot-api');

// Ganti token berikut dengan token bot kamu
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

const fakeOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

let spamInterval = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Selamat datang ${msg.from.first_name}!\n\nGunakan perintah:\n/kirimotp <nomor> untuk mengirim OTP terus menerus.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Mulai Kirim OTP", callback_data: "startotp" }],
        [{ text: "Stop Kirim OTP", callback_data: "stopotp" }]
      ]
    }
  });
});

bot.onText(/\/kirimotp (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const nomor = match[1];

  if (spamInterval[chatId]) {
    bot.sendMessage(chatId, `❌ Kirim OTP sedang berjalan!\nGunakan tombol *Stop Kirim OTP*.`, { parse_mode: "Markdown" });
    return;
  }

  bot.sendMessage(chatId, `✅ Mulai mengirim OTP ke *${nomor}*...`, { parse_mode: "Markdown" });

  spamInterval[chatId] = setInterval(() => {
    const otp = fakeOTP();

    bot.sendMessage(chatId, `📲 OTP untuk ${nomor}:\n\n*${otp}*`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: `📋 Salin OTP`, callback_data: `copy_${otp}` }]
        ]
      }
    });

  }, 5000); // setiap 5 detik
});

bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (data === "startotp") {
    bot.sendMessage(chatId, "Kirim perintah:\n`/kirimotp 08xxxx`", { parse_mode: "Markdown" });
  }

  if (data === "stopotp") {
    if (spamInterval[chatId]) {
      clearInterval(spamInterval[chatId]);
      delete spamInterval[chatId];
      bot.sendMessage(chatId, `✅ Kirim OTP telah dihentikan.`);
    } else {
      bot.sendMessage(chatId, `⚠️ Tidak ada pengiriman OTP yang berjalan.`);
    }
  }

  if (data.startsWith("copy_")) {
    const otp = data.split("copy_")[1];
    bot.answerCallbackQuery(callbackQuery.id, { text: `OTP "${otp}" telah disalin!`, show_alert: false });
  }
});
