import React from "react";
import { 
  TruckIcon, 
  ShieldIcon, 
  CustomerServiceIcon, 
  ExchangeIcon 
} from "@/components/ui/icons";

const Features: React.FC = () => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-primary-600 text-3xl flex justify-center mb-4">
              <TruckIcon />
            </div>
            <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">Free shipping on orders over $50</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-primary-600 text-3xl flex justify-center mb-4">
              <ShieldIcon />
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
            <p className="text-gray-600 text-sm">M-Pesa and PayPal integration</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-primary-600 text-3xl flex justify-center mb-4">
              <CustomerServiceIcon />
            </div>
            <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Dedicated support team</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-primary-600 text-3xl flex justify-center mb-4">
              <ExchangeIcon />
            </div>
            <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
            <p className="text-gray-600 text-sm">30-day return policy</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
