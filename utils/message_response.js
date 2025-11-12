const sendDelayedReply = async (bot, userId, text, delayMs = 0) => {
    try {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        await bot.telegram.sendMessage(userId, text, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
};

const sendDelayedImage = async (bot, userId, imageOptions, delayMs = 0) => {
    try {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        const filePath = imageOptions.url || imageOptions.path;
        await bot.telegram.sendPhoto(userId, { source: filePath }, { caption: imageOptions.caption || '' });
    } catch (error) {
        console.error('Error al enviar imagen:', error);
    }
};

module.exports = {
    sendDelayedReply,
    sendDelayedImage
};
