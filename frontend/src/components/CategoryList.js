import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    const fetchCategories = async () => {
      try {
        // Replace with actual API call in production
        // const response = await fetch(`${process.env.API_URL}/categories`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockCategories = [
          {
            id: 1,
            name: 'Electronics',
            image_url: 'https://via.placeholder.com/200x200',
            description: 'Latest gadgets and electronics'
          },
          {
            id: 2,
            name: 'Clothing',
            image_url: 'https://via.placeholder.com/200x200',
            description: 'Fashion and apparel'
          },
          {
            id: 3,
            name: 'Home & Kitchen',
            image_url: 'https://via.placeholder.com/200x200',
            description: 'Home appliances and kitchen essentials'
          },
          {
            id: 4,
            name: 'Books',
            image_url: 'https://via.placeholder.com/200x200',
            description: 'Books, ebooks and audiobooks'
          },
          {
            id: 5,
            name: 'Sports & Outdoors',
            image_url: 'https://via.placeholder.com/200x200',
            description: 'Sporting goods and outdoor gear'
          },
          {
            id: 6,
            name: 'Beauty & Personal Care',
            image_url: 'https://via.placeholder.com/200x200',
            description: 'Beauty products and personal care items'
          }
        ];
        
        setCategories(mockCategories);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-40 mb-2"></div>
            <div className="bg-gray-200 h-4 w-3/4 mb-1 rounded"></div>
            <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map(category => (
        <Link
          href={`/products?category=${category.id}`}
          key={category.id}
          className="group"
        >
          <div className="bg-white rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <div className="relative pb-[100%] overflow-hidden bg-gray-100">
              <img
                src={category.image_url}
                alt={category.name}
                className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 text-center">
              <h3 className="font-medium text-lg mb-1 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {category.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
