const path = require('path');
const { sendDelayedReply, sendDelayedImage } = require('../utils/message_response');

const Personal = async (bot, ctx) => {
    const userId = ctx.from.id.toString();

    // ✅ Subimos un nivel y accedemos a /images
    const imagePersonal = path.resolve(__dirname, '../images/datos_personales.png');
    const pestanaPersonal = path.resolve(__dirname, '../images/pestaña_personales.png');

    await sendDelayedReply(bot, userId, "🌟 *Actualización de Datos Personales* 🌟\n\nPara mantener tu información actualizada en nuestro sistema, " +
        "por favor sigue esta guía paso a paso:", 1000);

    await sendDelayedReply(bot, userId, "1️⃣ Accede a tu cuenta con tus credenciales actuales.", 1000);
    await sendDelayedReply(bot, userId, "2️⃣ Una vez dentro, dirígete a la sección de 'Datos Personales' y localiza el icono de configuración ⚙️", 1000);

    await sendDelayedImage(bot, userId, {
        url: imagePersonal,
        caption: '3️⃣ Haz clic en el icono de engrane ⚙️ para abrir las opciones de configuración'
    }, 1000);

    await sendDelayedImage(bot, userId, {
        url: pestanaPersonal,
        caption: '4️⃣ Se abrirá una nueva pestaña donde podrás:\n• Cambiar tu correo electrónico y actualizar tu contraseña\n• Modificar otros datos personales\n\n ' +
            '*Haz clic en "Actualizar información personal"*\n\n💡 *Recomendación importante*:\n' +
            'Mantén siempre actualizado tu número celular registrado.\nEsto te permitirá recuperar el acceso a tu cuenta en caso de olvidar tus credenciales.'
    }, 1000);

    await sendDelayedReply(bot, userId, `Si quieres ver el menú escribe la palabra: *menu*`, 1500);
    await sendDelayedReply(bot, userId, `Agradecemos que utilices nuestro servicio.`, 1500);
    await sendDelayedReply(bot, userId, `Atentamente....`, 1500);
    await sendDelayedReply(bot, userId, `Tu equipo SiESABI 🤓`, 1500);

    return;
};

module.exports = { Personal };
