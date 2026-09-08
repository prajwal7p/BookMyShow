const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    // Production Vercel deployment. Environment variables above can add or
    // replace this for preview deployments or a custom domain.
    'https://book-my-show-six-peach.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
]
    .flatMap(value => (value || '').split(','))
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header (health checks, curl, server to
        // server calls) do not need CORS validation.
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            return callback(null, true);
        }

        return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public endpoints for ALB checks and quick verification.
app.get('/', (req, res) => {
    res.status(200).json({ message: 'CineHive backend is running' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/theatres', require('./routes/theatreRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('/*splat', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
