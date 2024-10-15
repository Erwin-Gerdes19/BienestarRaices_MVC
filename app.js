// Importa el módulo 'express' para crear y manejar un servidor web
//const express = require('express') //CommonJS
import express from 'express'
import csurf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'
import { cookie } from 'express-validator'

// Llama a la función 'express' para crear una instancia de la aplicación
const app = express()

// Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }))

// Habilitar Cookie Parser

app.use(cookieParser())
// Habilitar  CSRF
app.use(csurf({ cookie: true }))


// Conexion a la bases de datos
try {
    await db.authenticate();
    db.sync() //CREATE TABLE IF NOT EXISTS
    console.log('Conexion Correcta a la Bases de Datos')
} catch (error) {
    console.log('Descripcion del error', error)
}

// Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta publica
app.use(express.static('public'))

app.use('/auth', usuarioRoutes) // en caso que busque en /auth, buscara en el archivo usuarioRoutes

// Inicia el servidor y escucha en el puerto especificado
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El Servidor está funcionando en el puerto ${port}`)
})


