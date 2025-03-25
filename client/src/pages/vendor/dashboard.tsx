import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  PackageOpen, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  ArrowUpRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VendorDashboard: React.FC = () => {
  // We'll simulate data because we don't have real analytics implementation
  const { data: vendor, isLoading: isLoadingVendor } = useQuery({
    queryKey: ['/api/vendors'],
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Dashboard overview metrics (simulated)
  const dashboardData = {
    totalRevenue: 24586.75,
    monthlyRevenue: 8954.20,
    pendingOrders: 12,
    totalOrders: 156,
    totalProducts: products?.length || 0,
    totalCustomers: 87,
    revenueGrowth: 24.5,
    salesGrowth: 12.3,
    lowStockProducts: 3,
    popularProducts: [
      { id: 1, name: "Wireless Headphones", sales: 24, revenue: 1899.76 },
      { id: 2, name: "Smart Watch", sales: 18, revenue: 1439.82 },
      { id: 3, name: "Bluetooth Speaker", sales: 15, revenue: 1199.85 },
      { id: 4, name: "Laptop Backpack", sales: 12, revenue: 719.88 },
    ],
    recentOrders: orders?.slice(0, 5) || [],
  };

  if (isLoadingVendor || isLoadingProducts || isLoadingOrders) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
          <div className="md:col-span-2 lg:col-span-4 h-80 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href="/vendor/products">
            <Button variant="outline">
              <ShoppingBag className="mr-2 h-4 w-4" /> Manage Products
            </Button>
          </Link>
          <Link href="/vendor/orders">
            <Button>
              <PackageOpen className="mr-2 h-4 w-4" /> View Orders
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">${dashboardData.totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +{dashboardData.revenueGrowth}% from last month
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData.totalOrders}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +{dashboardData.salesGrowth}% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <PackageOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData.totalProducts}</h3>
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> {dashboardData.lowStockProducts} low stock
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardData.totalCustomers}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +5% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your store's revenue over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto" />
                <p className="mt-2 text-gray-500">Revenue chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Status of your recent orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="text-sm text-gray-500">{dashboardData.pendingOrders}</span>
                </div>
                <Progress value={(dashboardData.pendingOrders / dashboardData.totalOrders) * 100} className="h-2 bg-gray-100" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Processing</span>
                  <span className="text-sm text-gray-500">18</span>
                </div>
                <Progress value={(18 / dashboardData.totalOrders) * 100} className="h-2 bg-gray-100" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Shipped</span>
                  <span className="text-sm text-gray-500">35</span>
                </div>
                <Progress value={(35 / dashboardData.totalOrders) * 100} className="h-2 bg-gray-100" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Delivered</span>
                  <span className="text-sm text-gray-500">91</span>
                </div>
                <Progress value={(91 / dashboardData.totalOrders) * 100} className="h-2 bg-gray-100" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/vendor/orders" className="w-full">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
            <CardDescription>Your best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.popularProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.sales} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${product.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/vendor/products" className="w-full">
              <Button variant="outline" className="w-full">
                View All Products
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      <PackageOpen className="h-5 w-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium">Order #{order.id}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                      <Badge className={
                        order.status === "delivered" ? "bg-green-100 text-green-800" : 
                        order.status === "processing" ? "bg-blue-100 text-blue-800" : 
                        order.status === "cancelled" ? "bg-red-100 text-red-800" : 
                        "bg-yellow-100 text-yellow-800"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">No recent orders</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/vendor/orders" className="w-full">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
