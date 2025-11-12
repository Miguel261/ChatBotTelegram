const { sendDelayedReply } = require('../utils/message_response');

const CoursesProblem = async (bot, ctx) => {
    const userId = ctx.from.id.toString();

    await sendDelayedReply(bot, userId, "La opción que ha seleccionado corresponde a un problema más específico " +
        "que requiere atención personalizada. Le invitamos a ponerse en contacto con los administradores para brindarle " +
        "asistencia directa.", 1500);

    await sendDelayedReply(bot, userId, "Por favor, escriba a siesabisoporte@imssbienestar.gob.mx detallando su situación, y " +
        "con gusto le ayudaremos a resolverlo a la brevedad posible.", 1500);

    await sendDelayedReply(bot, userId, `Para ver todas las opciones disponibles, escribe: *menu*`, 1500);
    await sendDelayedReply(bot, userId, `O si prefieres ir directamente a una opción específica, escribe su número correspondiente.`, 1500);
    await sendDelayedReply(bot, userId, `Agradecemos que utilices nuestro servicio.`, 1500);
    await sendDelayedReply(bot, userId, `Atentamente....`, 1500);
    await sendDelayedReply(bot, userId, `Tu equipo SiESABI 🤓`, 1500);
    return;
}

module.exports = {
    CoursesProblem
};