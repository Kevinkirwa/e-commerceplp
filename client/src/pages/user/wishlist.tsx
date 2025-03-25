import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Search, Trash2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  stockQuantity: number;
  vendorId: number;
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

const UserWishlist: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const { data: wishlistItems, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['/api/wishlist'],
  });

  const filteredItems = wishlistItems?.filter(item => {
    if (searchQuery) {
      return item.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled by the filteredItems
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
      
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      
      toast({
        title: "Removed from wishlist",
        description: "Item successfully removed from your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Failed to remove item",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    // Check if the product is in stock
    if (product.stockQuantity <= 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    // Get the first image or placeholder
    const image = product.images && product.images.length > 0 
      ? product.images[0] 
      : "https://via.placeholder.com/500?text=No+Image";
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image,
      quantity: 1,
      vendorId: product.vendorId,
      vendorName: "Vendor" // In a real app, we would fetch the vendor name
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle>Saved Items</CardTitle>
          
          <form onSubmit={handleSearch} className="mt-2 md:mt-0 relative w-full md:w-64">
            <Input
              placeholder="Search in wishlist"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
        </CardHeader>
        <CardContent>
          {filteredItems && filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center border rounded-lg p-4">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product.images && item.product.images.length > 0 
                        ? item.product.images[0] 
                        : "https://via.placeholder.com/150"}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="md:ml-4 mt-2 md:mt-0 flex-1">
                    <Link href={`/products/${item.product.slug}`} className="hover:text-primary-600">
                      <h3 className="font-medium">{item.product.name}</h3>
                    </Link>
                    <div className="flex items-center mt-1">
                      <span className="font-semibold text-primary-600">
                        ${(item.product.salePrice || item.product.price).toFixed(2)}
                      </span>
                      {item.product.salePrice && (
                        <span className="text-gray-400 text-sm line-through ml-2">
                          ${item.product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {item.product.stockQuantity <= 0 && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Out of stock
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3 md:mt-0">
                    <span className="text-sm text-gray-500 hidden md:inline-block">
                      Added on {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleAddToCart(item.product)}
                      disabled={item.product.stockQuantity <= 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
              
              {wishlistItems && wishlistItems.length > filteredItems.length && (
                <div className="text-center mt-2 text-gray-500">
                  {filteredItems.length} out of {wishlistItems.length} items shown
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">Your wishlist is empty</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery 
                  ? "No items match your search criteria."
                  : "Save items you like for later."}
              </p>
              <Link href="/products">
                <Button className="mt-4">Explore Products</Button>
              </Link>
            </div>
          )}
          
          {filteredItems && filteredItems.length > 0 && (
            <>
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center">
                <Button variant="outline" className="text-red-500" onClick={() => toast({
                  title: "Feature not available",
                  description: "Clear all wishlist functionality is not implemented yet.",
                })}>
                  Clear Wishlist
                </Button>
                
                <Button onClick={() => {
                  filteredItems.forEach(item => {
                    if (item.product.stockQuantity > 0) {
                      handleAddToCart(item.product);
                    }
                  });
                  toast({
                    title: "Added to cart",
                    description: "All available items have been added to your cart.",
                  });
                }}>
                  Add All to Cart
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserWishlist;
