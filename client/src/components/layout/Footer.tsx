import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">Modahaus</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Transform your house into a home with our curated collection of beautiful furniture, 
              home decor, and lifestyle essentials.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/furniture"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/home-decor"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Home Decor
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/kitchen-dining"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Kitchen & Dining
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/bedding-bath"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Bedding & Bath
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/size-guide"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">
                  123 Design Street<br />
                  Creative District<br />
                  San Francisco, CA 94107
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">
                  hello@modahaus.com
                </span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Newsletter</h4>
              <form className="flex">
                <label htmlFor="newsletter-email-footer" className="sr-only">Enter your email</label>
                <input
                  id="newsletter-email-footer"
                  name="newsletter-email"
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-l-lg text-sm focus:outline-none focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors duration-200 text-sm font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-neutral-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-neutral-400 text-sm">
              © 2024 Modahaus. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link
                to="/privacy"
                className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
              <Link
                to="/accessibility"
                className="text-neutral-400 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-neutral-800 py-4">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-neutral-500 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success rounded"></div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success rounded"></div>
              <span>Free Shipping $100+</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success rounded"></div>
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success rounded"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;