import express from 'express'
import {
    formularioLogin, formularioRegistro, formularioOlvidePassword, confirmar, registrar, resetPassword, comprobarToken, nuevoPassword

} from '../controllers/usuarioController.js'

const router = express.Router()

//Routing

router.get('/login', formularioLogin);

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/confirmar/:token', confirmar);

router.get('/olvide-password', formularioOlvidePassword);
router.post('/olvide-password', resetPassword);

// Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)


// router.post('/', (req, res) => {
//     res.json({ msg: 'Mensaje en tipo POST' })
// });

// Esta sintaxis se usa mas con Controlles

// router.route('/')
//     .get(function (req, res) {
//         res.json({ msg: 'Hola Mundo en express ' })
//     })
//     .post(function (req, res) {
//         res.json({ msg: 'Mensaje en tipo POST' })
//     })

export default router