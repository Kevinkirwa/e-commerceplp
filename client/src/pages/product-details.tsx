import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Product, Review } from "@shared/schema";
import { HeartIcon, CartIcon, StarIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductDetails: React.FC = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product details
  const { 
    data: product, 
    isLoading: isLoadingProduct, 
    error: productError 
  } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });

  // Fetch product reviews
  const {
    data: reviews,
    isLoading: isLoadingReviews,
  } = useQuery<Review[]>({
    queryKey: [`/api/products/${product?.id}/reviews`],
    enabled: !!product?.id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
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
      quantity,
      vendorId: product.vendorId,
      vendorName: "Vendor" // In a real app, we would fetch the vendor name
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    
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

  const increaseQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-200 h-8 w-3/4 mb-4 rounded"></div>
              <div className="bg-gray-200 h-6 w-1/4 mb-6 rounded"></div>
              <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
              <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
              <div className="bg-gray-200 h-4 w-2/3 mb-6 rounded"></div>
              <div className="bg-gray-200 h-10 w-full mb-4 rounded"></div>
              <div className="bg-gray-200 h-10 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if the product is on sale
  const isOnSale = product.salePrice && product.salePrice < product.price;
  
  // Calculate discount percentage if on sale
  const discountPercentage = isOnSale
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="mb-4">
              <img 
                src={product.images && product.images.length > 0 
                  ? product.images[selectedImageIndex] 
                  : "https://via.placeholder.com/500?text=No+Image"
                } 
                alt={product.name} 
                className="w-full h-96 object-contain rounded-lg"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer border-2 rounded-md ${selectedImageIndex === index ? 'border-primary-500' : 'border-gray-200'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - view ${index + 1}`} 
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
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
              <span className="text-sm text-gray-500 ml-1">
                ({product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            {/* Price */}
            <div className="mb-4">
              {isOnSale ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-primary-600">${product.salePrice!.toFixed(2)}</span>
                  <span className="text-lg text-gray-400 line-through ml-2">${product.price.toFixed(2)}</span>
                  <span className="ml-2 bg-accent text-white text-xs font-medium px-2 py-1 rounded">-{discountPercentage}%</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="mb-4">
              {product.stockQuantity > 0 ? (
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                  In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                  Out of Stock
                </span>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            {/* Quantity Selector */}
            {product.stockQuantity > 0 && (
              <div className="flex items-center mb-4">
                <span className="mr-2 text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <span className="px-3 py-1">{quantity}</span>
                  <button 
                    className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button 
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0}
              >
                <CartIcon />
                <span className="ml-2">Add to Cart</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 border-primary-600 text-primary-600 hover:bg-primary-50"
                onClick={handleAddToWishlist}
              >
                <HeartIcon />
                <span className="ml-2">Add to Wishlist</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="description">
            <TabsList className="w-full border-b">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.ratingCount})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-4">
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-4">
              {isLoadingReviews ? (
                <div className="text-center py-4">Loading reviews...</div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex text-secondary">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              <StarIcon filled={i < review.rating} />
                            </span>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No reviews yet. Be the first to review this product!
                </div>
              )}
              
              {isAuthenticated ? (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Write a Review</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <div className="flex text-gray-400">
                        {[...Array(5)].map((_, i) => (
                          <button 
                            key={i} 
                            type="button"
                            className="text-xl focus:outline-none"
                          >
                            <StarIcon filled={false} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Review</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
                      ></textarea>
                    </div>
                    <Button type="submit">Submit Review</Button>
                  </form>
                </div>
              ) : (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg text-center">
                  <p className="mb-2">You need to be logged in to write a review.</p>
                  <Link href="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shipping" className="p-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium mb-3">Shipping Information</h3>
                <p>We offer standard shipping that typically takes 3-5 business days. For orders over $50, shipping is free!</p>
                
                <h3 className="text-lg font-medium mb-3 mt-6">Return Policy</h3>
                <p>If you're not satisfied with your purchase, you can return it within 30 days for a full refund. Please note that items must be in their original condition with all tags attached.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
