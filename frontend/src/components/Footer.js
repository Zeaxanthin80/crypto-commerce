import React from 'react';
import Link from 'next/link';
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12">
      <div className="container mx-auto px-4">
        {/* Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">CryptoCommerce</h3>
            <p className="text-gray-400 mb-4">
              Shop securely with cryptocurrency. Fast, reliable, and convenient online shopping experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-gray-400 hover:text-white transition-colors">
                  Vendors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account & Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-400 hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-gray-400 hover:text-white transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-2 text-gray-400" />
                <span className="text-gray-400">123 Commerce St, Tech City, TC 10101</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2 text-gray-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2 text-gray-400" />
                <span className="text-gray-400">support@cryptocommerce.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 py-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Accepted Payment Methods</h3>
          <div className="flex justify-center space-x-6">
            <div className="text-gray-400 text-center">
              <div className="bg-gray-800 p-3 rounded-lg mb-2">
                <span className="font-medium">USDT</span>
              </div>
              <span className="text-xs">Tether</span>
            </div>
            <div className="text-gray-400 text-center">
              <div className="bg-gray-800 p-3 rounded-lg mb-2">
                <span className="font-medium">BTC</span>
              </div>
              <span className="text-xs">Bitcoin</span>
            </div>
            <div className="text-gray-400 text-center">
              <div className="bg-gray-800 p-3 rounded-lg mb-2">
                <span className="font-medium">ETH</span>
              </div>
              <span className="text-xs">Ethereum</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              &copy; {currentYear} CryptoCommerce. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
