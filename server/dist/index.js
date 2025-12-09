"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
// Import routes
const auth_2 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories")); // Renamed import
const orders_1 = __importDefault(require("./routes/orders"));
const users_1 = __importDefault(require("./routes/users"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const cart_1 = __importDefault(require("./routes/cart"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Initialize database
const db = new database_1.Database();
async function startServer() {
    try {
        await db.init(); // Await database initialization
        // Initialize routes with the db instance
        const authRoutes = (0, auth_2.default)(db);
        const productRoutes = (0, products_1.default)(db);
        const categoryRoutes = (0, categories_1.default)(db);
        const orderRoutes = (0, orders_1.default)(db);
        const userRoutes = (0, users_1.default)(db);
        const wishlistRoutes = (0, wishlist_1.default)(db);
        const cartRoutes = (0, cart_1.default)(db);
        // Security middleware
        app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "https:"],
                    scriptSrc: ["'self'"],
                    connectSrc: ["'self'"]
                }
            }
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        app.use(limiter);
        // CORS configuration
        app.use((0, cors_1.default)({
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }));
        // Body parsing middleware
        app.use(express_1.default.json({ limit: '10mb' }));
        app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Compression
        app.use((0, compression_1.default)());
        // Serve static files
        app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Modahaus E-commerce API'
            });
        });
        // API Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/categories', categoryRoutes);
        app.use('/api/orders', auth_1.authMiddleware, orderRoutes);
        app.use('/api/users', auth_1.authMiddleware, userRoutes);
        app.use('/api/wishlist', auth_1.authMiddleware, wishlistRoutes);
        app.use('/api/cart', auth_1.authMiddleware, cartRoutes);
        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                message: `Cannot ${req.method} ${req.originalUrl}`
            });
        });
        // Global error handler
        app.use(errorHandler_1.errorHandler);
        app.listen(PORT, () => {
            console.log(`🚀 Modahaus Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1); // Exit if server fails to start
    }
}
startServer(); // Call the async function to start the server
exports.default = app;
//# sourceMappingURL=index.js.map