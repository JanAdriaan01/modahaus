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

  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);

  const wishlistItems = useWishlistStore((s) => s.items);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);

  const [isAdding, setIsAdding] = useState(false);

  const isInWishlist = wishlistItems.some(
    (item) => item.productId === product.id
  );

  const hasDiscount =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) /
          product.compareAtPrice!) *
          100
      )
    : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      !(e.target instanceof HTMLButtonElement ||
        (e.target as HTMLElement).closest('button'))
    ) {
      navigate(`/products/${product.slug}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

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

    if (!user) return;

    if (isInWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div
      className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="aspect-square relative bg-neutral-100 overflow-hidden">
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.primaryImageAlt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-error text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          disabled={!user}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
        >
          <Heart
            className={`w-4 h-4 ${
              isInWishlist
                ? 'fill-red-500 text-red-500'
                : 'text-neutral-600'
            }`}
          />
        </button>

        {/* Quick Add */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !user}
          className="absolute bottom-3 left-3 right-3 bg-primary-500 text-white py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
        >
          {isAdding ? 'Adding…' : (
            <span className="flex justify-center items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Quick Add
            </span>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{product.category?.name || 'Modahaus'}</span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <h3 className="font-semibold line-clamp-2">{product.name}</h3>

        {product.shortDescription && (
          <p className="text-sm text-neutral-600 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        <div className="flex gap-2 items-center pt-2">
          <span className="font-bold text-lg">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="line-through text-sm text-neutral-400">
              ${product.compareAtPrice!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;