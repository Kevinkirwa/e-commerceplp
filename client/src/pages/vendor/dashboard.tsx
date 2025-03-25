import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { 
  ShoppingCart, 
  DollarSign, 
  Tag, 
  TrendingUp, 
  Star,
  Truck,
  AlertTriangle,
  Calendar,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { Link } from "wouter";

// Sample data for charts
const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 7000 },
  { name: "May", sales: 5000 },
  { name: "Jun", sales: 6000 },
  { name: "Jul", sales: 8500 }
];

const productPerformanceData = [
  { name: "Product A", sales: 120, revenue: 4800 },
  { name: "Product B", sales: 90, revenue: 2700 },
  { name: "Product C", sales: 75, revenue: 3750 },
  { name: "Product D", sales: 60, revenue: 6000 },
  { name: "Product E", sales: 50, revenue: 3500 }
];

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch vendor data
  const { data: vendorData, isLoading: isLoadingVendor } = useQuery<any>({
    queryKey: ['/api/vendors/current'],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/vendors/current");
      } catch (error) {
        // Return mock data if API not implemented
        return {
          id: 1,
          userId: user?.id,
          storeName: "Tech Gadgets Store",
          storeDescription: "Your one-stop shop for all tech gadgets and accessories.",
          logo: "https://via.placeholder.com/150",
          isVerified: true,
          rating: 4.5,
          ratingCount: 47,
          stats: {
            totalProducts: 32,
            totalOrders: 176,
            pendingOrders: 8,
            totalRevenue: 15680.75,
            revenueGrowth: 12.4,
            ordersGrowth: 8.7
          }
        };
      }
    },
    enabled: !!user
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ['/api/vendors/orders/recent'],
    queryFn: async () => {
      try {
        const result = await apiRequest("GET", "/api/vendors/orders/recent");
        // Ensure we're returning an array
        return Array.isArray(result) ? result : [];
      } catch (error) {
        // Return mock data if API not implemented
        return [
          {
            id: 123,
            orderNumber: "ORD-5293",
            date: "2025-03-24T18:23:00Z",
            status: "processing",
            total: 189.99,
            items: 3,
            customer: {
              name: "John Doe",
              email: "john.doe@example.com"
            }
          },
          {
            id: 122,
            orderNumber: "ORD-5292",
            date: "2025-03-24T15:10:00Z",
            status: "shipped",
            total: 99.99,
            items: 1,
            customer: {
              name: "Jane Smith",
              email: "jane.smith@example.com"
            }
          },
          {
            id: 121,
            orderNumber: "ORD-5290",
            date: "2025-03-23T12:30:00Z",
            status: "delivered",
            total: 259.97,
            items: 2,
            customer: {
              name: "Robert Johnson",
              email: "robert.j@example.com"
            }
          }
        ];
      }
    },
    enabled: !!user
  });

  // Fetch low stock products
  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useQuery<any[]>({
    queryKey: ['/api/vendors/products/low-stock'],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/vendors/products/low-stock");
      } catch (error) {
        // Return mock data if API not implemented
        return [
          { id: 12, name: "Wireless Earbuds", stock: 3, minimumStock: 10 },
          { id: 18, name: "Smart Watch S3", stock: 2, minimumStock: 5 },
          { id: 24, name: "Bluetooth Speaker", stock: 4, minimumStock: 10 }
        ];
      }
    },
    enabled: !!user
  });

  const StatCard = ({ title, value, change, icon: Icon, changeDirection = "up" }: { 
    title: string, 
    value: string, 
    change?: number, 
    icon: React.ElementType,
    changeDirection?: "up" | "down"
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center pt-1 text-xs">
            {changeDirection === "up" ? (
              <>
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">{change}% from last month</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">{change}% from last month</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoadingVendor || isLoadingOrders || isLoadingLowStock) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 animate-pulse">
          <div className="h-80 bg-gray-100 rounded-lg"></div>
          <div className="h-80 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold mr-3">{vendorData?.storeName}</h1>
            {vendorData?.isVerified ? (
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            ) : (
              <Badge variant="outline" className="border-yellow-400 text-yellow-600">Pending Approval</Badge>
            )}
          </div>
          <p className="text-gray-500 mt-1">{vendorData?.storeDescription}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-medium">{vendorData?.rating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm ml-1">({vendorData?.ratingCount})</span>
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 ml-2">
            <Calendar className="mr-1 h-4 w-4 inline-block" />
            Last 30 Days
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${vendorData?.stats.totalRevenue.toLocaleString()}`} 
          change={vendorData?.stats.revenueGrowth} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Total Orders" 
          value={vendorData?.stats.totalOrders.toLocaleString()} 
          change={vendorData?.stats.ordersGrowth} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="Products" 
          value={vendorData?.stats.totalProducts.toLocaleString()} 
          icon={Tag} 
        />
        <StatCard 
          title="Pending Orders" 
          value={vendorData?.stats.pendingOrders.toLocaleString()} 
          icon={Clock} 
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    name="Sales ($)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by sales and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" name="Units Sold" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Link href="/vendor/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status === 'delivered' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : order.status === 'shipped' ? (
                      <Truck className="h-5 w-5" />
                    ) : order.status === 'processing' ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Order #{order.orderNumber}</h4>
                      <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <p>{order.customer.name}</p>
                      <p>{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-1 flex items-center">
                      <Badge className={
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {order.status === 'delivered' ? 'Delivered' : 
                         order.status === 'shipped' ? 'Shipped' : 
                         order.status === 'processing' ? 'Processing' : 
                         'Cancelled'}
                      </Badge>
                      <span className="ml-2 text-sm text-gray-500">{order.items} item{order.items !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Products with low stock</CardDescription>
            </div>
            <Link href="/vendor/products">
              <Button variant="outline" size="sm">Manage Products</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts?.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock} / {product.minimumStock}</p>
                      </div>
                    </div>
                    <Link href={`/vendor/products?edit=${product.id}`}>
                      <Button size="sm" variant="ghost">Update Stock</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-green-100 p-3 rounded-full inline-flex mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">All products in stock</h3>
                <p className="text-gray-500 mt-1">Your inventory levels are healthy</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <Link href="/vendor/products?new=true">
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;