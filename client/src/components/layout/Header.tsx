import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { categoriesService } from '@/services/categoriesService';

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { summary: cartSummary } = useCartStore();
  const { items: wishlistItems } = useWishlistStore() || { items: [] };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cartSummary?.itemCount || 0;
  const wishlistCount = wishlistItems.length;

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-primary-500 text-white text-center py-2 text-sm">
        Free shipping on orders over $100
      </div>

      {/* Main Header */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">Modahaus</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {categories.slice(0, 4).map((category) => (
              <div key={category.id} className="relative group">
                <Link
                  to={`/categories/${category.slug}`}
                  className="text-neutral-700 hover:text-primary-500 font-medium transition-colors duration-200"
                >
                  {category.name}
                </Link>
                
                {/* Dropdown for subcategories */}
                {category.subcategories.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <Link
                        to={`/categories/${category.slug}`}
                        className="block px-3 py-2 text-sm font-semibold text-neutral-900 hover:text-primary-500 transition-colors duration-200"
                      >
                        All {category.name}
                      </Link>
                      <div className="border-t border-neutral-200 my-2"></div>
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          to={`/categories/${category.slug}/${subcategory.slug}`}
                          className="block px-3 py-2 text-sm text-neutral-600 hover:text-primary-500 transition-colors duration-200"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <label htmlFor="desktop-search" className="sr-only">Search products</label>
              <input
                id="desktop-search"
                name="desktop-search"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-neutral-700 hover:text-primary-500 transition-colors duration-200"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative p-2 text-neutral-700 hover:text-primary-500 transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button 
                  aria-label={`Open ${user.firstName}'s menu`}
                  className="flex items-center space-x-2 p-2 text-neutral-700 hover:text-primary-500 transition-colors duration-200">
                  <User className="w-6 h-6" />
                  <span className="hidden md:block font-medium">
                    {user.firstName}
                  </span>
                </button>
                
                {/* User Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-primary-500 rounded transition-colors duration-200"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-primary-500 rounded transition-colors duration-200"
                    >
                      My Orders
                    </Link>
                    <div className="border-t border-neutral-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-sm text-error hover:bg-red-50 rounded transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-neutral-700 hover:text-primary-500 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <span className="text-neutral-400">|</span>
                <Link
                  to="/register"
                  className="text-neutral-700 hover:text-primary-500 font-medium transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close main menu' : 'Open main menu'}
              className="lg:hidden p-2 text-neutral-700 hover:text-primary-500 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-200">
          <div className="container-custom py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <label htmlFor="mobile-search" className="sr-only">Search products</label>
                <input
                  id="mobile-search"
                  name="mobile-search"
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              {categories.map((category) => (
                <div key={category.id}>
                  <Link
                    to={`/categories/${category.slug}`}
                    className="block font-medium text-neutral-900 hover:text-primary-500 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {category.subcategories.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          to={`/categories/${category.slug}/${subcategory.slug}`}
                          className="block text-sm text-neutral-600 hover:text-primary-500 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;