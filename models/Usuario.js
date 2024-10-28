import { DataTypes } from 'sequelize'
import bcrypt from 'bcrypt'
import db from '../config/db.js'

const Usuario = db.define('usuario', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN

}, {
    // Instertando hooks
    hooks: {
        beforeCreate: async function (usuario) {
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash(usuario.password, salt)
        }
    }
})

// Metodo Personallizados
Usuario.prototype.verificarPassword = function (password) { // Aprender sobre protoype
    return bcrypt.compareSync(password, this.password);
}

export default Usuario