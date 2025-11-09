/**
 * SKILLI STAR-XMD 🪐
 * WhatsApp Bot by Skilli Star
 * Smart Assistant built with Baileys (multi-device)
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
require('dotenv').config();

// === LOAD CONFIG ===
const config = require('./config.js');

// === MAIN FUNCTION ===
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./skilli_auth');
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    version,
    browser: ['Skilli Star-XMD', 'Chrome', '1.0']
  });

  console.log('🪐 Skilli Star-XMD bot starting...');

  // === CONNECTION HANDLER ===
  client.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Connected successfully to WhatsApp!');
    }
  });

  client.ev.on('creds.update', saveCreds);

  // === MESSAGE HANDLER ===
  client.ev.on('messages.upsert', async (msg) => {
    const m = msg.messages[0];
    if (!m.message || m.key.fromMe) return;

    const sender = m.key.remoteJid;
    const textMessage = m.message.conversation || m.message.extendedTextMessage?.text;

    if (!textMessage) return;

    console.log(`💬 Message from ${sender}: ${textMessage}`);

    // === COMMANDS ===
    if (textMessage.toLowerCase() === 'hi' || textMessage.toLowerCase() === 'hello') {
      await client.sendMessage(sender, { text: '👋 Hello! I am *Skilli Star-XMD* bot!' });
    }

    if (textMessage.toLowerCase() === 'menu') {
      await client.sendMessage(sender, {
        text: `🧠 *Skilli Star-XMD Commands*\n\n1. hi / hello – Greeting\n2. menu – Show commands\n3. about – Info about bot`
      });
    }

    if (textMessage.toLowerCase() === 'about') {
      await client.sendMessage(sender, {
        text: `🚀 *Skilli Star-XMD*\nSmart WhatsApp Assistant powered by Baileys.\n\n💻 Developer: Skilli Star`
      });
    }
  });
}

// === START BOT ===
startBot();
npm install @whiskeysockets/baileys pino dotenv
