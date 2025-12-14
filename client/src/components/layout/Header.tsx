import React, { useEffect, useState } from 'react';
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
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();

  const cartItemCount = cartStore.summary?.itemCount ?? 0;
  const wishlistCount = wishlistStore.items?.length ?? 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesService.getCategories();
        setCategories(res?.data?.categories ?? []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="bg-primary-500 text-white text-center py-2 text-sm">
        Free shipping on orders over $100
      </div>

      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">
              Modahaus
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="font-medium text-neutral-700 hover:text-primary-500"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="relative p-2">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="badge">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="badge">{cartItemCount}</span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2">
                  <User className="w-6 h-6" />
                  <span>{user.firstName}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded opacity-0 group-hover:opacity-100">
                  <Link to="/profile" className="dropdown-link">
                    Profile
                  </Link>
                  <Link to="/orders" className="dropdown-link">
                    Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="dropdown-link text-error"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;