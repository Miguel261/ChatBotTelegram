const { sendDelayedReply } = require('./utils/message_response');
const { getUserContext, setUserContext } = require('./utils/users');
const { QuestionEmailFisrt, handleEmailFlow, QuestionEmail, confirmChangeEmail } = require('./flow/change_email');
const { confirmChangePassword } = require('./flow/change_password');
const { QuestionNumber } = require('./flow/question_number');
const { AccountMoodle } = require('./flow/moodle_account');
const { SearchEmail } = require('./flow/search_email');
const { CoursesProblem } = require('./flow/courses');
const { Personal } = require('./flow/personal');
const { Laboral } = require('./flow/laboral');
const { CoursesKey } = require('./flow/key_course');
const { VerifyError } = require('./flow/verify_error');
const { Constancias } = require('./flow/constancias');
 
const MenuOptions = `Hola, Bienvenido al ChatBotSiESABI 🤖\n\n` +
    `❇️ Escribe el número de la opción que necesitas\n\n` +
    `*Menú de opciones:*\n` +
    `✅ 1. Credenciales no coinciden (Cambio de correo/contraseña)\n` +
    `✅ 2. Puedo iniciar sesión, pero no puedo acceder a los cursos\n` +
    `✅ 3. Consulta de correo electrónico\n` +
    `✅ 4. Problemas con avance de cursos\n` +
    `✅ 5. Actualización de datos personales\n` +
    `✅ 6. Actualización de datos laborales\n` +
    `✅ 7. Curso con clave\n` +
    `✅ 8. Error en verificación de correo\n` +
    `✅ 9. "Descargar la constancia de un curso"\n\n` +
    `📄 *Aviso de privacidad:* https://educacion.imssbienestar.gob.mx\n` +
    `*Nota:* Si el bot no responde, escribe *MENU* nuevamente\n` +
    `⚠️ *ASISTENTE AUTOMÁTICO* - No atiende llamadas/comentarios`;

// 🔁 Reanudar flujo anterior
async function resumeFlow(bot, ctx, flowName) {
    switch (flowName) {
        case 'esperando_curp': return QuestionEmailFisrt(bot, ctx);
        case 'ask_email_change': return handleEmailFlow(bot, ctx);
        case 'ask_email': return QuestionEmail(bot, ctx);
        case 'confirm_email_change': return confirmChangeEmail(bot, ctx);
        case 'confirm_pass_change': return confirmChangePassword(bot, ctx);
        case 'esperando_curp_search_email': return SearchEmail(bot, ctx);
        case 'question_number': return QuestionNumber(bot, ctx);
        case 'esperando_curp_account_moodle': return AccountMoodle(bot, ctx);
        default:
            await sendDelayedReply(bot, ctx.from.id, '⚠️ No hay un flujo activo. Escribe *MENU* para volver al inicio.');
    }
}

// 🟢 Enviar botón de solicitud de número
async function askForPhoneNumber(bot, userId) {
    const userContext = getUserContext(userId);

    // ✅ Solo mostrar el botón si el usuario NO tiene número guardado
    if (userContext && userContext.phoneNumber) {
        await sendDelayedReply(bot, userId, '✅ Ya tenemos registrado tu número, no es necesario enviarlo nuevamente.', 800);
        await sendDelayedReply(bot, userId, MenuOptions, 1200);
        return;
    }

    // 🔘 Mostrar botón si es nuevo o no tiene número
    await bot.telegram.sendMessage(userId,
        '📱 Por favor, comparte tu número de teléfono para continuar:',
        {
            reply_markup: {
                keyboard: [
                    [{ text: 'Compartir mi número 📞', request_contact: true }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
            }
        }
    );
}

const welcome = (bot) => {
    // 🟦 Cuando el usuario comparte su número
    bot.on('contact', async (ctx) => {
        const userId = ctx.from.id.toString();
        let phoneNumber = ctx.message.contact.phone_number;
        const userContext = getUserContext(userId);

        // 🔹 Limpia la lada mexicana (+52 o 52)
        phoneNumber = phoneNumber.replace(/^(\+?52)/, ''); // elimina +52 o 52 al inicio
        phoneNumber = phoneNumber.trim(); // limpia espacios

        console.log(`📞 Número recibido de ${userId}: ${phoneNumber}`);

        setUserContext(userId, {
            ...userContext,
            phoneNumber,
            waitingForPhone: false,
            flow: userContext.previousFlow || null,
            previousFlow: null
        });

        await sendDelayedReply(bot, userId, '✅ Gracias, hemos recibido tu número correctamente.', 800);
        await sendDelayedReply(bot, userId, MenuOptions, 1200);
    });


    // 🟩 Cuando el usuario escribe texto
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id.toString();
        const message = ctx.message.text.trim().toUpperCase();
        const context = getUserContext(userId);

        // 🧭 Si no hay número guardado, pedirlo antes de cualquier otra cosa
        if (!context.phoneNumber) {
            if (/^\+?\d+$/.test(message)) {
                await sendDelayedReply(bot, userId,
                    '⚠️ Por favor, usa el botón *"Compartir mi número 📞"* para enviar tu teléfono correctamente.',
                    1000
                );
                await askForPhoneNumber(bot, userId);
                return;
            }

            await askForPhoneNumber(bot, userId);
            return;
        }

        // 🔁 Si tiene un flujo activo, retomarlo
        if (context.flow) return resumeFlow(bot, ctx, context.flow);

        // 🟧 Menú principal
        switch (message) {
            case 'HOLA':
            case 'MENU':
                await bot.telegram.sendMessage(userId, MenuOptions, { parse_mode: 'Markdown' });
                return;

            case '1': return QuestionEmailFisrt(bot, ctx);
            case '2': return AccountMoodle(bot, ctx);
            case '3': return SearchEmail(bot, ctx);
            case '4': return CoursesProblem(bot, ctx);
            case '5': return Personal(bot, ctx);
            case '6': return Laboral(bot, ctx);
            case '7': return CoursesKey(bot, ctx);
            case '8': return VerifyError(bot, ctx);
            case '9': return Constancias(bot, ctx);

            default:
                await sendDelayedReply(bot, userId,
                    `⚠️ *Opción no válida.*\n\n` +
                    `Envía solo el número de la opción (ej: 1).`, 1500);
                return;
        }
    });
};

module.exports = { welcome };