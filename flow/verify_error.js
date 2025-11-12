const { sendDelayedReply } = require('../utils/message_response');

const VerifyError = async (bot, ctx) => {
    const userId = ctx.from.id.toString();
    await sendDelayedReply(bot, userId, "Estimado usuario, actualmente el servicio de verificación se encuentra saturado debido al alto número de solicitudes.", 1500);

    await sendDelayedReply(bot, userId, "Le pedimos por favor intentarlo nuevamente más tarde.", 1500);

    await sendDelayedReply(bot, userId, "Agradecemos su comprensión y paciencia.", 1500);

    await sendDelayedReply(bot, userId, `Si quieres ver el menú escribe la palabra: *menu*`, 1500);
    await sendDelayedReply(bot, userId, `Agradecemos que utilices nuestro servicio.`, 1500);
    await sendDelayedReply(bot, userId, `Atentamente....`, 1500);
    await sendDelayedReply(bot, userId, `Tu equipo SiESABI 🤓`, 1500);
    return;
}

module.exports = {
    VerifyError
};