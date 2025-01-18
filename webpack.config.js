import path from 'path'

export default {
    mode: 'development',
    entry: {
        mapa: './src/js/mapa.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve('public/js') // La propiedad path sirve para no dar la ruta completa, y solamente nos manejemos con el nombre del archivo
    }
}