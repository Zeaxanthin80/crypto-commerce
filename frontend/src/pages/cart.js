import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // In a real app, cart data might come from local storage or an API
    const fetchCartItems = async () => {
      try {
        // Mock data from local storage
        const storedCart = localStorage.getItem('cart') 
          ? JSON.parse(localStorage.getItem('cart')) 
          : [];
        
        if (storedCart.length === 0) {
          // If no items in cart, add some mock products for demonstration
          const mockCart = [
            {
              id: 1,
              name: 'Wireless Bluetooth Headphones',
              price: 79.99,
              quantity: 1,
              image: 'https://via.placeholder.com/150',
              vendor: 'AudioTech',
              stock: 15
            },
            {
              id: 2,
              name: 'Smart Watch Series 5',
              price: 199.99,
              quantity: 2,
              image: 'https://via.placeholder.com/150',
              vendor: 'TechGadgets',
              stock: 8
            }
          ];
          
          setCartItems(mockCart);
          localStorage.setItem('cart', JSON.stringify(mockCart));
        } else {
          setCartItems(storedCart);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
        setIsLoading(false);
      }
    };
    
    fetchCartItems();
  }, []);

  useEffect(() => {
    // Calculate subtotal whenever cart items change
    const calculateSubtotal = () => {
      const total = cartItems.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
      }, 0);
      setSubtotal(total);
    };
    
    calculateSubtotal();
    
    // Save to local storage whenever cart changes
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  const handleQuantityChange = (id, change) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          // Don't exceed available stock
          return {
            ...item,
            quantity: Math.min(newQuantity, item.stock)
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    
    // Mock coupon code validation
    if (couponCode.toLowerCase() === 'discount10') {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      alert('Coupon applied successfully!');
    } else {
      setDiscount(0);
      alert('Invalid coupon code.');
    }
  };
  
  const handleCheckout = () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    
    if (!user) {
      // Redirect to login with return URL to checkout
      router.push('/auth/login?returnUrl=/checkout');
      return;
    }
    
    // Otherwise proceed to checkout
    router.push('/checkout');
  };

  const total = subtotal - discount;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
              <Link href="/products">
                <span className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200">
                  Continue Shopping
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Cart Items ({cartItems.length})</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6 flex flex-col md:flex-row items-start md:items-center">
                        <div className="w-full md:w-auto mb-4 md:mb-0 md:mr-6">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">Sold by: {item.vendor}</p>
                          <p className="text-sm text-gray-500 mb-4">
                            {item.stock > 3 
                              ? <span className="text-green-600">In Stock ({item.stock} available)</span>
                              : <span className="text-orange-500">Only {item.stock} left in stock</span>
                            }
                          </p>
                          
                          <div className="flex flex-wrap items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded-md mb-2 md:mb-0">
                              <button 
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                aria-label="Decrease quantity"
                              >
                                <FiMinus />
                              </button>
                              <span className="px-4 py-1 text-gray-700">{item.quantity}</span>
                              <button 
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                aria-label="Increase quantity"
                                disabled={item.quantity >= item.stock}
                              >
                                <FiPlus />
                              </button>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="font-semibold text-lg mr-4">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveItem(item.id)}
                                aria-label="Remove item"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Coupon Code</h2>
                  <form onSubmit={handleCouponSubmit} className="flex">
                    <input
                      type="text"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition duration-200"
                    >
                      Apply
                    </button>
                  </form>
                  <p className="mt-2 text-sm text-gray-500">
                    Try "DISCOUNT10" for 10% off your order
                  </p>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                  
                  <div className="mb-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-xl">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Payment with:</p>
                    <div className="flex space-x-2">
                      <div className="border border-gray-300 rounded px-3 py-2 text-sm flex items-center">
                        <span className="font-medium">USDT</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout <FiArrowRight className="ml-2" />
                  </button>
                  
                  <div className="mt-6">
                    <Link href="/products">
                      <span className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Continue Shopping
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
