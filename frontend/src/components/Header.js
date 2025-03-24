import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Get cart count from local storage or context
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const cart = JSON.parse(storedCart);
        setCartCount(cart.length || 0);
      } catch (error) {
        console.error('Error parsing cart data', error);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            CryptoCommerce
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="hover:text-blue-600 transition duration-200">
              All Products
            </Link>
            <Link href="/categories" className="hover:text-blue-600 transition duration-200">
              Categories
            </Link>
            <Link href="/vendors" className="hover:text-blue-600 transition duration-200">
              Vendors
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition duration-200">
              About Us
            </Link>
          </nav>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={toggleSearch}
              className="text-gray-700 hover:text-blue-600 transition duration-200"
              aria-label="Search"
            >
              <FiSearch size={22} />
            </button>
            
            <Link href="/wishlist" className="text-gray-700 hover:text-blue-600 transition duration-200 relative">
              <FiHeart size={22} />
            </Link>
            
            <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition duration-200 relative">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <div className="relative">
              {isLoggedIn ? (
                <Link href="/account" className="text-gray-700 hover:text-blue-600 transition duration-200">
                  <FiUser size={22} />
                </Link>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={toggleMenu}
            aria-label="Open Menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Search Bar (only visible when search is open) */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition duration-200"
              >
                <FiSearch size={20} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu (only visible when menu is open) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col">
            <Link 
              href="/products" 
              className="px-4 py-3 hover:bg-gray-100 transition duration-200 border-b border-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </Link>
            <Link 
              href="/categories" 
              className="px-4 py-3 hover:bg-gray-100 transition duration-200 border-b border-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/vendors" 
              className="px-4 py-3 hover:bg-gray-100 transition duration-200 border-b border-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Vendors
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-3 hover:bg-gray-100 transition duration-200 border-b border-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/wishlist" 
              className="px-4 py-3 hover:bg-gray-100 transition duration-200 border-b border-gray-200 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiHeart size={18} className="mr-2" /> Wishlist
            </Link>
            <Link 
              href="/cart" 
              className="px-4 py-3 hover:bg-gray-100 transition duration-200 border-b border-gray-200 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiShoppingCart size={18} className="mr-2" /> Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link 
              href={isLoggedIn ? "/account" : "/auth/login"} 
              className="px-4 py-3 hover:bg-gray-100 transition duration-200 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiUser size={18} className="mr-2" /> {isLoggedIn ? "My Account" : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
