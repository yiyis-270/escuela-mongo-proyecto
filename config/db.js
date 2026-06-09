const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27018/EscuelaDB';
        await mongoose.connect(mongoURI);
        console.log(`✅ Conectado a MongoDB en puerto 27018: EscuelaDB`);
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    }
};

module.exports = connectDB;