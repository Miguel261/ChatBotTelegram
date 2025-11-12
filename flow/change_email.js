const { consultaCurpApi, updateEmail } = require('../utils/api');
const { getUserContext, setUserContext, clearUserFlow } = require('../utils/users');
const { sendDelayedReply } = require('../utils/message_response');
const { confirmChangePassword } = require('./change_password');


async function QuestionEmailFisrt(bot, ctx) {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);
    const now = Date.now();
    const text = ctx.message.text?.trim();

    if (userObject.blockedUntil && userObject.blockedUntil > now) {
        const minutes = Math.ceil((userObject.blockedUntil - now) / (60 * 1000));
        await sendDelayedReply(bot, userId, `⛔ Has excedido el número de intentos. Intenta nuevamente en ${minutes} minutos.`, 1000);
        return;
    }

    if (!userObject.curpRequested) {
        await sendDelayedReply(bot, userId, 'Para verificar su información, escriba su *CURP*:', 600);

        setUserContext(userId, {
            ...userObject,
            curpRequested: true,
            flow: 'esperando_curp',
            intentos: 0
        });
    }

    if (userObject.flow === 'esperando_curp') {
        const curp = text.toUpperCase();
        const userData = await consultaCurpApi(curp);

        if (!userData) {
            await sendDelayedReply(bot, userId, "⚠️ Problema de conexión. Intenta más tarde.", 1000);
            return;
        }

        if (userData === 404 || userData === 500) {
            const intentos = (userObject.intentos || 0) + 1;
            if (intentos >= 10) {
                await sendDelayedReply(bot, userId, "⛔ Has excedido los intentos. Intenta nuevamente en 10 minutos.", 1000);
                setUserContext(userId, { ...userObject, blockedUntil: now + 10 * 60 * 1000, intentos });
                clearUserFlow(userId);
                return;
            }

            setUserContext(userId, { ...userObject, intentos });
            await sendDelayedReply(bot, userId, '❌ No se encontraron datos con esa CURP. Verifica tu información.', 1000);
            return;
        }

        if (userData.user) {
            // 🔍 Validación del número
            if (userData.phone && userData.phone !== userObject.phoneNumber) {
                await sendDelayedReply(bot, userId, '❌ El número que compartiste no coincide con el registrado.', 1000);
                await sendDelayedReply(bot, userId, 'Por seguridad, no podemos otorgarte información', 1000);
                await sendDelayedReply(bot, userId, 'Si extraviaste tu número o cambiaste, envía un correo a: \n siesabisoporte@imssbienestar.gob.mx\n' +
                    'Con los siguientes datos: \n *Nombre, Correo y CURP*', 1000);
                clearUserFlow(userId);
                return;
            }

            await sendDelayedReply(bot, userId, `El correo registrado es: ${userData.user.email}`, 1000);
            await sendDelayedReply(bot, userId, `Verifica que tu correo esté correctamente escrito...`, 1000);

            setUserContext(userId, {
                ...userObject,
                userData,
                flow: null,
                intentos: 0
            });
            
            return handleEmailFlow(bot, ctx);

        } else {
            await sendDelayedReply(bot, userId, '❌ Ocurrió un error, intente de nuevo.', 1000);
            clearUserFlow(userId);
        }
    }
}

async function handleEmailFlow(bot, ctx) {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);
    const response = ctx.message.text.toUpperCase().trim();
    const now = Date.now();

    if (userObject.blockedUntil && userObject.blockedUntil > now) {
        const minutes = Math.ceil((userObject.blockedUntil - now) / (60 * 1000));
        await sendDelayedReply(bot, userId, `⛔ Has excedido el número de intentos. Intenta nuevamente en ${minutes} minutos.`, 1000);
        clearUserFlow(userId);
        return;
    }

    if (!userObject.flow) {
        await sendDelayedReply(bot, userId, `¿Desea hacer cambio de correo? Conteste con *SI* o *NO* para continuar, o escriba *CANCELAR*`, 0);
        setUserContext(userId, { flow: 'ask_email_change', intentos: 0 });
        return;
    }

    if (userObject.flow === 'ask_email_change') {
        if (['SI', 'NO', 'CANCELAR'].includes(response)) {
            if (response === 'SI') {
                setUserContext(userId, { ...userObject, flow: null, intentos: 0 });
                return QuestionEmail(bot, ctx);
            }

            if (response === 'NO') {
                setUserContext(userId, { ...userObject, flow: null, intentos: 0 });
                return confirmChangePassword(bot, ctx);
            }

            if (response === 'CANCELAR') {
                await sendDelayedReply(bot, userId, "https://educacion.imssbienestar.gob.mx/", 1500);
                await sendDelayedReply(bot, userId, "Hasta pronto, Tu equipo SiESABI te desea excelente día 🤓", 1500);
                clearUserFlow(userId);
                return;
            }
        } else {
            const intentos = (userObject.intentos || 0) + 1;
            if (intentos >= 10) {
                await sendDelayedReply(bot, userId, "⛔ Has excedido el número de intentos. Intenta nuevamente en 10 minutos.", 1000);
                setUserContext(userId, { ...userObject, blockedUntil: now + 10 * 60 * 1000, intentos });
                clearUserFlow(userId);
                return;
            }
            setUserContext(userId, { intentos, flow: 'ask_email_change' });
            await sendDelayedReply(bot, userId, `⚠️ Respuesta no válida. Escriba *SI*, *NO* o *CANCELAR*. Intento ${intentos}/10`, 1000);
        }
    }
}

function esCorreoValido(correo) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(correo);
}

async function QuestionEmail(bot, ctx) {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);
    const newEmail = ctx.message.text.trim().toLowerCase();

    if (!userObject.flow) {
        await sendDelayedReply(bot, userId, 'Por favor, proporcione el nuevo correo electrónico que desea registrar, o escriba cancelar.', 0);
        setUserContext(userId, { flow: 'ask_email', intentos: 0 });
    }

    if (userObject.flow === 'ask_email') {
        if (newEmail === 'cancelar') {
            await sendDelayedReply(bot, userId, `Gracias por utilizar nuestro servicio. Tu equipo SiESABI 🤓`, 1500);
            clearUserFlow(userId);
            return;
        }

        if (!esCorreoValido(newEmail)) {
            await sendDelayedReply(bot, userId, '⚠️ Correo no válido, por favor escriba nuevamente su correo:', 1000);
            return;
        } else {
            setUserContext(userId, {
                ...userObject,
                flow: null,
                intentos: 0,
                pendingEmail: newEmail
            });
            return confirmChangeEmail(bot, ctx);
        }
    }
}

async function confirmChangeEmail(bot, ctx) {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);
    const response = ctx.message.text.toUpperCase().trim();

    if (!userObject.flow) {
        await sendDelayedReply(bot, userId, `¿Podrías confirmar si este correo es correcto? Responde con *SI*, *NO* o *CANCELAR*.`, 0);
        setUserContext(userId, { flow: 'confirm_email_change', intentos: 0 });
    }

    if (userObject.flow === 'confirm_email_change') {
        if (['SI', 'NO', 'CANCELAR'].includes(response)) {
            if (response === 'SI') {
                const newEmail = userObject.pendingEmail;
                const res = await updateEmail(userObject.userData.user, newEmail);

                if (!res) {
                    await sendDelayedReply(bot, userId, "⚠️ Hay un problema de conexión con el servidor. Intenta más tarde.", 1000);
                    setUserContext(userId, { flow: null, intentos: 0 });
                    return;
                }

                await sendDelayedReply(bot, userId, "Tu correo ha sido actualizado ✅", 1000);
                await sendDelayedReply(bot, userId, `Tu nuevo correo es: ${newEmail}`, 1000);

                setUserContext(userId, {
                    ...userObject,
                    userData: { ...userObject.userData, user: { ...userObject.userData.user, email: newEmail } },
                    flow: null,
                    intentos: 0
                });

                return confirmChangePassword(bot, ctx);
            }

            if (response === 'NO') {
                setUserContext(userId, { ...userObject, flow: null, intentos: 0 });
                return QuestionEmail(bot, ctx);
            }

            if (response === 'CANCELAR') {
                await sendDelayedReply(bot, userId, "https://educacion.imssbienestar.gob.mx/", 1500);
                await sendDelayedReply(bot, userId, "Hasta pronto, Tu equipo SiESABI te desea excelente día 🤓", 1500);
                clearUserFlow(userId);
            }
        } else {
            await sendDelayedReply(bot, userId, `⚠️ Respuesta no válida. Escriba *SI*, *NO* o *CANCELAR*.`, 1000);
        }
    }
}

module.exports = {
    QuestionEmailFisrt,
    handleEmailFlow,
    QuestionEmail,
    confirmChangeEmail
};
