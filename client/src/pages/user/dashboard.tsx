import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CircleUser, Package, ShoppingCart, Heart, CreditCard } from "lucide-react";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: wishlistItems, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['/api/wishlist'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-4">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-4xl mb-3">
                  <CircleUser size={64} />
                </div>
                <h2 className="font-bold text-xl">{userData?.username}</h2>
                <p className="text-gray-500">{userData?.email}</p>
                <p className="text-sm mt-1 bg-primary-100 text-primary-600 px-2 py-1 rounded">
                  {userData?.role === "admin" ? "Administrator" : 
                   userData?.role === "vendor" ? "Vendor" : "Customer"}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-medium">
                    {userData?.firstName && userData?.lastName 
                      ? `${userData.firstName} ${userData.lastName}` 
                      : "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{userData?.phone || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-medium">
                    {userData?.createdAt 
                      ? new Date(userData.createdAt).toLocaleDateString() 
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loyalty Points</span>
                  <span className="font-medium">{userData?.loyaltyPoints || 0} points</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/user/orders">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Button>
                </Link>
                <Link href="/user/wishlist">
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" />
                    My Wishlist
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button variant="ghost" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Button>
                </Link>
                {userData?.role === "vendor" && (
                  <Link href="/vendor/dashboard">
                    <Button variant="ghost" className="w-full justify-start">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Vendor Dashboard
                    </Button>
                  </Link>
                )}
                {userData?.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" className="w-full justify-start">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <p className={`text-sm ${
                            order.status === "delivered" ? "text-green-500" : 
                            order.status === "processing" ? "text-blue-500" : 
                            order.status === "cancelled" ? "text-red-500" : "text-yellow-500"
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center">
                    <Link href="/user/orders">
                      <Button variant="outline">View All Orders</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No orders yet</h3>
                  <p className="mt-1 text-gray-500">Your order history will appear here.</p>
                  <Link href="/products">
                    <Button className="mt-4">Start Shopping</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Wishlist Items</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWishlist ? (
                <div className="text-center py-4">Loading wishlist...</div>
              ) : wishlistItems && wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {wishlistItems.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="aspect-square relative overflow-hidden rounded-md mb-2">
                        <img 
                          src={item.product.images && item.product.images.length > 0 
                            ? item.product.images[0] 
                            : "https://via.placeholder.com/150"}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-primary-600 font-semibold text-sm">
                        ${(item.product.salePrice || item.product.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <div className="text-center md:col-span-3 mt-2">
                    <Link href="/user/wishlist">
                      <Button variant="outline">View All Wishlist Items</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Your wishlist is empty</h3>
                  <p className="mt-1 text-gray-500">Save items you like for later.</p>
                  <Link href="/products">
                    <Button className="mt-4">Explore Products</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
