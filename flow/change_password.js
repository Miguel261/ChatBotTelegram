const { sendDelayedReply } = require('../utils/message_response');
const { funtionApi } = require('../utils/api');;
const { getUserContext, setUserContext, clearUserFlow } = require('../utils/users');

const confirmChangePassword = async (bot, ctx) => {
    const userId = ctx.from.id.toString();
    const userObject = getUserContext(userId);
    const response = ctx.message.text.toUpperCase().trim();
    const now = Date.now();

    // ⏳ Verificar si el usuario está bloqueado por demasiados intentos
    if (userObject.blockedUntil && userObject.blockedUntil > now) {
        const minutes = Math.ceil((userObject.blockedUntil - now) / (60 * 1000));
        await sendDelayedReply(bot, userId, `⛔ Has excedido el número de intentos. Intenta nuevamente en ${minutes} minutos.`, 1000);
        return;
    }

    // 🧠 Si no hay flujo activo, iniciar el proceso
    if (!userObject.flow) {
        await sendDelayedReply(bot, userId, '¿Desea cambiar su contraseña? Conteste con *SI* o *NO* para continuar, si desea terminar la conversación escriba *CANCELAR*', 0);
        setUserContext(userId, { flow: 'confirm_pass_change', intentos: 0 });
        return;
    }

    // 🔄 Si el usuario está en el flujo de confirmación de cambio de contraseña
    if (userObject.flow === 'confirm_pass_change') {
        if (['SI', 'NO', 'CANCELAR'].includes(response)) {
            // ✅ Usuario acepta cambiar la contraseña
            if (response === 'SI') {
                const res = await funtionApi(userObject.userData.user, 1);

                if (!res) {
                    await sendDelayedReply(bot, userId, "⚠️ Hay un problema de conexión con el servidor. Intenta más tarde.", 1000);
                    setUserContext(userId, { flow: null, intentos: 0 });
                    return;
                }

                if (res == 500 || res == 404) {
                    await sendDelayedReply(bot, userId, "Hubo un error al realizar esta acción ❌", 1000);
                    await sendDelayedReply(bot, userId, "Contacte algún administrador para que se pueda corregir este error, al correo: siesabisoporte@imssbienestar.gob.mx", 1500);
                    await sendDelayedReply(bot, userId, "Se lo agradeceríamos mucho, el equipo SiESABI agradece su colaboración 🤓", 1500);
                    setUserContext(userId, { flow: null, intentos: 0 });
                    return;
                }

                if (res.status === 200) {
                    await sendDelayedReply(bot, userId, "Tu contraseña ha sido actualizada ✅", 1000);
                    await sendDelayedReply(bot, userId, "Para acceder a tu cuenta utilizarás los siguientes datos:", 1500);
                    await sendDelayedReply(bot, userId, `*Correo*: ${userObject.userData.user.email}\n\n*Contraseña temporal*: ${res.data.password}`, 1000);

                    await sendDelayedReply(bot, userId, "Deberás actualizar tu contraseña, ingresando al apartado de ajustes una vez que hayas iniciado sesión, siguiendo estos pasos:", 1500);
                    await sendDelayedReply(bot, userId, "1️⃣ Ve a la sección de Datos Personales y localiza el icono de configuración (⚙️)", 1500);
                    await sendDelayedReply(bot, userId, "2️⃣ Haz clic en el engrane (⚙️) para abrir el menú de ajustes.", 1500);
                    await sendDelayedReply(bot, userId, "3️⃣ Se desplegará una ventana con las opciones de configuración.", 1500);
                    await sendDelayedReply(bot, userId, "4️⃣ Busca la pregunta '¿Desea actualizar su contraseña?' y activa el interruptor.", 1500);
                    await sendDelayedReply(bot, userId, "5️⃣ Ingresa tu nueva contraseña y confírmala para guardar los cambios.", 1500);

                    await sendDelayedReply(bot, userId, "Para tu conveniencia, copia y guarda tus credenciales en un lugar seguro 🧠", 2000);
                    await sendDelayedReply(bot, userId, "🔗 Liga para iniciar sesión:", 1000);
                    await sendDelayedReply(bot, userId, "https://educacion.imssbienestar.gob.mx/", 1000);
                    await sendDelayedReply(bot, userId, "Hasta pronto, Tu equipo SiESABI te desea excelente día 🤓", 1500);

                    clearUserFlow(userId);
                    return;
                }
            }

            // ❌ Usuario no quiere cambiar contraseña
            if (response === 'NO') {
                await sendDelayedReply(bot, userId, "🔗 Liga para iniciar sesión:", 1500);
                await sendDelayedReply(bot, userId, "https://educacion.imssbienestar.gob.mx/", 1000);
                await sendDelayedReply(bot, userId, "Hasta pronto, Tu equipo SiESABI te desea excelente día 🤓", 1500);
                clearUserFlow(userId);
                return;
            }

            // 🚪 Usuario cancela el flujo
            if (response === 'CANCELAR') {
                await sendDelayedReply(bot, userId, "🔗 Liga para iniciar sesión:", 1500);
                await sendDelayedReply(bot, userId, "https://educacion.imssbienestar.gob.mx/", 1000);
                await sendDelayedReply(bot, userId, "Hasta pronto, Tu equipo SiESABI te desea excelente día 🤓", 1500);
                clearUserFlow(userId);
                return;
            }
        } else {
            // ⚠️ Respuesta inválida
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

            setUserContext(userId, { intentos, flow: 'confirm_pass_change' });
            await sendDelayedReply(bot, userId, `⚠️ Respuesta no válida. Escriba *SI*, *NO* o *CANCELAR*. Intento ${intentos}/10`, 1000);
        }
    }
};

module.exports = { confirmChangePassword };
