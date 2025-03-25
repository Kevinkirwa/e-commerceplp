import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  ShoppingBag, 
  Box, 
  Heart, 
  CreditCard, 
  ChevronRight, 
  Truck,
  Clock,
  CheckCheck,
  MapPin,
  User as UserIcon,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch user profile data
  const { data: userData, isLoading: isLoadingUser } = useQuery<any>({
    queryKey: ['/api/users', user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await apiRequest("GET", `/api/users/${user.id}`);
      } catch (error) {
        // Return mock data if API not implemented yet
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: "John",
          lastName: "Doe",
          avatar: null,
          loyaltyPoints: 250,
          isVerified: true,
          createdAt: "2024-01-15T10:30:00Z"
        };
      }
    },
    enabled: !!user
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ['/api/users/orders/recent'],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await apiRequest("GET", `/api/users/orders/recent`);
      } catch (error) {
        // Return mock data if API not implemented yet
        return [
          {
            id: 1001,
            orderNumber: "ORD-5293",
            date: "2025-03-20T15:30:00Z",
            status: "delivered",
            total: 189.99,
            items: 3,
            trackingInfo: {
              carrier: "FedEx",
              trackingNumber: "FDX7823691045"
            }
          },
          {
            id: 1002,
            orderNumber: "ORD-5246",
            date: "2025-03-15T09:45:00Z",
            status: "shipped",
            total: 75.50,
            items: 1,
            trackingInfo: {
              carrier: "UPS",
              trackingNumber: "1Z9876543210"
            }
          },
          {
            id: 1003,
            orderNumber: "ORD-5186",
            date: "2025-03-10T14:20:00Z",
            status: "processing",
            total: 249.95,
            items: 2,
            trackingInfo: null
          }
        ];
      }
    },
    enabled: !!user
  });

  // Fetch wishlist
  const { data: wishlistItems, isLoading: isLoadingWishlist } = useQuery<any[]>({
    queryKey: ['/api/users/wishlist'],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await apiRequest("GET", `/api/users/wishlist`);
      } catch (error) {
        // Return mock data if API not implemented yet
        return [
          {
            id: 101,
            product: {
              id: 201,
              name: "Wireless Noise-Cancelling Headphones",
              price: 199.99,
              salePrice: 169.99,
              image: "https://via.placeholder.com/100"
            },
            addedAt: "2025-03-18T11:20:00Z"
          },
          {
            id: 102,
            product: {
              id: 205,
              name: "Smart Watch Pro",
              price: 299.95,
              salePrice: null,
              image: "https://via.placeholder.com/100"
            },
            addedAt: "2025-03-15T09:30:00Z"
          },
          {
            id: 103,
            product: {
              id: 210,
              name: "Ultra HD 4K Action Camera",
              price: 249.50,
              salePrice: 229.99,
              image: "https://via.placeholder.com/100"
            },
            addedAt: "2025-03-12T16:45:00Z"
          }
        ];
      }
    },
    enabled: !!user
  });

  // Fetch recommended products
  const { data: recommendedProducts, isLoading: isLoadingRecommended } = useQuery<any[]>({
    queryKey: ['/api/users/recommendations'],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await apiRequest("GET", `/api/users/recommendations`);
      } catch (error) {
        // Return mock data if API not implemented yet
        return [
          {
            id: 301,
            name: "Bluetooth Portable Speaker",
            price: 79.99,
            salePrice: 59.99,
            image: "https://via.placeholder.com/100",
            rating: 4.5,
            ratingCount: 128
          },
          {
            id: 302,
            name: "Smartphone Power Bank 20000mAh",
            price: 49.95,
            salePrice: null,
            image: "https://via.placeholder.com/100",
            rating: 4.8,
            ratingCount: 256
          },
          {
            id: 303,
            name: "Ergonomic Wireless Mouse",
            price: 39.99,
            salePrice: 29.99,
            image: "https://via.placeholder.com/100",
            rating: 4.3,
            ratingCount: 87
          }
        ];
      }
    },
    enabled: !!user
  });

  // Function to get user initials for avatar
  const getUserInitials = (): string => {
    if (!userData) return "U";
    
    let initials = "";
    
    if (userData.firstName) {
      initials += userData.firstName.charAt(0);
    }
    
    if (userData.lastName) {
      initials += userData.lastName.charAt(0);
    }
    
    return initials || userData.username.charAt(0).toUpperCase();
  };

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCheck className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoadingUser || isLoadingOrders || isLoadingWishlist || isLoadingRecommended) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-3 animate-pulse">
          <div className="h-64 bg-gray-100 rounded-lg"></div>
          <div className="md:col-span-2 h-64 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="mt-6 h-80 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile Summary */}
        <Card>
          <CardHeader>
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={userData?.avatar || ""}
                  alt={userData?.username}
                />
                <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-center mt-2">
              {userData?.firstName} {userData?.lastName}
            </CardTitle>
            <CardDescription className="text-center">
              {userData?.email}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded text-primary mr-3">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(userData?.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded text-green-600 mr-3">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loyalty Points</p>
                  <p className="font-medium">{userData?.loyaltyPoints || 0} points</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded text-blue-600 mr-3">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="font-medium">{recentOrders?.length || 0} orders</p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Link href="/user/profile">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/user/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your most recent purchases</CardDescription>
          </CardHeader>
          
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className={`p-2 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {getStatusIcon(order.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Order #{order.orderNumber}</h4>
                        <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <p>{formatDate(order.date)}</p>
                        <p>{order.items} item{order.items !== 1 ? 's' : ''}</p>
                      </div>
                      
                      <div className="mt-2 flex items-center">
                        <Badge className={getStatusBadgeStyle(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        
                        {order.trackingInfo && (
                          <div className="ml-2 text-xs text-blue-600 flex items-center">
                            <Truck className="h-3 w-3 mr-1" />
                            <span>{order.trackingInfo.carrier}: {order.trackingInfo.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 p-3 rounded-full inline-flex mb-3">
                  <ShoppingBag className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium">No orders yet</h3>
                <p className="text-gray-500 mt-1">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
                <Button className="mt-4">
                  <Link href="/products">
                    Start Shopping
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Wishlist and Recommendations */}
      <div className="mt-6">
        <Tabs defaultValue="wishlist">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="wishlist">
              <Heart className="h-4 w-4 mr-2" />
              My Wishlist
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Star className="h-4 w-4 mr-2" />
              Recommended for You
            </TabsTrigger>
          </TabsList>
          
          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Wishlist Items</CardTitle>
                  <Link href="/user/wishlist">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              
              <CardContent>
                {wishlistItems && wishlistItems.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {wishlistItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <Link href={`/products/${item.product.id}`}>
                          <div className="aspect-video overflow-hidden">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        </Link>
                        <CardContent className="p-4">
                          <Link href={`/products/${item.product.id}`}>
                            <h3 className="font-medium line-clamp-1 hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              {item.product.salePrice ? (
                                <>
                                  <span className="font-bold">${item.product.salePrice}</span>
                                  <span className="text-sm text-gray-500 line-through">
                                    ${item.product.price}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold">${item.product.price}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Added {formatDate(item.addedAt)}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-0">
                          <div className="grid grid-cols-2 w-full">
                            <Button variant="ghost" className="rounded-none rounded-bl border-t border-r">
                              Add to Cart
                            </Button>
                            <Button variant="ghost" className="rounded-none rounded-br border-t text-red-500 hover:text-red-700 hover:bg-red-50">
                              Remove
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 p-3 rounded-full inline-flex mb-3">
                      <Heart className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium">Your wishlist is empty</h3>
                    <p className="text-gray-500 mt-1">
                      Save items you like to your wishlist and find them all in one place.
                    </p>
                    <Button className="mt-4">
                      <Link href="/products">
                        Explore Products
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommended For You</CardTitle>
                <CardDescription>Products picked just for you based on your preferences</CardDescription>
              </CardHeader>
              
              <CardContent>
                {recommendedProducts && recommendedProducts.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {recommendedProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <Link href={`/products/${product.id}`}>
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        </Link>
                        <CardContent className="p-4">
                          <Link href={`/products/${product.id}`}>
                            <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center text-yellow-400 mr-1">
                              <Star className="fill-current h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium">{product.rating}</span>
                            <span className="text-xs text-gray-500 ml-1">({product.ratingCount})</span>
                          </div>
                          <div className="mt-2">
                            {product.salePrice ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary">${product.salePrice}</span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.price}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold">${product.price}</span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="p-0">
                          <div className="grid grid-cols-2 w-full">
                            <Button variant="ghost" className="rounded-none rounded-bl border-t border-r">
                              Add to Cart
                            </Button>
                            <Button variant="ghost" className="rounded-none rounded-br border-t">
                              <Heart className="h-4 w-4 mr-1" />
                              Wishlist
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 p-3 rounded-full inline-flex mb-3">
                      <Star className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium">No recommendations yet</h3>
                    <p className="text-gray-500 mt-1">
                      Start browsing and purchasing products to get personalized recommendations.
                    </p>
                    <Button className="mt-4">
                      <Link href="/products">
                        Explore Products
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;