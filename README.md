# Modahaus E-commerce Platform

A comprehensive full-stack e-commerce application for home and house goods, built with modern web technologies.

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT-based authentication
- **Security**: Helmet, CORS, rate limiting, input validation
- **API**: RESTful API with comprehensive endpoints

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for client-side state
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM v6

## 🚀 Features

### Core E-commerce Functionality
- ✅ Product catalog with categories and subcategories
- ✅ Advanced product search and filtering
- ✅ Shopping cart with quantity management
- ✅ Wishlist functionality
- ✅ User authentication and registration
- ✅ User profiles and address management
- ✅ Order creation and tracking
- ✅ Order history and management
- ✅ Responsive design (mobile-first)

### User Experience
- ✅ Modern, clean UI design
- ✅ Product image galleries
- ✅ Price comparisons and discounts
- ✅ Product ratings and reviews
- ✅ Wishlist to cart conversion
- ✅ Persistent cart across sessions
- ✅ Real-time inventory updates
- ✅ Loading states and error handling

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting for API endpoints
- ✅ CORS protection
- ✅ Helmet security headers

## 📁 Project Structure

```
modahaus/
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API route handlers
│   │   ├── scripts/       # Database seeding script
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── store/         # Zustand state management
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Application entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── package.json           # Root package configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create `.env` files:

**Server (.env)**:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_PATH=../database.sqlite
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Client (.env)** (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

```bash
# Seed the database with sample data
cd server
npm run seed
```

### 4. Start the Application

**Development Mode** (from root):
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

**Production Build**:
```bash
# Build the client
cd client
npm run build

# Build and start the server
cd ../server
npm run build
npm start
```

## 🗄️ Database Schema

The application uses SQLite for development with the following main tables:

- **users** - User accounts and authentication
- **categories** - Product categories (hierarchical)
- **products** - Product catalog with pricing and inventory
- **product_images** - Product image galleries
- **orders** - Order management and tracking
- **order_items** - Individual items within orders
- **addresses** - User shipping and billing addresses
- **wishlist** - User wishlist items
- **cart_items** - Persistent shopping cart
- **reviews** - Product reviews and ratings
- **refunds** - Refund processing

## 🎨 Design System

### Colors
- **Primary**: Teal (#00796B) - Main brand color
- **Neutral**: Gray scale for text and backgrounds
- **Semantic**: Success, warning, error states

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: Modular scale for consistent sizing

### Components
- **Cards**: Product cards, content cards
- **Buttons**: Primary, secondary, text variants
- **Forms**: Input fields, validation, error states
- **Navigation**: Header, breadcrumbs, pagination

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - List products with filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product details

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category details

### Cart
- `GET /api/cart` - Get cart contents
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

## 🔧 Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions

### State Management
- Zustand for client-side state
- React Query for server state
- Persistent storage for cart and auth

### Performance
- React Query caching
- Image lazy loading
- Code splitting
- Bundle optimization

## 🚢 Deployment

### Production Considerations
- Use PostgreSQL instead of SQLite
- Configure environment variables
- Set up SSL certificates
- Configure CDN for static assets
- Set up monitoring and logging
- Implement proper backup strategy

### Docker Support (Recommended)
```dockerfile
# Example Dockerfile structure
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000 5000
CMD ["npm", "start"]
```

## 📊 Sample Data

The seeding script includes:
- 4 main categories (Furniture, Home Decor, Kitchen & Dining, Bedding & Bath)
- 15+ subcategories
- 15+ sample products with images
- Realistic pricing and inventory data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ by MiniMax Agent**

Transform your house into a home with Modahaus! 🏠