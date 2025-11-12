// src/flow/account_moodle.js
const { consultaCurpApi, funtionApi } = require('../utils/api');
const { getUserContext, setUserContext, clearUserFlow } = require('../utils/users');
const { sendDelayedReply } = require('../utils/message_response');

async function AccountMoodle(bot, ctx) {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);
    const now = Date.now();
    const text = ctx.message.text?.trim()?.toUpperCase();

    // 🚫 Bloqueo por intentos fallidos
    if (userObject.blockedUntil && userObject.blockedUntil > now) {
        const minutes = Math.ceil((userObject.blockedUntil - now) / (60 * 1000));
        await sendDelayedReply(bot, userId, `⛔ Has excedido el número de intentos. Intenta nuevamente en ${minutes} minutos.`, 1000);
        return;
    }

    // 🧾 Primer mensaje: solicitar CURP
    if (!userObject.curpRequested) {
        await sendDelayedReply(bot, userId, `Para verificar su información, escriba su *CURP*:`, 800);

        setUserContext(userId, {
            ...userObject,
            curpRequested: true,
            flow: 'esperando_curp_account_moodle',
            intentos: 0
        });
        return;
    }

    // 🧩 Si está esperando la CURP
    if (userObject.flow === 'esperando_curp_account_moodle') {
        const curp = text.toUpperCase();
        const userData = await consultaCurpApi(curp);

        if (!userData) {
            await sendDelayedReply(bot, userId, "⚠️ Problema de conexión con el servidor. Intenta más tarde.", 1000);
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

        // 📱 Validar número de teléfono
        if (userData.phone) {
            
            if (userData.phone && userData.phone !== userObject.phoneNumber) {

                await sendDelayedReply(bot, userId, '❌ El número que compartiste no coincide con el registrado.', 1000);
                await sendDelayedReply(bot, userId, 'Por seguridad, no podemos otorgarte información', 1000);
                await sendDelayedReply(bot, userId, 'Si extraviaste tu número o cambiaste, envía un correo a: \n siesabisoporte@imssbienestar.gob.mx\n' +
                    'Con los siguientes datos: \n *Nombre, Correo y CURP*', 1000);
                clearUserFlow(userId);
                return;

                
            } else {

                await sendDelayedReply(bot, userId, '⚠️ Consultando información...', 800);

                const res = await funtionApi(userData.user, 2);

                if (!res) {
                    await sendDelayedReply(bot, userId, "⚠️ Problema de conexión con el servidor. Intenta más tarde.", 1000);
                    clearUserFlow(userId);
                    return;
                }

                if (res == 500 || res == 404) {
                    await sendDelayedReply(bot, userId, "Hubo un error al realizar esta acción ❌", 1000);
                    await sendDelayedReply(bot, userId, "Contacte al equipo de soporte: siesabisoporte@imssbienestar.gob.mx", 1000);
                    await sendDelayedReply(bot, userId, "El equipo SiESABI agradece tu paciencia 🤓", 1000);
                    clearUserFlow(userId);
                    return;
                }

                if (res.status == 200) {
                    await sendDelayedReply(bot, userId, "El problema con tu cuenta ha sido corregido ✅", 1000);
                    await sendDelayedReply(bot, userId, "Puedes iniciar sesión aquí:", 1000);
                    await sendDelayedReply(bot, userId, "https://educacion.imssbienestar.gob.mx/", 1000);
                    await sendDelayedReply(bot, userId, "Hasta pronto, Tu equipo SiESABI te desea excelente día 🤓", 1000);
                    clearUserFlow(userId);
                    return;
                } else {
                    await sendDelayedReply(bot, userId, "No existe problema con tu cuenta ❌", 1000);
                    await sendDelayedReply(bot, userId, "Liga para iniciar sesión:", 1000);
                    await sendDelayedReply(bot, userId, "https://educacion.imssbienestar.gob.mx/", 1000);
                    await sendDelayedReply(bot, userId, "Hasta pronto, Tu equipo SiESABI te desea excelente día 🤓", 1000);
                    clearUserFlow(userId);
                    return;
                }

            }
        } else {
            await sendDelayedReply(bot, userId, '⚠️ El usuario no tiene número telefónico registrado.', 1000);
            clearUserFlow(userId);
            return;
        }
    }

    // ❌ Si algo sale mal
    else {
        await sendDelayedReply(bot, userId, '❌ Ocurrió un error, intente de nuevo.', 1000);
        clearUserFlow(userId);
        return;
    }
}

module.exports = { AccountMoodle };
