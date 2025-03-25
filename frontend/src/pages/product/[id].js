import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  
  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        // In a real app, we would fetch from the API
        // const response = await fetch(`${process.env.API_URL}/products/${id}`);
        // const data = await response.json();
        
        // Mock data
        setTimeout(() => {
          const mockProduct = {
            id: parseInt(id),
            name: `Professional Bluetooth Headphones`,
            description: 'High-quality wireless headphones with noise cancellation technology, perfect for music lovers and professionals. Features include 30-hour battery life, comfortable ear cushions, and crystal-clear sound quality.',
            price: 129.99,
            discountPrice: 99.99,
            images: [
              'https://via.placeholder.com/600x600?text=Headphones+Main',
              'https://via.placeholder.com/600x600?text=Headphones+Side',
              'https://via.placeholder.com/600x600?text=Headphones+Back',
              'https://via.placeholder.com/600x600?text=Headphones+Detail'
            ],
            category: 'Electronics',
            rating: 4.5,
            reviewCount: 128,
            vendor: 'AudioTech',
            vendorId: 12,
            stock: 15,
            sku: 'BH-1000-BLK',
            features: [
              'Active Noise Cancellation',
              'Bluetooth 5.0 Technology',
              '30-hour Battery Life',
              'Quick Charge (10min for 5hrs)',
              'Built-in Microphone',
              'Voice Assistant Compatible'
            ],
            specifications: {
              'Brand': 'AudioTech',
              'Model': 'BH-1000',
              'Connectivity': 'Bluetooth 5.0',
              'Battery': '800mAh Lithium-ion',
              'Charging Time': '2 hours',
              'Wireless Range': 'Up to 33 feet (10m)',
              'Weight': '250g',
              'Dimensions': '7.5 x 6.1 x 3.2 inches',
              'Warranty': '1 Year Manufacturer Warranty'
            },
            reviews: [
              {
                id: 1,
                user: 'John D.',
                rating: 5,
                date: '2023-06-15',
                title: 'Best headphones I\'ve owned',
                comment: 'The sound quality is amazing and battery life is impressive. Comfortable for long listening sessions.'
              },
              {
                id: 2,
                user: 'Sarah M.',
                rating: 4,
                date: '2023-05-22',
                title: 'Great value for money',
                comment: 'These headphones perform really well. The noise cancellation is effective, though not perfect in very noisy environments.'
              }
            ]
          };
          
          setProduct(mockProduct);
          setIsLoading(false);
          
          // Mock related products
          const mockRelated = Array(4).fill().map((_, index) => ({
            id: 100 + index,
            name: `Related Product ${index + 1}`,
            price: Math.floor(Math.random() * (200 - 50 + 1) + 50),
            image: `https://via.placeholder.com/300x300?text=Related+${index + 1}`,
            category: 'Electronics',
            rating: Math.floor(Math.random() * 5) + 1
          }));
          
          setRelatedProducts(mockRelated);
        }, 800);
        
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  useEffect(() => {
    if (product && mainImage === '') {
      setMainImage(product.images[0]);
    }
  }, [product, mainImage]);
  
  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    if (product && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

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
            quantity
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
        cart[existingProductIndex].quantity += quantity;
      } else {
        // Add new product
        cart.push({
          productId: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          image: product.images[0],
          vendor: product.vendor,
          quantity: quantity,
          stock: product.stock
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Product added to cart!');
    }
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = () => {
    if (!product) return;
    
    const wishlist = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist')) : [];
    
    // Check if product is already in wishlist
    const existingProduct = wishlist.find(item => item.id === product.id);
    
    if (!existingProduct) {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images[0],
        vendor: product.vendor
      });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      alert('Product added to wishlist!');
    } else {
      alert('Product is already in your wishlist!');
    }
  };
  
  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 md:pr-8">
                  <div className="bg-gray-300 h-96 rounded-lg"></div>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-gray-300 h-24 rounded-lg"></div>
                    ))}
                  </div>
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0">
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-6"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
                  <div className="h-10 bg-gray-300 rounded w-full mb-6"></div>
                  <div className="h-12 bg-gray-300 rounded w-full mb-4"></div>
                  <div className="h-12 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you are looking for does not exist or has been removed.</p>
            <Link href="/products">
              <span className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200">
                Continue Shopping
              </span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center text-sm text-gray-500">
            <Link href="/">
              <span className="hover:text-blue-600">Home</span>
            </Link>
            <FiChevronRight className="mx-2" />
            <Link href="/products">
              <span className="hover:text-blue-600">Products</span>
            </Link>
            <FiChevronRight className="mx-2" />
            <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
              <span className="hover:text-blue-600">{product.category}</span>
            </Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-700">{product.name}</span>
          </div>
          
          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div>
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="relative pb-[100%] overflow-hidden rounded-lg">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`bg-white p-2 rounded-lg shadow-sm ${image === mainImage ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setMainImage(image)}
                  >
                    <div className="relative pb-[100%] overflow-hidden rounded-md">
                      <img
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Info */}
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {Array(5).fill().map((_, i) => {
                      const starValue = i + 1;
                      const rating = product.rating;
                      
                      // For half stars
                      if (rating >= starValue - 0.5 && rating < starValue) {
                        return (
                          <span key={i} className="text-yellow-400 relative">
                            <FiStar className="fill-current mr-1" />
                            <FiStar className="absolute top-0 left-0 mr-1 w-1/2 overflow-hidden fill-current" />
                          </span>
                        );
                      }
                      
                      return (
                        <FiStar
                          key={i}
                          className={`mr-1 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
                </div>
                
                <div className="mb-4">
                  <Link href={`/vendor/${product.vendorId}`}>
                    <span className="text-blue-600 hover:underline">Sold by: {product.vendor}</span>
                  </Link>
                </div>
                
                <div className="mb-6">
                  {product.discountPrice ? (
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-gray-900 mr-3">${product.discountPrice.toFixed(2)}</span>
                      <span className="text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                      <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded">
                        Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-500 text-sm">SKU: {product.sku}</div>
                </div>
                
                {product.stock > 0 && (
                  <div className="mb-6">
                    <label htmlFor="quantity" className="block font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-l-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center border-y border-gray-300 py-2"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-r-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex items-center justify-center py-3 px-4 rounded-md transition-colors duration-200 ${
                      product.stock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className={`flex items-center justify-center py-3 px-4 rounded-md transition-colors duration-200 ${
                      product.stock > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
                
                <div className="flex space-x-4 mb-6">
                  <button
                    type="button"
                    onClick={handleAddToWishlist}
                    className="flex items-center text-gray-600 hover:text-red-600"
                  >
                    <FiHeart className="mr-1" />
                    <span>Add to Wishlist</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <FiShare2 className="mr-1" />
                    <span>Share</span>
                  </button>
                </div>
                
                {product.features && product.features.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Key Features:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Product Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-12">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'description'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'specifications'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('specifications')}
                >
                  Specifications
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'reviews'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({product.reviews.length})
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
              
              {activeTab === 'specifications' && (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/3">
                            {key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                    
                    <div className="flex items-center mb-6">
                      <div className="mr-4">
                        <div className="text-5xl font-bold text-gray-900">{product.rating}</div>
                        <div className="flex mt-2">
                          {Array(5).fill().map((_, i) => (
                            <FiStar
                              key={i}
                              className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{product.reviewCount} reviews</div>
                      </div>
                      
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = product.reviews.filter(review => Math.floor(review.rating) === star).length;
                          const percentage = (count / product.reviews.length) * 100;
                          
                          return (
                            <div key={star} className="flex items-center mb-1">
                              <div className="w-10 text-gray-600 text-sm">{star} star</div>
                              <div className="w-full mx-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-10 text-gray-600 text-sm">{percentage.toFixed(0)}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <button
                      className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200"
                    >
                      Write a Review
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    {product.reviews.map(review => (
                      <div key={review.id} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold text-lg">{review.title}</h4>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {Array(5).fill().map((_, i) => (
                              <FiStar
                                key={i}
                                className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-700">{review.user}</span>
                        </div>
                        
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Related Products */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative pb-[75%] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/product/${product.id}`} className="block mb-1">
                      <h3 className="text-lg font-medium hover:text-blue-600 transition duration-200">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex mr-1">
                        {Array(5).fill().map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`h-4 w-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                      
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition duration-200"
                        aria-label="Add to cart"
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
