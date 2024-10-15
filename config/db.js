import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS ?? '', {
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: true //Esto agrega dos columns extras en la tabla usuario fecha_creacion y actualizacion_registro
    },
    pool: {
        max: 5, // Maximo de conecciones 
        min: 0, // Minimo de conecciones
        acquire: 30000, // Tiempo antes de marcar un error
        idle: 10000 // Tiempo que debe transcurrir para cerrar sesiones para liberar espacios en la BBDD
    },
    operatorsAliases: false
});

export default db