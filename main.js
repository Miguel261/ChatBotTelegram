const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const { welcome } = require('./welcome');
const { resetAllUsersContext } = require('./utils/users');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

bot.launch()
    .then(() => console.log('✅ Bot de Telegram listo y escuchando mensajes...'))
    .catch(err => console.error('Error al iniciar bot:', err));

// 🕛 Limpieza diaria
cron.schedule('0 0 * * *', () => {
    resetAllUsersContext();
    console.log('🧹 Contextos limpiados automáticamente');
}, { timezone: "America/Mexico_City" });

// Inicia flujo principal
welcome(bot);
