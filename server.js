const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Jumuia Resorts API' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Port
const PORT = process.env.PORT || 5000;

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const seedAdmin = async () => {
    try {
        const User = require('./models/User');
        const adminExists = await User.findOne({ email: 'generalmanager@jumuiaresorts.com' });
        if (!adminExists) {
            await User.create({
                name: 'General Manager',
                email: 'generalmanager@jumuiaresorts.com',
                password: '12345678', // Note: This will be hashed by the model pre-save hook
                role: 'general-manager',
                properties: ['limuru', 'kanamai', 'kisumu']
            });
            console.log('Seeded initial admin user');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    seedAdmin();
});
