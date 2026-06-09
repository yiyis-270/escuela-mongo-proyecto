const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 🔧 Usa MONGODB_URI primero, si no existe usa la local
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27018/EscuelaDB';
        
        await mongoose.connect(mongoURI);
        
        console.log(`✅ Conectado a MongoDB: ${mongoURI.includes('mongodb+srv') ? 'Atlas (Nube)' : 'Local'}`);
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
