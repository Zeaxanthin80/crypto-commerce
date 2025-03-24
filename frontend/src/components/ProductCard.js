import React from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';

export default function ProductCard({ product }) {
  // Extract product data with fallbacks
  const {
    id,
    name,
    price = 0,
    currency = 'USDT',
    image_urls = [],
    average_rating = 0,
    vendor = { business_name: 'Unknown Vendor' }
  } = product || {};

  // Function to render star ratings
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={`star-${i}`} className="text-yellow-400 fill-current" />);
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative">
          <FiStar className="text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <FiStar className="text-yellow-400 fill-current" />
          </div>
        </div>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  // Add to cart function
  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get existing cart from local storage or initialize empty array
    let cart = [];
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        cart = JSON.parse(storedCart);
      }
    } catch (error) {
      console.error('Error parsing cart data', error);
    }
    
    // Check if product is already in cart
    const existingProductIndex = cart.findIndex(item => item.id === id);
    
    if (existingProductIndex >= 0) {
      // Increment quantity if product already exists
      cart[existingProductIndex].quantity += 1;
    } else {
      // Add new item to cart
      cart.push({
        id,
        name,
        price,
        currency,
        image: image_urls[0] || 'https://via.placeholder.com/300x300',
        vendor: vendor.business_name,
        quantity: 1
      });
    }
    
    // Save updated cart to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification (in a real app, this would update a state in a context)
    alert(`${name} added to cart!`);
  };

  // Add to wishlist function
  const addToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get existing wishlist from local storage or initialize empty array
    let wishlist = [];
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        wishlist = JSON.parse(storedWishlist);
      }
    } catch (error) {
      console.error('Error parsing wishlist data', error);
    }
    
    // Check if product is already in wishlist
    const existingProductIndex = wishlist.findIndex(item => item.id === id);
    
    if (existingProductIndex >= 0) {
      // Remove from wishlist if already exists
      wishlist = wishlist.filter(item => item.id !== id);
      alert(`${name} removed from wishlist!`);
    } else {
      // Add new item to wishlist
      wishlist.push({
        id,
        name,
        price,
        currency,
        image: image_urls[0] || 'https://via.placeholder.com/300x300',
        vendor: vendor.business_name
      });
      alert(`${name} added to wishlist!`);
    }
    
    // Save updated wishlist to local storage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  if (!product) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/products/${id}`} className="block">
        <div className="relative pb-[100%] overflow-hidden bg-gray-100">
          <img
            src={image_urls[0] || 'https://via.placeholder.com/300x300'}
            alt={name}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          <button
            onClick={addToWishlist}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Add to wishlist"
          >
            <FiHeart className="text-gray-600 hover:text-red-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Vendor name */}
          <p className="text-sm text-gray-500 mb-1">{vendor.business_name}</p>
          
          {/* Product name */}
          <h3 className="text-lg font-medium mb-1 line-clamp-2 h-14">{name}</h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex mr-1">
              {renderRatingStars(average_rating)}
            </div>
            <span className="text-sm text-gray-500">({average_rating.toFixed(1)})</span>
          </div>
          
          {/* Price */}
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">
              {price.toFixed(2)} <span className="text-sm font-normal">{currency}</span>
            </div>
            
            <button
              onClick={addToCart}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              aria-label="Add to cart"
            >
              <FiShoppingCart size={18} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
