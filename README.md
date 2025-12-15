Modahaus Server
Backend API server for the Modahaus e-commerce platform built with Express.js, TypeScript, and PostgreSQL (Neon DB).

Features
🚀 Express.js API with TypeScript
🗄️ PostgreSQL database with Neon DB
🔐 JWT authentication
🛡️ Security middleware (Helmet, CORS, Rate limiting)
📝 Input validation with express-validator
🏗️ Serverless deployment ready for Vercel
Prerequisites
Node.js 18+
PostgreSQL database (Neon DB recommended)
Vercel account (for deployment)
Local Development

1. Clone and Install
   bash
   git clone <repository-url>
   cd modahaus-server
   npm install
2. Environment Setup
   Copy .env.example to .env and configure:

bash
cp .env.example .env
Update the following variables:

DATABASE_URL: Your PostgreSQL connection string
JWT_PRIVATE_KEY: Your JWT secret key
APP_ORIGIN: Your frontend URL (e.g., http://localhost:3000) 3. Database Setup
Ensure your PostgreSQL database has the required tables. The server will automatically create tables on startup.

4. Start Development Server
   bash
   npm run dev
   The server will start on http://localhost:5000

API Endpoints
Authentication
POST /api/auth/register - Register new user
POST /api/auth/login - User login
GET /api/auth/me - Get current user (authenticated)
POST /api/auth/logout - User logout
Products
GET /api/products - Get all products with filtering
GET /api/products/:slug - Get single product
POST /api/products - Create product (admin only)
GET /api/products/categories/all - Get all categories
Users
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update user profile
GET /api/users/addresses - Get user addresses
POST /api/users/addresses - Add new address
PUT /api/users/addresses/:id - Update address
DELETE /api/users/addresses/:id - Delete address
Health Check
GET /health - Server health check
Deployment to Vercel

1. Install Vercel CLI
   bash
   npm i -g vercel
2. Login to Vercel
   bash
   vercel login
3. Deploy
   bash
   vercel
   Follow the prompts to deploy your project.

4. Configure Environment Variables
   In your Vercel dashboard:

5. Go to your project settings
6. Navigate to "Environment Variables"
7. Add the following variables:
   NODE_ENV=production
   APP_ORIGIN=https://www.modahaus.co.za
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   JWT_PRIVATE_KEY=your-jwt-private-key
   EMAIL_FROM=orders@modahaus.co.za
   RESEND_API_KEY=your-resend-api-key
   OZOW_PRIVATE_KEY=your-ozow-private-key
   OZOW_API_KEY=your-ozow-api-key
   OZOW_MERCHANT_ID=your-merchant-id
8. Database Configuration
   Ensure your Neon DB:

9. Allows connections from anywhere (0.0.0.0/0)
10. Uses SSL connection (required for Vercel)
11. Has the connection string in the correct format
    Database Schema
    The application automatically creates the following tables:

users - User accounts
categories - Product categories
products - Product information
product_images - Product images
addresses - User addresses
orders - Order information
order_items - Order line items
wishlist - User wishlist
cart_items - Shopping cart
reviews - Product reviews
refunds - Refund information
Security Features
Helmet: Security headers
CORS: Cross-origin resource sharing
Rate Limiting: API rate limiting
Input Validation: Request validation
Password Hashing: bcryptjs for password security
JWT Tokens: Secure authentication
Error Handling
The API returns consistent error responses:

json
{
"error": "Error Type",
"message": "Human readable message",
"timestamp": "2025-12-15T19:11:18.000Z"
}
Development Scripts
npm run dev - Start development server with hot reload
npm run build - Build TypeScript to JavaScript
npm start - Start production server
npm run lint - Run ESLint
npm run type-check - TypeScript type checking
Troubleshooting
Database Connection Issues

1.  Check DATABASE_URL format
2.  Ensure SSL is enabled for Neon DB
3.  Verify IP allowlist in database settings
    CORS Issues
4.  Check APP_ORIGIN environment variable
5.  Ensure frontend URL is correct
6.  Verify CORS configuration in vercel.json
    Build Failures
7.  Check TypeScript errors: npm run type-check
8.  Verify all dependencies are installed
9.  Check vercel.json configuration
    Support
    For issues or questions:

10. Check the logs in Vercel dashboard
11. Test API endpoints with Postman or curl
12. Verify environment variables are set correctly
    License
    MIT License
