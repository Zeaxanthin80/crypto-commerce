import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight, FiBriefcase, FiFileText, FiDollarSign } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function VendorRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    businessName: '',
    businessDescription: '',
    taxId: '',
    walletAddress: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.businessName || !formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.walletAddress) {
      setError('A wallet address is required to receive cryptocurrency payments');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      // In a real app, this would make an API request to register the vendor
      // const response = await fetch(`${process.env.API_URL}/auth/vendor-register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     firstName: formData.firstName,
      //     lastName: formData.lastName,
      //     email: formData.email,
      //     password: formData.password,
      //     phoneNumber: formData.phoneNumber,
      //     businessName: formData.businessName,
      //     businessDescription: formData.businessDescription,
      //     taxId: formData.taxId,
      //     walletAddress: formData.walletAddress
      //   })
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.message || 'Vendor registration failed');
      // }
      
      // Mock successful registration for demonstration
      setTimeout(() => {
        // Store token and user data in local storage
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          walletAddress: formData.walletAddress,
          role: 'vendor'
        }));
        
        // Redirect to the vendor dashboard
        router.push('/vendor/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Vendor registration error:', error);
      setError(error.message || 'Failed to register as a vendor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-2 text-center">Vendor Registration</h1>
            <p className="text-gray-600 text-center mb-6">Start selling your products on our crypto-commerce platform</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Business Information</h2>
                
                <div className="mb-4">
                  <label htmlFor="businessName" className="block mb-2 font-medium text-gray-700">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FiBriefcase />
                    </span>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Business Name LLC"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="businessDescription" className="block mb-2 font-medium text-gray-700">
                    Business Description
                  </label>
                  <textarea
                    id="businessDescription"
                    name="businessDescription"
                    rows="3"
                    className="w-full py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your business and the products you sell..."
                    value={formData.businessDescription}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="taxId" className="block mb-2 font-medium text-gray-700">
                      Tax ID / Business Registration Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FiFileText />
                      </span>
                      <input
                        type="text"
                        id="taxId"
                        name="taxId"
                        className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="XX-XXXXXXX"
                        value={formData.taxId}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="walletAddress" className="block mb-2 font-medium text-gray-700">
                      Crypto Wallet Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FiDollarSign />
                      </span>
                      <input
                        type="text"
                        id="walletAddress"
                        name="walletAddress"
                        className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                        value={formData.walletAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      This wallet will receive payments for your products. Make sure it supports USDT.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block mb-2 font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FiUser />
                      </span>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block mb-2 font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FiUser />
                      </span>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FiMail />
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phoneNumber" className="block mb-2 font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FiPhone />
                    </span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (123) 456-7890"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Security</h2>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Password must be at least 8 characters long.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FiLock />
                    </span>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full py-3 px-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</Link>, <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>, and <Link href="/vendor-agreement" className="text-blue-600 hover:text-blue-800">Vendor Agreement</Link>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-200 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating vendor account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Create Vendor Account <FiArrowRight className="ml-2" />
                  </span>
                )}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have a vendor account?{' '}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
