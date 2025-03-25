import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { 
  Users, 
  ShoppingBag, 
  Store, 
  CreditCard, 
  TrendingUp, 
  Package, 
  CheckCircle, 
  XCircle,
  FolderIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard: React.FC = () => {
  // We'll use the existing API queries and simulate the dashboard data
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: vendors } = useQuery({
    queryKey: ['/api/vendors'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Simulated dashboard data
  const revenueData = [
    { name: "Jan", revenue: 12500 },
    { name: "Feb", revenue: 18200 },
    { name: "Mar", revenue: 15800 },
    { name: "Apr", revenue: 22000 },
    { name: "May", revenue: 19500 },
    { name: "Jun", revenue: 24300 },
    { name: "Jul", revenue: 29000 },
    { name: "Aug", revenue: 31200 },
    { name: "Sep", revenue: 28000 },
    { name: "Oct", revenue: 26800 },
    { name: "Nov", revenue: 33500 },
    { name: "Dec", revenue: 39400 },
  ];

  const categoryData = [
    { name: "Electronics", value: 40 },
    { name: "Fashion", value: 25 },
    { name: "Home & Garden", value: 15 },
    { name: "Beauty", value: 12 },
    { name: "Sports", value: 8 },
  ];

  const COLORS = ['#6366F1', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6'];

  const paymentMethodData = [
    { name: "M-Pesa", value: 65 },
    { name: "PayPal", value: 25 },
    { name: "Card", value: 10 },
  ];

  const vendorPerformanceData = [
    { name: "Tech World", sales: 156, revenue: 12500 },
    { name: "Fashion Hub", sales: 132, revenue: 9800 },
    { name: "Home Essentials", sales: 98, revenue: 7650 },
    { name: "Beauty Zone", sales: 76, revenue: 5400 },
    { name: "Sports Elite", sales: 64, revenue: 4200 },
  ];

  // Overview metrics
  const dashboardMetrics = {
    totalUsers: users?.length || 0,
    totalVendors: vendors?.length || 0,
    totalProducts: products?.length || 0,
    totalOrders: orders?.length || 0,
    totalRevenue: 280200,
    pendingVendorApprovals: 3,
    lastMonthRevenue: 33500,
    thisMonthRevenue: 39400,
    revenueGrowth: 17.6,
    userGrowth: 12.3,
    vendorGrowth: 8.5,
    pendingOrders: 24,
    processingOrders: 18,
    shippedOrders: 35,
    deliveredOrders: 91,
    cancelledOrders: 12
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Platform overview and analytics</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Link href="/admin/vendors">
            <Button variant="outline">
              <Store className="mr-2 h-4 w-4" />
              Manage Vendors
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="outline">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button>
              <FolderIcon className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardMetrics.totalUsers}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +{dashboardMetrics.userGrowth}% this month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardMetrics.totalVendors}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +{dashboardMetrics.vendorGrowth}% this month
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                <Store className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardMetrics.totalProducts}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +22 this week
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">${dashboardMetrics.totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +{dashboardMetrics.revenueGrowth}% this month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366F1" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Items that require your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded text-yellow-600 mr-3">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Vendor Approvals</p>
                    <p className="text-sm text-gray-500">{dashboardMetrics.pendingVendorApprovals} pending requests</p>
                  </div>
                </div>
                <Link href="/admin/vendors?filter=pending">
                  <Button variant="outline" size="sm">Review</Button>
                </Link>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded text-blue-600 mr-3">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Pending Orders</p>
                    <p className="text-sm text-gray-500">{dashboardMetrics.pendingOrders} orders to process</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded text-red-600 mr-3">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Low Stock Items</p>
                    <p className="text-sm text-gray-500">15 products running low</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Check</Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded text-green-600 mr-3">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Payment Verifications</p>
                    <p className="text-sm text-gray-500">7 payments need verification</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Verify</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Status and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current status of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge className="bg-yellow-100 text-yellow-800 mr-2">Pending</Badge>
                    <span className="text-sm font-medium">{dashboardMetrics.pendingOrders} orders</span>
                  </div>
                  <span className="text-sm text-gray-500">13%</span>
                </div>
                <Progress value={13} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge className="bg-blue-100 text-blue-800 mr-2">Processing</Badge>
                    <span className="text-sm font-medium">{dashboardMetrics.processingOrders} orders</span>
                  </div>
                  <span className="text-sm text-gray-500">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge className="bg-purple-100 text-purple-800 mr-2">Shipped</Badge>
                    <span className="text-sm font-medium">{dashboardMetrics.shippedOrders} orders</span>
                  </div>
                  <span className="text-sm text-gray-500">19%</span>
                </div>
                <Progress value={19} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge className="bg-green-100 text-green-800 mr-2">Delivered</Badge>
                    <span className="text-sm font-medium">{dashboardMetrics.deliveredOrders} orders</span>
                  </div>
                  <span className="text-sm text-gray-500">51%</span>
                </div>
                <Progress value={51} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge className="bg-red-100 text-red-800 mr-2">Cancelled</Badge>
                    <span className="text-sm font-medium">{dashboardMetrics.cancelledOrders} orders</span>
                  </div>
                  <span className="text-sm text-gray-500">7%</span>
                </div>
                <Progress value={7} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <Tabs defaultValue="category">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Distribution</CardTitle>
                <TabsList>
                  <TabsTrigger value="category">Category</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>Sales distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="category" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="payment" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Top Performing Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Vendors</CardTitle>
          <CardDescription>Vendors with highest sales and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vendorPerformanceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#6366F1" />
                <YAxis yAxisId="right" orientation="right" stroke="#EC4899" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="Total Sales" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
