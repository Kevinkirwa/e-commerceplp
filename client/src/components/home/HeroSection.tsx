import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary-700 to-primary-500 text-white py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans">
              Shop from thousands of vendors in one place
            </h1>
            <p className="mt-4 text-lg text-primary-100">
              Discover unique products from local and international sellers, with secure payments through M-Pesa and PayPal.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button className="bg-white text-primary-700 font-medium px-6 py-6 rounded-lg hover:bg-gray-100 transition shadow-md">
                  Shop Now
                </Button>
              </Link>
              <Link href="/vendor/register">
                <Button variant="outline" className="bg-transparent border-2 border-white text-white font-medium px-6 py-6 rounded-lg hover:bg-white/10 transition">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200" 
              alt="Shopping experience" 
              className="rounded-lg shadow-lg object-cover h-64 md:h-80 w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
