import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    // Copiamos el codigo directamente de la pagina Mailtrap.ia
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const { nombre, email, token } = datos

    //Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p> Hola ${nombre}, comprueba tu cuenta de BienesRaices.com </p>

            <p> Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}"> Confirmar Cuenta </a></p>

            <p> Si tu no creaste esta cuenta, puedes ignorar el mensaje </p>
        `
    })
}

const emailOlvidePassword = async (datos) => {
    // Copiamos el codigo directamente de la pagina Mailtrap.ia
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const { nombre, email, token } = datos

    //Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Restablecer tu Password en BienesRaices.com',
        text: 'Restablecer tu Password en BienesRaices.com',
        html: `
            <p> Hola ${nombre}, has solicitado reestablecer tu password en BienesRaices.com </p>

            <p> Sigue el siguiente enlace para generar un password nuevo: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}"> Reestablecer Password </a></p>

            <p> Si tu no solicitaste el cambio de password, puedes ignorar el mensaje, puedes ignorar el mensaje </p>
        `
    })
}
export {
    emailRegistro,
    emailOlvidePassword
}