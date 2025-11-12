const { sendDelayedReply, sendDelayedImage } = require('../utils/message_response');
const path = require('path');

const Constancias = async (bot, ctx) => {
    const userId = ctx.from.id.toString();
    const inicioMoodle = path.join(__dirname, '../images/inicio_moodle.jpg');
    const misCertificados = path.join(__dirname, '../images/mis_certificados.jpg');
    const descarga = path.join(__dirname, '../images/descarga_const.png');

    await sendDelayedReply(bot, userId, "A continuación te guiaré paso a paso para descargar las constancias de los cursos que hayas aprobado:", 1500);

    await sendDelayedReply(bot, userId, "Inicia sesión, despúes accede a los cursos, en la sección de *Ir a cursos*.", 1500);

    await sendDelayedImage(bot, userId, {
        url: inicioMoodle,
        caption: `En la ventana principal de los cursos, haz clic sobre el ícono de tu usuario, ubicado en la parte superior derecha. 
        Al desplegarse el menú, selecciona la opción *Perfil*`
    }, 1000);

    await sendDelayedImage(bot, userId, {
        url: misCertificados,
        caption: `Dentro de tu perfil, desplázate hacia la parte inferior hasta encontrar la sección *Mis certificados*. 
        Haz clic en esa opción para ver tus constancias disponibles.`
    }, 1000);

    await sendDelayedImage(bot, userId, {
        url: descarga,
        caption: `Finalmente, se mostrará una tabla con los cursos que has aprobado. 
        En la columna *Archivo*, encontrarás el botón para descargar tu constancia correspondiente.`
    }, 1000);


    await sendDelayedReply(bot, userId, `Si deseas regresar al menú principal, escribe la palabra: *menu*`, 1500);
    await sendDelayedReply(bot, userId, `Agradecemos que utilices nuestro servicio.`, 1500);
    await sendDelayedReply(bot, userId, `Atentamente....`, 1500);
    await sendDelayedReply(bot, userId, `Tu equipo SiESABI 🤓`, 1500);
    return;
}

module.exports = {
    Constancias
};