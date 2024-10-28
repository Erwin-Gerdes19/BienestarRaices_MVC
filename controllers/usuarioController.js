import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'
import csurf from 'csurf'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}
const autenticar = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').notEmpty().withMessage('El Password es Obligatorio').run(req)

    let resultado = validationResult(req) // Se obtienen los resultados de la validación

    // Verificar que el resultado este vacío
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(), // Colocamos el Token para que al segundo CLICK no le aparezca error de Tocken
            errores: resultado.array()
        })
    }
    // Comprobar si el usuario existe
    const { email, password } = req.body

    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(), // Colocamos el Token para que al segundo CLICK no le aparezca error de Tocken
            errores: [{ msg: 'El Usuario No Existe' }]
        })
    }

    // Comprobar si el usuario esta confirmado 

    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(), // Colocamos el Token para que al segundo CLICK no le aparezca error de Tocken
            errores: [{ msg: 'Tu cuenta no a sido Confirmada' }]
        })
    }

    // Revisar el Password
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(), // Colocamos el Token para que al segundo CLICK no le aparezca error de Tocken
            errores: [{ msg: 'Tu Password es Incorrecto' }]
        })
    }
    //Autenticar al Usuario
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })
    console.log(token)

    // Almacenar en un Cookie

    return res.cookie('_token', token, {
        httpOnly: true
        // secury: true
    }).redirect('/mis-propiedades')
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta ',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    //Validacion
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe de ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los password no son iguales').run(req)

    let resultado = validationResult(req) // Se obtienen los resultados de la validación

    // Verificar que el resultado este vacío
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta ',
            csrfToken: req.csrfToken(), // Colocamos el Token para que al segundo CLICK no le aparezca error de Tocken
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    //Extraer los datos
    const { nombre, email, password } = req.body

    // Verificar que el usuario no este duplicado 
    const existeUsuario = await Usuario.findOne({ where: { email } }) //con este codigo, nos verifica en la BBDD si existe otro usuario
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta ',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Usuario ya esta Registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    //Almacenar un Usuario
    const usuario = await Usuario.create({ // El await hace que no se muestre la vista templates/mensaje hasta que se cree el usuario
        nombre,
        email,
        password,
        token: generarId()
    })

    //Envia de email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmacion, presiona en el enlace'
    })
    // Funcion que comprueba una cuenta 

    // console.log(existeUsuario)
    //res.json(resultado.array());// Se envían los resultados de la validación al cliente
    // return;

    //Creacion de nuevos usuarios
    // const usuario = await Usuario.create(req.body)
    // res.json(usuario)
    // return;
    // console.log(req.body) //con req.body extraigo datos de formulario, pero hay que habilitarlo en apps.js
}

// Funcion que comprueba una cuenta 
const confirmar = async (req, res) => {
    const { token } = req.params;

    //Verificar si el token es valido

    const usuario = await Usuario.findOne({ where: { token } })
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar la cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta nuevamente',
            error: true

        })
    }
    //Confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'Esta cuenta se confirmo correctamente'

    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        csrfToken: req.csrfToken(),
        pagina: 'Recupera tu acceso a Bienes Raices'
    })
}

const resetPassword = async (req, res) => {
    //Validacion
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)

    let resultado = validationResult(req) // Se obtienen los resultados de la validación

    // Verificar que el resultado este vacío
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }
    //Buscar el usuario

    const { email } = req.body
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Email no Pertenece a ningún usuario' }]
        })
    }

    // Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save()

    // Enviar Email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token

    })
    // Renderizar un mensaje 
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con instrucciones'
    })
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ where: { token } })
    //console.log(usuario) // Usamos la consola para comprobar que venga todo el usuario
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestable tu Password',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        })
    }
    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Reestablece Tu Password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    //Validar el Password
    await check('password').isLength({ min: 6 }).withMessage('El password debe de ser de al menos 6 caracteres').run(req)

    let resultado = validationResult(req) // Se obtienen los resultados de la validación

    // Verificar que el resultado este vacío
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }
    // Identificar quien hace el cambio

    const { token } = req.params
    const { password } = req.body;

    const usuario = await Usuario.findOne({ where: { token } })

    //Hashear el nuevo Passwrod
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardo correctamente'
    })
}
// export default router

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,

}