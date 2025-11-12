const { sendDelayedReply } = require('../utils/message_response');
const { getUserContext, setUserContext } = require('../utils/users');

async function QuestionNumber(bot, ctx) {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);

    // Si no se ha pedido aún el número
    if (!userObject.waitingForPhone) {
        await sendDelayedReply(bot, userId, '📱 Por favor comparte tu número de teléfono tocando el botón de abajo 👇', 1000);

        // Enviamos el teclado especial para compartir el número
        await bot.telegram.sendMessage(userId, 'Toca el botón para compartir tu número:', {
            reply_markup: {
                keyboard: [[
                    {
                        text: '📞 Compartir mi número',
                        request_contact: true
                    }
                ]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });

        // Guardamos el estado en contexto
        setUserContext(userId, {
            ...userObject,
            previousFlow: userObject.flow,
            flow: 'question_number',
            waitingForPhone: true
        });

        return;
    }

    // Si ya está esperando el número pero el usuario manda otra cosa
    await sendDelayedReply(bot, userId, '⚠️ Por favor usa el botón para compartir tu número de teléfono.', 1000);
}

module.exports = { QuestionNumber };
