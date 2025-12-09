import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-neutral-600 text-lg mb-8">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center w-full"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <Link
            to="/products"
            className="btn-secondary inline-flex items-center justify-center w-full"
          >
            <Search className="w-5 h-5 mr-2" />
            Browse Products
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500">
            Need help?{' '}
            <a href="/contact" className="text-primary-500 hover:text-primary-600 font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;