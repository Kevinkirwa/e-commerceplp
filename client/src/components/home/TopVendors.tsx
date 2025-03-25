import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Vendor } from "@shared/schema";
import { ArrowRightIcon } from "@/components/ui/icons";

const TopVendors: React.FC = () => {
  const { data: vendors, isLoading, error } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });

  if (isLoading) {
    return (
      <section className="py-10" id="vendors">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-sans">Top Vendors</h2>
            <Link href="/vendors" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              View All <ArrowRightIcon />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 animate-pulse rounded-lg shadow-sm h-56"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10" id="vendors">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-sans">Top Vendors</h2>
            <Link href="/vendors" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              View All <ArrowRightIcon />
            </Link>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-red-500">
            Failed to load vendors. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  // Take the top 4 vendors by rating
  const topVendors = vendors
    ?.sort((a, b) => b.rating - a.rating)
    .slice(0, 4) || [];

  return (
    <section className="py-10" id="vendors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-sans">Top Vendors</h2>
          <Link href="/vendors" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
            View All <span className="ml-1"><ArrowRightIcon /></span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topVendors.length > 0 ? (
            topVendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/products?vendorId=${vendor.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                <div className="h-36 bg-gray-100 relative">
                  <img 
                    src={vendor.banner || "https://via.placeholder.com/800x300?text=No+Banner"} 
                    alt={`${vendor.storeName} store banner`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-4 flex items-center">
                  <div className="w-14 h-14 rounded-full border-4 border-white shadow-sm overflow-hidden -mt-10 relative z-10">
                    <img 
                      src={vendor.logo || "https://via.placeholder.com/100?text=No+Logo"} 
                      alt={`${vendor.storeName} logo`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{vendor.storeName}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="ri-star-fill text-secondary"></i>
                      <span className="ml-1">{vendor.rating.toFixed(1)} ({vendor.ratingCount})</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              No vendors available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopVendors;
