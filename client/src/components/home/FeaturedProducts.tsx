import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@shared/schema";
import { ArrowRightIcon } from "@/components/ui/icons";

const FeaturedProducts: React.FC = () => {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  if (isLoading) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-sans">Featured Products</h2>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              View All <ArrowRightIcon />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 animate-pulse rounded-lg shadow-sm h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-sans">Featured Products</h2>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              View All <ArrowRightIcon />
            </Link>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-red-500">
            Failed to load products. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  // Take only the first 4 products or less
  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-sans">Featured Products</h2>
          <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
            View All <span className="ml-1"><ArrowRightIcon /></span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              No products available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
