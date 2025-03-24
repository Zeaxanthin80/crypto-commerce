import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      // In a real app, this would make an API request to register the user
      // const response = await fetch(`${process.env.API_URL}/auth/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     firstName: formData.firstName,
      //     lastName: formData.lastName,
      //     email: formData.email,
      //     password: formData.password,
      //     phoneNumber: formData.phoneNumber
      //   })
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.message || 'Registration failed');
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
          role: 'customer'
        }));
        
        // Redirect to the account page
        router.push('/account');
      }, 1000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Create an Account</h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
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
                    I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>
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
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Create Account <FiArrowRight className="ml-2" />
                  </span>
                )}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 mb-4">Or sign up with</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="py-3 px-4 border border-gray-300 rounded-md flex justify-center items-center text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 24 24">
                    <path d="M12.545 12.151L12.545 15.964L16.970 15.964C16.641 17.191 15.601 19.250 12.545 19.250C9.936 19.250 7.808 17.116 7.808 14.500C7.808 11.884 9.936 9.750 12.545 9.750C14.117 9.750 15.196 10.446 15.837 11.064L18.847 8.153C17.173 6.574 15.023 5.750 12.545 5.750C7.697 5.750 3.749 9.694 3.749 14.500C3.749 19.306 7.697 23.250 12.545 23.250C17.667 23.250 20.995 19.726 20.995 14.636C20.995 14.034 20.933 13.635 20.868 13.250L12.545 13.250V13.250 12.151z" />
                    <path d="M22.955 13.250L22.955 10.750L20.500 10.750L20.500 13.250L17.955 13.250L17.955 15.750L20.500 15.750L20.500 18.250L22.955 18.250L22.955 15.750L25.500 15.750L25.500 13.250" />
                  </svg>
                  Google
                </button>
                
                <button
                  type="button"
                  className="py-3 px-4 border border-gray-300 rounded-md flex justify-center items-center text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
