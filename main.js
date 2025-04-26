const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const performanceConfig = require('./config/performance');
const MetricsService = require('./services/metricsService');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Import routes
const auth = require('./routes/authRoutes');
const loans = require('./routes/loanRoutes');
const profile = require('./routes/profileRoutes');
const admin = require('./routes/adminRoutes');
const calculator = require('./routes/calculatorRoutes');

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Set security headers
if (performanceConfig.securityHeaders.enabled) {
    app.use(helmet(performanceConfig.securityHeaders.headers));
}

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
if (performanceConfig.rateLimit.enabled) {
    const limiter = rateLimit({
        windowMs: performanceConfig.rateLimit.windowMs,
        max: performanceConfig.rateLimit.max,
        message: performanceConfig.rateLimit.message
    });
    app.use(limiter);
}

// Prevent http param pollution
app.use(hpp());

// Compression
if (performanceConfig.compression.enabled) {
    app.use(compression(performanceConfig.compression));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: performanceConfig.caching.maxAge,
    etag: performanceConfig.caching.etag,
    lastModified: performanceConfig.caching.lastModified,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            res.setHeader('Cache-Control', performanceConfig.caching.cacheControl);
        }
    }
}));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/loans', loans);
app.use('/api/profile', profile);
app.use('/api/admin', admin);
app.use('/api/calculator', calculator);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Handle real-time notifications
    socket.on('notification', (data) => {
        io.emit('notification', data);
    });
});

// Initialize metrics service
const metricsService = new MetricsService(httpServer);

// Use metrics middleware
app.use(metricsService.middleware());

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    httpServer.close(() => process.exit(1));
});

// Performance monitoring
if (performanceConfig.monitoring.enabled) {
    const monitor = require('express-status-monitor')({
        path: '/status',
        spans: [{
            interval: 1,
            retention: 60
        }],
        chartVisibility: {
            cpu: performanceConfig.monitoring.metrics.cpu,
            mem: performanceConfig.monitoring.metrics.memory,
            load: true,
            responseTime: performanceConfig.monitoring.metrics.responseTime,
            rps: true,
            statusCodes: true
        },
        healthChecks: [{
            protocol: 'http',
            host: 'localhost',
            path: '/',
            port: PORT
        }]
    });

    app.use(monitor);
}

module.exports = app; 