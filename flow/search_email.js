// src/flow/search_email.js
const { consultaCurpApi } = require('../utils/api');
const { getUserContext, setUserContext, clearUserFlow } = require('../utils/users');
const { sendDelayedReply } = require('../utils/message_response');

async function SearchEmail(bot, ctx) {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);
    const now = Date.now();
    const text = ctx.message?.text?.trim()?.toUpperCase();

    // 🚫 Verificar bloqueo por intentos fallidos
    if (userObject.blockedUntil && userObject.blockedUntil > now) {
        const minutes = Math.ceil((userObject.blockedUntil - now) / (60 * 1000));
        await sendDelayedReply(bot, userId, `⛔ Has excedido el número de intentos. Intenta nuevamente en ${minutes} minutos.`, 1000);
        return;
    }

    if (!userObject.curpRequested) {
        await sendDelayedReply(bot, userId, 'Para verificar su información, escriba su *CURP*:', 800);

        setUserContext(userId, {
            ...userObject,
            curpRequested: true,
            flow: 'esperando_curp_search_email',
            intentos: 0
        });
        return;
    }

    // 🧩 Si el flujo está esperando CURP
    if (userObject.flow === 'esperando_curp_search_email') {
        const curp = text;
        const userData = await consultaCurpApi(curp);

        if (!userData) {
            await sendDelayedReply(bot, userId, "⚠️ Hay un problema de conexión con el servidor. Intenta más tarde.", 1000);
            return;
        }

        // ❌ Si no hay resultados válidos
        if (userData === 404 || userData === 500) {
            const intentos = (userObject.intentos || 0) + 1;

            if (intentos >= 10) {
                await sendDelayedReply(bot, userId, "⛔ Has excedido el número de intentos. Intenta nuevamente en 10 minutos.", 1000);
                setUserContext(userId, {
                    ...userObject,
                    blockedUntil: now + 10 * 60 * 1000,
                    intentos
                });
                clearUserFlow(userId);
                return;
            }

            setUserContext(userId, { ...userObject, intentos });
            await sendDelayedReply(bot, userId, '❌ No se encontraron datos con esa CURP. Verifica tu información e inténtalo de nuevo:', 1000);
            return;
        }

        // 📱 Validar número telefónico
        if (userData.phone) {
            const userPhone = userObject.phoneNumber; // Guardado cuando se inicia el chat
            if (userPhone && userPhone === userData.phone) {

                setUserContext(userId, {
                    ...userObject,
                    curp,
                    userData,
                    flow: null,
                    curpRequested: false,
                    intentos: 0
                });

                await sendDelayedReply(bot, userId, `El correo registrado es: ${userData.user.email}`, 1500);
                await sendDelayedReply(bot, userId, `Verifica que tu correo esté correctamente escrito...`, 1500);
                await sendDelayedReply(bot, userId, `Si deseas cambiar tu correo electrónico solo escribe: *1*`, 1500);
                await sendDelayedReply(bot, userId, `Si quieres ver el menú escribe la palabra: *menu*`, 1500);
                await sendDelayedReply(bot, userId, `Agradecemos que utilices nuestro servicio.`, 1500);
                await sendDelayedReply(bot, userId, `Atentamente...`, 1500);
                await sendDelayedReply(bot, userId, `Tu equipo SiESABI 🤓`, 1500);
                return;

            } else {
                await sendDelayedReply(bot, userId, '❌ El número que compartiste no coincide con el registrado.', 1000);
                await sendDelayedReply(bot, userId, 'Por seguridad, no podemos otorgarte información', 1000);
                await sendDelayedReply(bot, userId, 'Si extraviaste tu número o cambiaste, envía un correo a: \n siesabisoporte@imssbienestar.gob.mx\n' +
                    'Con los siguientes datos: \n *Nombre, Correo y CURP*', 1000);
                clearUserFlow(userId);
                return;
            }
        } else {
            await sendDelayedReply(bot, userId, '⚠️ Este usuario no tiene número telefónico registrado.', 1000);
            clearUserFlow(userId);
            return;
        }
    }

    // ❌ Flujo inválido o inconsistente
    else {
        await sendDelayedReply(bot, userId, '❌ Ocurrió un error, intenta nuevamente.', 1000);
        clearUserFlow(userId);
        return;
    }
}

module.exports = { SearchEmail };
