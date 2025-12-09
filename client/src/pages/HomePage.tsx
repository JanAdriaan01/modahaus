import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/apiService';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsService.getFeaturedProducts(8),
  });

  const featuredProducts = featuredData?.products || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-neutral-100 to-neutral-200 overflow-hidden">
        <div className="container-custom py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                  Transform Your House Into a 
                  <span className="text-primary-500"> Home</span>
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
                  Discover our curated collection of beautiful furniture, home decor, 
                  and lifestyle essentials designed to create spaces you'll love.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/categories"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Browse Categories
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">Free Shipping</p>
                  <p className="text-xs text-neutral-500">On orders $100+</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">Secure Payment</p>
                  <p className="text-xs text-neutral-500">100% protected</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <RotateCcw className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">Easy Returns</p>
                  <p className="text-xs text-neutral-500">30-day policy</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Headphones className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">24/7 Support</p>
                  <p className="text-xs text-neutral-500">Always here to help</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop"
                  alt="Beautiful modern living room"
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                />
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9/5</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm font-medium text-neutral-700">10k+ Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Explore our carefully curated categories to find the perfect pieces for every room in your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Furniture Category */}
            <Link
              to="/categories/furniture"
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square relative">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"
                  alt="Furniture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Furniture</h3>
                  <p className="text-sm opacity-90">Living room, bedroom & dining</p>
                </div>
              </div>
            </Link>

            {/* Home Decor Category */}
            <Link
              to="/categories/home-decor"
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square relative">
                <img
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop"
                  alt="Home Decor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Home Decor</h3>
                  <p className="text-sm opacity-90">Art, lighting & accessories</p>
                </div>
              </div>
            </Link>

            {/* Kitchen & Dining Category */}
            <Link
              to="/categories/kitchen-dining"
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square relative">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"
                  alt="Kitchen & Dining"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Kitchen & Dining</h3>
                  <p className="text-sm opacity-90">Cookware & dinnerware</p>
                </div>
              </div>
            </Link>

            {/* Bedding & Bath Category */}
            <Link
              to="/categories/bedding-bath"
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square relative">
                <img
                  src="https://images.unsplash.com/photo-1505691723518-36a1bcb13fc8?w=400&h=400&fit=crop"
                  alt="Bedding & Bath"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Bedding & Bath</h3>
                  <p className="text-sm opacity-90">Comfort & style</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 lg:py-24 bg-neutral-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Handpicked favorites that our customers love. Discover what makes each piece special.
            </p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 lg:py-24 bg-primary-500">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay in Style
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest collections, design tips, and exclusive offers.
            </p>
            <form className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-neutral-900 text-white rounded-r-lg hover:bg-neutral-800 transition-colors duration-200 font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;