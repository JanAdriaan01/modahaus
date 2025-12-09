import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from 'react-toastify';

interface Product {
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
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
  
  const isInWishlist = wishlistItems.some(item => item.productId === product.id);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Error is handled in the store with toast
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
    } catch (error) {
      // Error is handled in the store with toast
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link to={`/products/${product.slug}`} className="block">
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
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors duration-200 opacity-0 group-hover:opacity-100"
          >
            <Heart 
              className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`} 
            />
          </button>
          
          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="absolute bottom-3 left-3 right-3 bg-primary-500 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 disabled:opacity-50"
          >
            {cartLoading ? (
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
              <span className="text-xs text-neutral-400">({product.reviewCount})</span>
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
      </Link>
    </div>
  );
};

export default ProductCard;