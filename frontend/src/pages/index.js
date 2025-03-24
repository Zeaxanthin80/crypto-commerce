import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CategoryList from '../components/CategoryList';
import Footer from '../components/Footer';
import Banner from '../components/Banner';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, these would fetch from the API
    const fetchFeaturedProducts = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch(`${process.env.API_URL}/products/featured`);
        // const data = await response.json();
        
        // Placeholder data for demonstration
        const placeholderProducts = [
          {
            id: 1,
            name: 'Wireless Earbuds',
            price: 129.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.5,
            vendor: { business_name: 'Tech World' }
          },
          {
            id: 2,
            name: 'Smart Watch Series 5',
            price: 249.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.2,
            vendor: { business_name: 'Gadget Store' }
          },
          {
            id: 3,
            name: 'Wireless Charging Pad',
            price: 39.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.0,
            vendor: { business_name: 'ElectroHub' }
          },
          {
            id: 4,
            name: 'Bluetooth Speaker',
            price: 79.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.7,
            vendor: { business_name: 'Sound Masters' }
          }
        ];
        setFeaturedProducts(placeholderProducts);
        
        // Different set for new arrivals
        const placeholderNewArrivals = [
          {
            id: 5,
            name: 'Ultra HD Monitor',
            price: 399.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.8,
            vendor: { business_name: 'Display Pro' }
          },
          {
            id: 6,
            name: 'Mechanical Keyboard',
            price: 129.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.6,
            vendor: { business_name: 'Gaming Zone' }
          },
          {
            id: 7,
            name: 'Ergonomic Mouse',
            price: 59.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.3,
            vendor: { business_name: 'Office Solutions' }
          },
          {
            id: 8,
            name: 'Noise-Cancelling Headphones',
            price: 199.99,
            currency: 'USDT',
            image_urls: ['https://via.placeholder.com/300x300'],
            average_rating: 4.9,
            vendor: { business_name: 'Audio Elite' }
          }
        ];
        setNewArrivals(placeholderNewArrivals);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Crypto Commerce - Shop with Cryptocurrency</title>
        <meta name="description" content="Shop online with cryptocurrency (USDT)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="flex-grow">
        {/* Hero Banner */}
        <Banner 
          title="Shop with Cryptocurrency"
          subtitle="Secure, Fast, and Convenient Shopping with USDT"
          imageUrl="https://via.placeholder.com/1200x400"
          buttonText="Shop Now"
          buttonLink="/products"
        />

        {/* Featured Categories */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
            <CategoryList />
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Crypto Payment Banner */}
        <section className="py-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Pay with Cryptocurrency</h2>
            <p className="text-xl mb-6">We accept USDT for all purchases. Fast, secure, and convenient.</p>
            <button className="bg-white text-blue-500 font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition duration-300">
              Learn More
            </button>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">New Arrivals</h2>
              <Link href="/products?sort=newest" className="text-blue-600 hover:text-blue-800 font-medium">
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Vendor Banner */}
        <section className="py-12 bg-gray-800 text-white">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Become a Vendor</h2>
              <p className="text-xl mb-6">Start selling your products on our platform and receive payments in USDT.</p>
              <Link href="/vendor/register" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300">
                Start Selling
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://via.placeholder.com/600x400" 
                alt="Become a vendor" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
