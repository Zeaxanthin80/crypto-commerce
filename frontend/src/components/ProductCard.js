import React from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }

        alert('Product added to cart!');
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    } else {
      // Handle guest cart with localStorage
      const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
      
      // Check if product is already in cart
      const existingProductIndex = cart.findIndex(item => item.productId === product.id);
      
      if (existingProductIndex >= 0) {
        // Update quantity if product exists
        cart[existingProductIndex].quantity += 1;
      } else {
        // Add new product
        cart.push({
          productId: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          image: product.image_urls[0] || 'https://via.placeholder.com/300x300',
          vendor: product.vendor.business_name,
          quantity: 1,
          stock: product.inventory_count || 0
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Product added to cart!');
    }
  };

  const handleAddToWishlist = () => {
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
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      // Remove from wishlist if already exists
      wishlist = wishlist.filter(item => item.id !== product.id);
      alert(`${product.name} removed from wishlist!`);
    } else {
      // Add new item to wishlist
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.image_urls[0] || 'https://via.placeholder.com/300x300',
        vendor: product.vendor.business_name
      });
      alert(`${product.name} added to wishlist!`);
    }
    
    // Save updated wishlist to local storage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      <Link href={`/product/${product.id}`}>
        <div className="relative pb-[75%] overflow-hidden">
          <img
            src={product.image_urls?.[0] || 'https://via.placeholder.com/300x300'}
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-medium mb-1 hover:text-blue-600 transition duration-200">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex mr-1">
            {Array(5).fill().map((_, i) => (
              <FiStar 
                key={i} 
                className={`h-4 w-4 ${i < (product.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleAddToWishlist}
              className="p-2 text-gray-500 hover:text-red-500 transition duration-200"
              aria-label="Add to wishlist"
            >
              <FiHeart />
            </button>
            <button 
              onClick={handleAddToCart}
              className="p-2 text-gray-500 hover:text-blue-600 transition duration-200"
              aria-label="Add to cart"
              disabled={!product.inventory_count}
            >
              <FiShoppingCart />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
