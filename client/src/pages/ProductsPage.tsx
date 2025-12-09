import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/apiService';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Filter, Grid, List, Search, SlidersHorizontal } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [sortBy, setSortBy] = React.useState('newest');

  // Fetch products with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { search: searchQuery, category: selectedCategory, sort: sortBy }],
    queryFn: () => productsService.getProducts({
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      sort: sortBy || undefined,
      limit: 20
    }),
  });

  const products = data?.products || [];

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            All Products
          </h1>
          <p className="text-neutral-600">
            Discover our complete collection of home and house goods
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 space-y-6">
            {/* Search */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === '' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  All Categories
                </button>
                <button
                  onClick={() => setSelectedCategory('1')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === '1' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Furniture
                </button>
                <button
                  onClick={() => setSelectedCategory('2')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === '2' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Home Decor
                </button>
                <button
                  onClick={() => setSelectedCategory('3')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === '3' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Kitchen & Dining
                </button>
                <button
                  onClick={() => setSelectedCategory('4')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === '4' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Bedding & Bath
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-neutral-600">Under $100</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-neutral-600">$100 - $500</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-neutral-600">$500 - $1,000</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-neutral-600">Over $1,000</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-neutral-600">
                    {products.length} products found
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                    <option value="rating_desc">Highest Rated</option>
                  </select>
                  
                  {/* View Mode Toggle */}
                  <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">Failed to load products. Please try again.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;