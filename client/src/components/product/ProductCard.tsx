import React from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { HeartIcon, CartIcon, StarIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/context/CartContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/wishlist", {
        productId: product.id
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add to wishlist",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Get the first image or placeholder
  const image = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://via.placeholder.com/500?text=No+Image";
  
  // Check if the product is on sale
  const isOnSale = product.salePrice && product.salePrice < product.price;
  
  // Calculate discount percentage if on sale
  const discountPercentage = isOnSale
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          <img 
            src={image} 
            alt={product.name} 
            className="w-full h-56 object-contain p-4"
          />
        </Link>
        <button 
          className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100"
          onClick={handleAddToWishlist}
        >
          <HeartIcon />
        </button>
        {isOnSale && (
          <div className="absolute top-3 left-3">
            <span className="bg-accent text-white text-xs font-medium px-2 py-1 rounded">-{discountPercentage}%</span>
          </div>
        )}
        {product.stockQuantity <= 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded block text-center">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center mb-1">
          <div className="flex text-secondary">
            {[...Array(5)].map((_, i) => (
              <span key={i}>
                {i < Math.floor(product.rating) ? (
                  <StarIcon filled={true} />
                ) : i < Math.ceil(product.rating) && product.rating % 1 >= 0.5 ? (
                  <StarIcon filled={true} />
                ) : (
                  <StarIcon filled={false} />
                )}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.ratingCount})</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-primary-600 font-semibold">
              ${isOnSale ? product.salePrice!.toFixed(2) : product.price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-gray-400 text-sm line-through ml-1">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button 
            className={`${
              product.stockQuantity > 0 
                ? "bg-primary-50 text-primary-600 hover:bg-primary-100" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } p-2 rounded-full transition`}
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
          >
            <CartIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
