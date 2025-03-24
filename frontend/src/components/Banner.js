import React from 'react';
import Link from 'next/link';

export default function Banner({ title, subtitle, imageUrl, buttonText, buttonLink }) {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)'
        }}
      ></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            {subtitle}
          </p>
          
          {buttonText && buttonLink && (
            <Link href={buttonLink}>
              <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 text-lg">
                {buttonText}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
