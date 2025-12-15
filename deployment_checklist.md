modahaus-server/
├── api/
│ └── index.js ← Vercel function entry point
├── src/
│ ├── config/
│ │ └── database.ts ← PostgreSQL database configuration
│ ├── routes/
│ │ ├── auth.ts ← Authentication routes
│ │ ├── products.ts ← Product routes
│ │ ├── users.ts ← User routes
│ │ └── index.ts ← Route exports
│ ├── middleware/
│ │ └── auth.ts ← Authentication middleware
│ └── index.ts ← Main server file
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.example
└── README.md
✅ Environment Variables (Vercel Dashboard)
Set these in Vercel → Project → Settings → Environment Variables:

NODE_ENV=production
APP_ORIGIN=https://www.modahaus.co.za
DATABASE_URL=postgresql://neondb_owner:npg_C9mPvVgxj2QZ@ep-super-unit-adrcwuez-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----... (your full key)
EMAIL_FROM=orders@modahaus.co.za
RESEND_API_KEY=re_P1dJoFtr_EKoVbw7WaaAXTDZ2SHGDvTGX
OZOW_PRIVATE_KEY=83c17700af5c40049c0f89595c70ee5b
OZOW_API_KEY=f1b50d3013ce4aa3a4f46352ecf8f59a
OZOW_MERCHANT_ID=MODAHAUSPTYLTD597214BDB7
✅ Key Changes Made

1. Database Migration
   REMOVED: SQLite3 imports and code
   ADDED: PostgreSQL (pg) driver
   FIXED: Environment variable name (DATABASE_URL not DATABASE_PATH)
   FIXED: Connection string (removed psql prefix)
2. Vercel Configuration
   ADDED: vercel.json with proper routing
   ADDED: Serverless function entry point (api/index.js)
   CONFIGURED: TypeScript build process
3. Error Handling
   ADDED: Comprehensive error handling middleware
   ADDED: Database connection testing
   ADDED: Health check endpoints
   ✅ Deployment Steps
4. Replace all files with the complete versions provided
5. Update dependencies: Remove SQLite3, add PostgreSQL
6. Configure environment variables in Vercel dashboard
7. Deploy: Run vercel command
8. Test: Visit /health endpoint
   ✅ Testing Your Deployment
9. Health Check: Visit https://your-vercel-url.vercel.app/health
10. API Test: Try GET /api/products
11. Frontend Test: Check if frontend can connect to backend
    ✅ Expected API Responses
    json
    // Health Check
    {
    "status": "OK",
    "timestamp": "2025-12-15T19:11:18.000Z",
    "environment": "production",
    "database": "Configured"
    }

// Products API
{
"success": true,
"data": {
"products": [...],
"pagination": {...}
}
}
❌ Common Issues Fixed

1.  SQLite3 with PostgreSQL → Now uses PostgreSQL driver
2.  Wrong DATABASE_PATH → Now uses DATABASE_URL
3.  Malformed connection string → Fixed connection string format
4.  Missing serverless configuration → Added vercel.json
5.  No CORS setup → Added proper CORS configuration
6.  No error handling → Added comprehensive error handling
    ✅ Frontend Connection
    Your frontend should connect to:

https://your-backend-vercel-url.vercel.app/api
With these headers:

javascript
{
'Content-Type': 'application/json',
'Authorization': 'Bearer ' + token
}
Next Steps

1.  Copy all the complete files to your project
2.  Update your package.json dependencies
3.  Set environment variables in Vercel
4.  Deploy and test
5.  Update your frontend API URLs
    This complete setup will resolve your 500 serverless function error!
