import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiGrid, FiList, FiFilter, FiX, FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Products() {
  const router = useRouter();
  const { category, search } = router.query;
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('featured');
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // In a real app, we would fetch from the API with proper filters
        // const response = await fetch(`${process.env.API_URL}/products?category=${selectedCategory}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}&sort=${sortBy}`);
        // const data = await response.json();
        
        // Mock data
        setTimeout(() => {
          const mockProducts = Array(12).fill().map((_, index) => ({
            id: index + 1,
            name: `Product ${index + 1}`,
            description: 'This is a product description that showcases the features and benefits of this amazing product.',
            price: Math.floor(Math.random() * (500 - 10 + 1) + 10),
            image: `https://via.placeholder.com/300x300?text=Product+${index + 1}`,
            category: ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports & Outdoors'][Math.floor(Math.random() * 5)],
            rating: Math.floor(Math.random() * 5) + 1,
            reviewCount: Math.floor(Math.random() * 100),
            vendor: ['TechStore', 'FashionHub', 'HomeGoods', 'BookEmporium', 'SportShop'][Math.floor(Math.random() * 5)],
            inStock: Math.random() > 0.2
          }));
          
          // Filter based on category if one is selected
          const filtered = category && category !== 'all' 
            ? mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase())
            : mockProducts;
            
          // Filter based on search term if one is provided
          const searchFiltered = search
            ? filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || 
                                  p.description.toLowerCase().includes(search.toLowerCase()) ||
                                  p.category.toLowerCase().includes(search.toLowerCase()))
            : filtered;
          
          setProducts(searchFiltered);
          setIsLoading(false);
        }, 800);
        
        // Mock categories
        setCategories([
          { id: 'all', name: 'All Categories' },
          { id: 'electronics', name: 'Electronics' },
          { id: 'clothing', name: 'Clothing' },
          { id: 'home & kitchen', name: 'Home & Kitchen' },
          { id: 'books', name: 'Books' },
          { id: 'sports & outdoors', name: 'Sports & Outdoors' }
        ]);
        
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, search]);
  
  // Handle adding product to cart
  const handleAddToCart = (product) => {
    const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    
    // Check if product is already in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      // Update quantity
      cart[existingProductIndex].quantity += 1;
    } else {
      // Add new product
      cart.push({
        ...product,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
  };
  
  // Handle adding product to wishlist
  const handleAddToWishlist = (product) => {
    const wishlist = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist')) : [];
    
    // Check if product is already in wishlist
    const existingProduct = wishlist.find(item => item.id === product.id);
    
    if (!existingProduct) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      alert('Product added to wishlist!');
    } else {
      alert('Product is already in your wishlist!');
    }
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      router.push('/products');
    } else {
      router.push(`/products?category=${categoryId}`);
    }
  };
  
  // Handle price range change
  const handlePriceRangeChange = (e, index) => {
    const value = parseInt(e.target.value);
    const newRange = [...priceRange];
    newRange[index] = value;
    setPriceRange(newRange);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    
    // Sort products based on selection
    let sortedProducts = [...products];
    
    switch (value) {
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // For mock data this is random but in real app would sort by date
        sortedProducts.sort((a, b) => b.id - a.id);
        break;
      default:
        // 'featured' - no specific sorting for mock data
        break;
    }
    
    setProducts(sortedProducts);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {selectedCategory === 'all' ? 'All Products' : selectedCategory}
              </h1>
              <p className="text-gray-600">
                {products.length} results {search ? `for "${search}"` : ''}
              </p>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0">
              <div className="mr-6">
                <select
                  className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`py-2 px-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <FiGrid />
                </button>
                <button
                  className={`py-2 px-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <FiList />
                </button>
              </div>
              
              <button
                className="md:hidden ml-4 flex items-center text-gray-700 hover:text-blue-600"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? (
                  <>
                    <FiX className="mr-1" /> Close Filters
                  </>
                ) : (
                  <>
                    <FiFilter className="mr-1" /> Filters
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row">
            {/* Filters - Desktop */}
            <div className={`md:w-1/4 md:pr-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Categories</h2>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button
                        className={`text-left w-full hover:text-blue-600 ${selectedCategory === cat.id ? 'font-semibold text-blue-600' : 'text-gray-700'}`}
                        onClick={() => handleCategoryChange(cat.id)}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Price Range</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">${priceRange[0]}</span>
                    <span className="text-gray-700">${priceRange[1]}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(e, 0)}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(e, 1)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(e, 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 flex items-center">-</span>
                    <input
                      type="number"
                      min={priceRange[0]}
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(e, 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Rating</h2>
                <ul className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <li key={rating}>
                      <button className="flex items-center text-gray-700 hover:text-blue-600">
                        {Array(rating).fill().map((_, i) => (
                          <FiStar key={i} className="fill-current text-yellow-400" />
                        ))}
                        {Array(5 - rating).fill().map((_, i) => (
                          <FiStar key={i} className="text-gray-300" />
                        ))}
                        <span className="ml-2">{rating} & Up</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Products */}
            <div className="md:w-3/4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill().map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="animate-pulse">
                        <div className="bg-gray-300 h-48 w-full"></div>
                        <div className="p-4">
                          <div className="bg-gray-300 h-5 rounded w-3/4 mb-3"></div>
                          <div className="bg-gray-300 h-4 rounded w-1/2 mb-3"></div>
                          <div className="bg-gray-300 h-4 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <h2 className="text-2xl font-semibold mb-4">No products found</h2>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search term to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange([0, 1000]);
                      router.push('/products');
                    }}
                    className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
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
                        
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        
                        <div className="flex items-center mb-2">
                          <div className="flex mr-1">
                            {Array(5).fill().map((_, i) => (
                              <FiStar 
                                key={i} 
                                className={`h-4 w-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleAddToWishlist(product)}
                              className="p-2 text-gray-500 hover:text-red-500 transition duration-200"
                              aria-label="Add to wishlist"
                            >
                              <FiHeart />
                            </button>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="p-2 text-gray-500 hover:text-blue-600 transition duration-200"
                              aria-label="Add to cart"
                              disabled={!product.inStock}
                            >
                              <FiShoppingCart />
                            </button>
                          </div>
                        </div>
                        
                        {!product.inStock && (
                          <p className="text-red-500 text-sm mt-2">Out of stock</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                      <div className="flex flex-col md:flex-row">
                        <Link href={`/product/${product.id}`} className="md:w-1/3 xl:w-1/4">
                          <div className="relative pb-[75%] md:pb-0 md:h-full overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="absolute md:relative top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        
                        <div className="p-6 md:w-2/3 xl:w-3/4">
                          <Link href={`/product/${product.id}`} className="block mb-2">
                            <h3 className="text-xl font-medium hover:text-blue-600 transition duration-200">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <p className="text-sm text-gray-500 mb-2">
                            Category: {product.category} | Vendor: {product.vendor}
                          </p>
                          
                          <div className="flex items-center mb-3">
                            <div className="flex mr-1">
                              {Array(5).fill().map((_, i) => (
                                <FiStar 
                                  key={i} 
                                  className={`h-4 w-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
                          </div>
                          
                          <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                            
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleAddToWishlist(product)}
                                className="p-2 text-gray-500 hover:text-red-500 transition duration-200 border border-gray-200 rounded-full"
                                aria-label="Add to wishlist"
                              >
                                <FiHeart />
                              </button>
                              <button 
                                onClick={() => handleAddToCart(product)}
                                className={`flex items-center px-4 py-2 rounded-md transition duration-200 ${
                                  product.inStock 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!product.inStock}
                              >
                                <FiShoppingCart className="mr-1" />
                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  
                  <button className="px-4 py-2 border border-blue-600 rounded-md bg-blue-600 text-white">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    3
                  </button>
                  
                  <span className="px-2">...</span>
                  
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    10
                  </button>
                  
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
