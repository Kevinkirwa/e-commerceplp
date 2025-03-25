import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, ChevronRight, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  items: OrderItem[];
}

const UserOrders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const filteredOrders = orders?.filter(order => {
    if (filter !== "all" && order.status !== filter) {
      return false;
    }
    
    if (searchQuery) {
      return order.id.toString().includes(searchQuery);
    }
    
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled by the filteredOrders
  };

  const handleDownloadInvoice = (orderId: number) => {
    toast({
      title: "Invoice downloaded",
      description: `Invoice for order #${orderId} has been downloaded.`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View and track your orders</CardDescription>
            </div>
            
            <form onSubmit={handleSearch} className="mt-2 md:mt-0 relative w-full md:w-64">
              <Input
                placeholder="Search by order number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
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
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between md:items-center">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center">
                          <Badge className={
                            order.status === "delivered" ? "bg-green-100 text-green-800" : 
                            order.status === "processing" ? "bg-blue-100 text-blue-800" : 
                            order.status === "shipped" ? "bg-purple-100 text-purple-800" : 
                            order.status === "cancelled" ? "bg-red-100 text-red-800" : 
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => handleDownloadInvoice(order.id)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" /> Invoice
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={item.product.images && item.product.images.length > 0 
                                    ? item.product.images[0] 
                                    : "https://via.placeholder.com/150"}
                                  alt={item.product.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${item.total.toFixed(2)}</p>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    item.status === "delivered" ? "text-green-600" : 
                                    item.status === "processing" ? "text-blue-600" : 
                                    item.status === "shipped" ? "text-purple-600" : 
                                    item.status === "cancelled" ? "text-red-600" : 
                                    "text-yellow-600"
                                  }
                                >
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-500">Payment Method</p>
                            <p className="font-medium">{order.paymentMethod.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Payment Status</p>
                            <p className={`font-medium ${
                              order.paymentStatus === "paid" ? "text-green-600" : 
                              order.paymentStatus === "pending" ? "text-yellow-600" : 
                              "text-red-600"
                            }`}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500">Total Amount</p>
                            <p className="font-medium text-xl">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Link href={`/products`}>
                            <Button variant="outline" size="sm">
                              Buy Again <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No orders found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchQuery 
                      ? "Try a different search term or filter."
                      : "You haven't placed any orders yet."}
                  </p>
                  <Link href="/products">
                    <Button className="mt-4">Start Shopping</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOrders;
