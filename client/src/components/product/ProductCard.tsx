import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  primaryImage?: string;
  primaryImageAlt?: string;
  category?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { addToCart } = useCartStore(); // Do NOT use global isLoading for product buttons
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore() || { items: [] };

  // Local loading state per card
  const [isAdding, setIsAdding] = useState(false);

  const isInWishlist = wishlistItems.some(item => item.productId === product.id);

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) /
          product.compareAtPrice!) *
          100
      )
    : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // navigate only if user didn't click a button
    if (!(e.target instanceof HTMLButtonElement || (e.target as HTMLElement).closest('button'))) {
      navigate(`/products/${product.slug}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsAdding(true);
      await addToCart(product.id, 1);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch {
      /* Store handles errors */
    }
  };

  return (
    <div
      className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden bg-neutral-100">
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.primaryImageAlt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-400 text-sm">No image</span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3">
            <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={!user}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors duration-200 opacity-0 group-hover:opacity-100 pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart
            className={`w-4 h-4 ${
              isInWishlist
                ? 'fill-red-500 text-red-500'
                : 'text-neutral-600'
            }`}
          />
        </button>

        {/* Quick Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !user}
          className="absolute bottom-3 left-3 right-3 bg-primary-500 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 disabled:opacity-50 pointer-events-auto disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <div className="flex items-center justify-center">
              <div className="spinner w-4 h-4 mr-2"></div>
              Adding...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Quick Add
            </div>
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
            {product.category?.name || 'Modahaus'}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-neutral-600">{product.rating}</span>
            <span className="text-xs text-neutral-400">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-500 transition-colors duration-200">
          {product.name}
        </h3>

        {product.shortDescription && (
          <p className="text-sm text-neutral-600 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-neutral-900">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                ${product.compareAtPrice?.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;