import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const PromotionBanner: React.FC = () => {
  return (
    <section className="py-10 container mx-auto px-4">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-white text-2xl md:text-3xl font-bold">Summer Sale</h2>
            <p className="text-primary-100 mt-3 text-lg">Get up to 50% off on selected items. Limited time offer!</p>
            <Link href="/products?sale=true">
              <Button className="mt-6 bg-white text-primary-600 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition">
                Shop Now
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800" 
              alt="Summer Sale" 
              className="w-full h-56 md:h-72 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionBanner;
