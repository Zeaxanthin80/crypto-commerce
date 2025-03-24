import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCreditCard, FiUser, FiMapPin, FiPhone, FiMail, FiCopy, FiCheck } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [orderStep, setOrderStep] = useState('details'); // 'details', 'payment', 'confirmation'
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'processing', 'completed', 'failed'
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  // Mock payment data
  const platformWalletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const paymentAmount = (subtotal - discount).toFixed(2);
  const paymentReference = `ORDER-${Math.floor(Math.random() * 1000000)}`;

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    
    if (!user) {
      router.push('/auth/login?returnUrl=/checkout');
      return;
    }
    
    // Load cart items from local storage
    const storedCart = localStorage.getItem('cart') 
      ? JSON.parse(localStorage.getItem('cart')) 
      : [];
      
    if (storedCart.length === 0) {
      router.push('/cart');
      return;
    }
    
    setCartItems(storedCart);
    
    // Calculate subtotal
    const total = storedCart.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    setSubtotal(total);
    
    // Load user data if available
    const userData = JSON.parse(user);
    if (userData) {
      setFormData(prevData => ({
        ...prevData,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || ''
      }));
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    // Validate form data
    for (const key in formData) {
      if (formData[key] === '' && key !== 'phone') {
        alert('Please fill all required fields');
        return;
      }
    }
    
    // Move to payment step
    setOrderStep('payment');
    
    // In a real app, we would save the shipping details to the server here
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePaymentConfirmation = () => {
    // In a real app, this would verify the payment on the blockchain
    setPaymentStatus('processing');
    
    // Simulate payment verification
    setTimeout(() => {
      setPaymentStatus('completed');
      setOrderStep('confirmation');
      
      // Clear cart on successful payment
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Store order in order history
      const orderHistory = localStorage.getItem('orderHistory') 
        ? JSON.parse(localStorage.getItem('orderHistory')) 
        : [];
        
      const newOrder = {
        id: paymentReference,
        date: new Date().toISOString(),
        items: cartItems,
        total: paymentAmount,
        status: 'paid',
        shippingDetails: formData
      };
      
      orderHistory.push(newOrder);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${orderStep === 'details' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 ${orderStep === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="font-medium">Shipping Details</span>
              </div>
              <div className="flex-grow border-t border-gray-300 mx-4"></div>
              <div className={`flex items-center ${orderStep === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 ${orderStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="font-medium">Payment</span>
              </div>
              <div className="flex-grow border-t border-gray-300 mx-4"></div>
              <div className={`flex items-center ${orderStep === 'confirmation' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 ${orderStep === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="font-medium">Confirmation</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {orderStep === 'details' && (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                    <form onSubmit={handleDetailsSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="firstName" className="block mb-1 font-medium text-gray-700">First Name</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <FiUser />
                            </span>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full py-2 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="lastName" className="block mb-1 font-medium text-gray-700">Last Name</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <FiUser />
                            </span>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full py-2 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <FiMail />
                            </span>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full py-2 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">Phone (optional)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <FiPhone />
                            </span>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full py-2 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="address" className="block mb-1 font-medium text-gray-700">Address</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <FiMapPin />
                          </span>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full py-2 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label htmlFor="city" className="block mb-1 font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="state" className="block mb-1 font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="zipCode" className="block mb-1 font-medium text-gray-700">Zip Code</label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="country" className="block mb-1 font-medium text-gray-700">Country</label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Japan">Japan</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        Continue to Payment
                      </button>
                    </form>
                  </>
                )}
                
                {orderStep === 'payment' && (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Payment with USDT</h2>
                    
                    <div className="mb-6">
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-medium mb-4">Instructions:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                          <li>Send exactly <span className="font-semibold">{paymentAmount} USDT</span> to the platform wallet address below.</li>
                          <li>Include the payment reference in the transaction memo.</li>
                          <li>After sending the payment, click on "I've completed payment" button below.</li>
                          <li>Wait for payment confirmation (this may take 1-2 minutes).</li>
                        </ol>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block mb-2 font-medium text-gray-700">Platform Wallet Address</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={platformWalletAddress}
                          className="flex-grow py-3 px-4 bg-gray-100 border border-gray-300 rounded-l-md focus:outline-none"
                          readOnly
                        />
                        <button
                          onClick={() => copyToClipboard(platformWalletAddress)}
                          className="bg-gray-200 px-4 rounded-r-md hover:bg-gray-300 transition duration-200 flex items-center"
                        >
                          {copied ? <FiCheck className="text-green-600" /> : <FiCopy />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block mb-2 font-medium text-gray-700">Payment Reference</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={paymentReference}
                          className="flex-grow py-3 px-4 bg-gray-100 border border-gray-300 rounded-l-md focus:outline-none"
                          readOnly
                        />
                        <button
                          onClick={() => copyToClipboard(paymentReference)}
                          className="bg-gray-200 px-4 rounded-r-md hover:bg-gray-300 transition duration-200 flex items-center"
                        >
                          {copied ? <FiCheck className="text-green-600" /> : <FiCopy />}
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Important: Include this reference in your transaction</p>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block mb-2 font-medium text-gray-700">Amount to Send</label>
                      <div className="py-3 px-4 bg-gray-100 border border-gray-300 rounded-md font-semibold">
                        {paymentAmount} USDT
                      </div>
                    </div>
                    
                    <button
                      onClick={handlePaymentConfirmation}
                      className={`w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 ${
                        paymentStatus === 'processing' ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={paymentStatus === 'processing'}
                    >
                      {paymentStatus === 'processing' ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying Payment...
                        </span>
                      ) : (
                        "I've Completed Payment"
                      )}
                    </button>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => setOrderStep('details')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Back to Shipping Details
                      </button>
                    </div>
                  </>
                )}
                
                {orderStep === 'confirmation' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-600 mb-8">Your payment has been successfully processed</p>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Order Number:</span>
                        <span>{paymentReference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Amount Paid:</span>
                        <span>${paymentAmount} USDT</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-8">
                      We've sent a confirmation email to {formData.email} with all the details of your order.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push('/account/orders')}
                        className="bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        View My Orders
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        className="bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-md hover:bg-gray-300 transition duration-200"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="mb-4 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex py-4 border-b border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                        <p className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-4 space-y-2">
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
                  
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">${(subtotal - discount).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <FiCreditCard className="text-gray-500 mr-2" />
                    <span className="text-gray-700">Payment Method: USDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
