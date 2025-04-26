module.exports = {
    // Image Optimization
    imageOptimization: {
        enabled: true,
        quality: 80,
        formats: ['webp', 'jpeg', 'png'],
        maxWidth: 1920,
        maxHeight: 1080,
        cacheDir: './public/cache/images'
    },

    // Caching Configuration
    caching: {
        enabled: true,
        maxAge: 3600, // 1 hour
        cacheControl: 'public, max-age=3600',
        etag: true,
        lastModified: true
    },

    // Compression Settings
    compression: {
        enabled: true,
        level: 6,
        threshold: 1024, // 1KB
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    },

    // Database Optimization
    database: {
        connectionLimit: 10,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later'
    },

    // Security Headers
    securityHeaders: {
        enabled: true,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'",
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
    },

    // Logging Configuration
    logging: {
        enabled: true,
        level: 'info',
        format: 'combined',
        rotation: {
            frequency: 'daily',
            maxSize: '20m',
            maxFiles: '14d'
        }
    },

    // Monitoring Configuration
    monitoring: {
        enabled: true,
        metrics: {
            cpu: true,
            memory: true,
            responseTime: true,
            errorRate: true
        },
        alertThresholds: {
            cpu: 80, // percentage
            memory: 80, // percentage
            responseTime: 1000, // milliseconds
            errorRate: 5 // percentage
        }
    },

    // CDN Configuration
    cdn: {
        enabled: true,
        domains: ['cdn.homefunders.com'],
        cacheControl: 'public, max-age=31536000',
        secure: true
    },

    // Asset Optimization
    assets: {
        minify: {
            css: true,
            js: true,
            html: true
        },
        bundle: {
            enabled: true,
            maxSize: 250000, // 250KB
            chunks: {
                vendor: true,
                common: true
            }
        },
        preload: {
            enabled: true,
            critical: true
        }
    }
}; 