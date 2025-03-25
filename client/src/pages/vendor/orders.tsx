import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  PackageOpen, 
  Eye, 
  Truck, 
  ClipboardCheck,
  XCircle
} from "lucide-react";

interface OrderItem {
  id: number;
  productId: number;
  vendorId: number;
  quantity: number;
  price: number;
  total: number;
  status: string;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
  items: OrderItem[];
}

const VendorOrders: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();
  
  // Fetch vendor orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Filter orders based on criteria
  const filteredOrders = orders?.filter(order => {
    // Filter by status
    if (filter !== "all" && order.status !== filter) {
      return false;
    }
    
    // Filter by search query (order ID or customer name)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.toLowerCase();
      
      if (!order.id.toString().includes(searchQuery) && !fullName.includes(searchLower)) {
        return false;
      }
    }
    
    // Filter by date
    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const currentDate = new Date();
      
      if (dateFilter === "today") {
        // Check if order is from today
        return orderDate.toDateString() === currentDate.toDateString();
      } else if (dateFilter === "week") {
        // Check if order is from this week
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        
        return orderDate >= weekStart;
      } else if (dateFilter === "month") {
        // Check if order is from this month
        return (
          orderDate.getMonth() === currentDate.getMonth() &&
          orderDate.getFullYear() === currentDate.getFullYear()
        );
      }
    }
    
    return true;
  });

  // Calculate the total amount for the filtered orders
  const totalAmount = filteredOrders?.reduce((total, order) => total + order.total, 0) || 0;

  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      await apiRequest("PATCH", `/api/orders/${selectedOrder.id}`, {
        status: newStatus
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Order status updated",
        description: `Order #${selectedOrder.id} status has been updated to ${newStatus}.`,
      });
      
      setIsUpdateStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Orders</h1>
        <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-500">Manage and process customer orders</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{filteredOrders?.length || 0}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <PackageOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <h3 className="text-2xl font-bold mt-1">
                  {filteredOrders?.filter(order => order.status === "pending").length || 0}
                </h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <ClipboardCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Shipped Orders</p>
                <h3 className="text-2xl font-bold mt-1">
                  {filteredOrders?.filter(order => order.status === "shipped").length || 0}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                <Truck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${totalAmount.toFixed(2)}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Orders List</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("");
                setDateFilter("all");
              }}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filter}>
              {filteredOrders && filteredOrders.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <Badge className={
                              order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : 
                              order.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" : 
                              "bg-red-100 text-red-800"
                            }>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.status);
                                  setIsUpdateStatusDialogOpen(true);
                                }}
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No orders found</h3>
                  <p className="mt-1 text-gray-500">
                    {filter !== "all" 
                      ? `You don't have any ${filter} orders at the moment.`
                      : "No orders match your search criteria."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order #${selectedOrder.id} - ${new Date(selectedOrder.createdAt).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <h3 className="font-medium text-gray-700">Customer Information</h3>
                  <p className="text-sm mt-1">
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                  </p>
                  <p className="text-sm">{selectedOrder.shippingAddress.email}</p>
                  <p className="text-sm">{selectedOrder.shippingAddress.phone}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Shipping Address</h3>
                  <p className="text-sm mt-1">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div>
                  <h3 className="font-medium text-gray-700">Payment Method</h3>
                  <p className="text-sm mt-1">{selectedOrder.paymentMethod.toUpperCase()}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Order Status</h3>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Payment Status</h3>
                  <Badge className={
                    selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-800 mt-1" : 
                    selectedOrder.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800 mt-1" : 
                    "bg-red-100 text-red-800 mt-1"
                  }>
                    {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={item.product.images && item.product.images.length > 0 
                            ? item.product.images[0] 
                            : "https://via.placeholder.com/150"}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">${item.total.toFixed(2)}</p>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center py-2">
                <div>
                  <h3 className="font-medium text-gray-700">Subtotal</h3>
                  <p className="text-sm mt-1">${selectedOrder.total.toFixed(2)}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Shipping</h3>
                  <p className="text-sm mt-1">$0.00</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Total</h3>
                  <p className="text-lg font-bold text-primary-600">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  setNewStatus(selectedOrder.status);
                  setIsUpdateStatusDialogOpen(true);
                }}>
                  Update Status
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Change the status for order #${selectedOrder.id}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium text-gray-700 mb-2">Current Status</h3>
            {selectedOrder && getStatusBadge(selectedOrder.status)}
            
            <h3 className="font-medium text-gray-700 mt-4 mb-2">New Status</h3>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorOrders;
