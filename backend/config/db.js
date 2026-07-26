const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error('MONGO_URI is missing in backend/.env');
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000
        });

        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection failed: ${err.message}`);
        const isAtlasUri = process.env.MONGO_URI?.includes('.mongodb.net');

        if (isAtlasUri) {
            console.error('Atlas setup: open MongoDB Atlas > Security > Network Access and add your public IP address. For development from changing networks, add 0.0.0.0/0 only with a strong database password.');
        } else {
            console.error('Local setup: make sure MongoDB is running, or set MONGO_URI=mongodb://127.0.0.1:27017/revbookmyshow in backend/.env.');
        }

        process.exit(1);
    }
};

module.exports = connectDB;
