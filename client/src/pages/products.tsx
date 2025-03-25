import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/product/ProductCard";
import { SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const Products: React.FC = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);

  // Parse query parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    
    const categoryId = params.get("categoryId");
    if (categoryId) {
      setSelectedCategory(parseInt(categoryId));
    }
    
    const vendorId = params.get("vendorId");
    if (vendorId) {
      setSelectedVendor(parseInt(vendorId));
    }
    
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    }
    
    const sale = params.get("sale");
    if (sale === "true") {
      setOnSale(true);
    }
  }, [location]);

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory, selectedVendor, searchQuery],
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter products based on criteria
  const filteredProducts = products?.filter(product => {
    // Filter by category
    if (selectedCategory !== null && product.categoryId !== selectedCategory) {
      return false;
    }
    
    // Filter by vendor
    if (selectedVendor !== null && product.vendorId !== selectedVendor) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by price range
    const price = product.salePrice || product.price;
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    // Filter by stock
    if (inStock && product.stockQuantity <= 0) {
      return false;
    }
    
    // Filter by sale status
    if (onSale && (!product.salePrice || product.salePrice >= product.price)) {
      return false;
    }
    
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled by the filteredProducts
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedVendor(null);
    setSearchQuery("");
    setPriceRange([0, 1000]);
    setInStock(false);
    setOnSale(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <SearchIcon />
                </div>
              </div>
            </form>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-2">
                {isLoadingCategories ? (
                  <div className="text-sm text-gray-500">Loading categories...</div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <Checkbox
                        id="all-categories"
                        checked={selectedCategory === null}
                        onCheckedChange={() => setSelectedCategory(null)}
                      />
                      <label htmlFor="all-categories" className="ml-2 text-sm">All Categories</label>
                    </div>
                    {categories?.map(category => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategory === category.id}
                          onCheckedChange={() => setSelectedCategory(category.id)}
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 text-sm">{category.name}</label>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="px-2">
                <Slider
                  defaultValue={priceRange}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setPriceRange(value as number[])}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Availability</h3>
              <div className="flex items-center">
                <Checkbox
                  id="in-stock"
                  checked={inStock}
                  onCheckedChange={(checked) => setInStock(checked as boolean)}
                />
                <label htmlFor="in-stock" className="ml-2 text-sm">In Stock Only</label>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Offers</h3>
              <div className="flex items-center">
                <Checkbox
                  id="on-sale"
                  checked={onSale}
                  onCheckedChange={(checked) => setOnSale(checked as boolean)}
                />
                <label htmlFor="on-sale" className="ml-2 text-sm">On Sale</label>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        {/* Product grid */}
        <div className="md:w-3/4">
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-100 animate-pulse rounded-lg shadow-sm h-80"></div>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
              <Button onClick={resetFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
