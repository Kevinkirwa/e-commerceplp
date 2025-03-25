import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  ShoppingBag, 
  Store, 
  DollarSign, 
  TrendingUp, 
  Tag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Mock data for dashboard stats and charts
const orderStatusData = [
  { name: "Pending", value: 15, color: "#FFB547" },
  { name: "Processing", value: 25, color: "#3B82F6" },
  { name: "Shipped", value: 35, color: "#14B8A6" },
  { name: "Delivered", value: 55, color: "#10B981" },
  { name: "Cancelled", value: 10, color: "#EF4444" },
];

const revenueData = [
  {
    name: "Jan",
    revenue: 4000,
    orders: 24
  },
  {
    name: "Feb",
    revenue: 3000,
    orders: 13
  },
  {
    name: "Mar",
    revenue: 5000,
    orders: 22
  },
  {
    name: "Apr",
    revenue: 6000,
    orders: 32
  },
  {
    name: "May",
    revenue: 5000,
    orders: 24
  },
  {
    name: "Jun",
    revenue: 7000,
    orders: 38
  },
  {
    name: "Jul",
    revenue: 8500,
    orders: 40
  }
];

const AdminDashboard: React.FC = () => {
  // Fetch summary data
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery<any>({
    queryKey: ['/api/admin/dashboard/summary'],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/admin/dashboard/summary");
      } catch (error) {
        // Return mock data if API not implemented yet
        return {
          totalUsers: 245,
          totalVendors: 32,
          totalProducts: 876,
          totalOrders: 1432,
          totalRevenue: 89750.45,
          pendingApprovals: 5,
          recentOrders: []
        };
      }
    }
  });

  const RevenueCard = ({ title, value, percentChange, icon: Icon }: { title: string, value: string, percentChange: number, icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1 text-xs">
          {percentChange > 0 ? (
            <>
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{percentChange}% from last month</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-500">{Math.abs(percentChange)}% from last month</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoadingSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of your e-commerce platform</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
            <Calendar className="mr-1 h-4 w-4 inline-block" />
            Last 30 Days
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <RevenueCard 
          title="Total Revenue" 
          value={`$${summaryData?.totalRevenue.toLocaleString() || "0"}`} 
          percentChange={8.2} 
          icon={DollarSign} 
        />
        <RevenueCard 
          title="Total Orders" 
          value={summaryData?.totalOrders.toLocaleString() || "0"} 
          percentChange={5.1} 
          icon={ShoppingBag} 
        />
        <RevenueCard 
          title="Total Products" 
          value={summaryData?.totalProducts.toLocaleString() || "0"} 
          percentChange={12.5} 
          icon={Tag} 
        />
        <RevenueCard 
          title="Total Vendors" 
          value={summaryData?.totalVendors.toLocaleString() || "0"} 
          percentChange={3.2} 
          icon={Store} 
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and order comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
            <CardDescription>Key metrics and stats</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Total Users</p>
                      <p className="text-xl font-bold">{summaryData?.totalUsers.toLocaleString() || "0"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Conversion Rate</p>
                      <p className="text-xl font-bold">3.6%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Avg. Order Value</p>
                      <p className="text-xl font-bold">${((summaryData?.totalRevenue || 0) / (summaryData?.totalOrders || 1)).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Revenue/User</p>
                      <p className="text-xl font-bold">${((summaryData?.totalRevenue || 0) / (summaryData?.totalUsers || 1)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vendors" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Active Vendors</p>
                      <p className="text-xl font-bold">{(summaryData?.totalVendors || 0) - (summaryData?.pendingApprovals || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Pending Approvals</p>
                      <p className="text-xl font-bold">{summaryData?.pendingApprovals || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Avg. Products/Vendor</p>
                      <p className="text-xl font-bold">{((summaryData?.totalProducts || 0) / (summaryData?.totalVendors || 1)).toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Avg. Revenue/Vendor</p>
                      <p className="text-xl font-bold">${((summaryData?.totalRevenue || 0) / (summaryData?.totalVendors || 1)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Total Products</p>
                      <p className="text-xl font-bold">{summaryData?.totalProducts.toLocaleString() || "0"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Avg. Order Items</p>
                      <p className="text-xl font-bold">2.8</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Top Category</p>
                      <p className="text-xl font-bold">Electronics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Avg. Product Price</p>
                      <p className="text-xl font-bold">$89.99</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex">
                <div className="relative mr-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="absolute top-10 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gray-200"></div>
                </div>
                <div className="pb-8">
                  <p className="text-sm font-medium">New Order #ORD-5293</p>
                  <p className="text-xs text-gray-500">$189.99 - 3 items</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="relative mr-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <div className="absolute top-10 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gray-200"></div>
                </div>
                <div className="pb-8">
                  <p className="text-sm font-medium">New Vendor Registration</p>
                  <p className="text-xs text-gray-500">TechGadgets Store</p>
                  <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="relative mr-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="absolute top-10 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gray-200"></div>
                </div>
                <div className="pb-8">
                  <p className="text-sm font-medium">New User Registration</p>
                  <p className="text-xs text-gray-500">john.doe@example.com</p>
                  <p className="text-xs text-gray-400 mt-1">6 hours ago</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">New Product Added</p>
                  <p className="text-xs text-gray-500">Wireless Earbuds Pro</p>
                  <p className="text-xs text-gray-400 mt-1">8 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;