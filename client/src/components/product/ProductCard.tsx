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
  const { addToCart } = useCartStore();
  const wishlistStore = useWishlistStore();

  const wishlistItems = wishlistStore.items ?? [];

  const [isAdding, setIsAdding] = useState(false);

  const isInWishlist = wishlistItems.some(
    item => item.productId === product.id
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
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

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

    if (!user) {
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      await wishlistStore.removeFromWishlist(product.id);
    } else {
      await wishlistStore.addToWishlist(product.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer"
    >
      <div className="aspect-square relative bg-neutral-100">
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.primaryImageAlt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            No image
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-error text-white text-xs px-2 py-1 rounded">
            -{discountPercentage}%
          </span>
        )}

        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow"
        >
          <Heart
            className={`w-4 h-4 ${
              isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600'
            }`}
          />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="absolute bottom-3 left-3 right-3 bg-primary-500 text-white py-2 rounded"
        >
          {isAdding ? 'Adding…' : 'Quick Add'}
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {product.rating} ({product.reviewCount})
        </div>
        <div className="mt-2 font-bold">
          ${product.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;