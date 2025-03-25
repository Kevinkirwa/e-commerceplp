import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Vendor, User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Store, 
  Eye, 
  CheckCircle, 
  XCircle,
  Award,
  UserX
} from "lucide-react";

interface VendorWithUser extends Vendor {
  user?: User;
}

const AdminVendors: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorWithUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch all vendors
  const { data: vendors, isLoading: isLoadingVendors } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });
  
  // Fetch all users to get vendor user details
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Combine vendors with user data
  const vendorsWithUsers: VendorWithUser[] = vendors?.map(vendor => {
    const user = users?.find(user => user.id === vendor.userId);
    return { ...vendor, user };
  }) || [];
  
  // Filter vendors based on criteria
  const filteredVendors = vendorsWithUsers?.filter(vendor => {
    // Filter by verification status
    if (filter === "verified" && !vendor.isVerified) {
      return false;
    }
    if (filter === "pending" && vendor.isVerified) {
      return false;
    }
    
    // Filter by search query (vendor name or user email)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = vendor.storeName.toLowerCase().includes(searchLower);
      const emailMatch = vendor.user?.email.toLowerCase().includes(searchLower) || false;
      
      return nameMatch || emailMatch;
    }
    
    return true;
  });

  // Handle vendor approval
  const handleApproveVendor = async () => {
    if (!selectedVendor) return;
    
    try {
      await apiRequest("PATCH", `/api/vendors/${selectedVendor.id}`, {
        isVerified: true
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      
      toast({
        title: "Vendor approved",
        description: `${selectedVendor.storeName} has been approved and can now sell products.`,
      });
      
      setIsApproveDialogOpen(false);
      setSelectedVendor(null);
    } catch (error) {
      toast({
        title: "Failed to approve vendor",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle vendor rejection
  const handleRejectVendor = async () => {
    if (!selectedVendor) return;
    
    try {
      await apiRequest("PATCH", `/api/vendors/${selectedVendor.id}`, {
        isVerified: false
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      
      toast({
        title: "Vendor rejected",
        description: `${selectedVendor.storeName} has been rejected.`,
      });
      
      setIsRejectDialogOpen(false);
      setSelectedVendor(null);
    } catch (error) {
      toast({
        title: "Failed to reject vendor",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoadingVendors || isLoadingUsers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Management</h1>
        <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-gray-500">Approve and manage platform vendors</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Vendors List</CardTitle>
              <CardDescription>
                {filteredVendors?.filter(v => !v.isVerified).length || 0} pending approval
              </CardDescription>
            </div>
            
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Vendors</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filter}>
              {filteredVendors && filteredVendors.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                <img 
                                  src={vendor.logo || "https://via.placeholder.com/40?text=Logo"} 
                                  alt={vendor.storeName} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{vendor.storeName}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {vendor.storeDescription}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{vendor.user?.username}</p>
                            <p className="text-xs text-gray-500">{vendor.user?.email}</p>
                          </TableCell>
                          <TableCell>
                            {vendor.isVerified ? (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-400 text-yellow-600">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-secondary mr-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                              </span>
                              <span>{vendor.rating.toFixed(1)}</span>
                              <span className="text-xs text-gray-500 ml-1">({vendor.ratingCount})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{Math.floor(Math.random() * 50) + 1}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {!vendor.isVerified ? (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-green-600"
                                  onClick={() => {
                                    setSelectedVendor(vendor);
                                    setIsApproveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500"
                                  onClick={() => {
                                    setSelectedVendor(vendor);
                                    setIsRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No vendors found</h3>
                  <p className="mt-1 text-gray-500">
                    {filter !== "all" 
                      ? `No ${filter === "verified" ? "verified" : "pending"} vendors available.`
                      : searchQuery ? "No vendors match your search criteria." : "No vendors available."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* View Vendor Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              {selectedVendor && `Detailed information about ${selectedVendor.storeName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={selectedVendor.logo || "https://via.placeholder.com/200?text=Logo"} 
                      alt={`${selectedVendor.storeName} logo`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="sm:w-2/3 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{selectedVendor.storeName}</h3>
                    <p className="text-gray-500 text-sm">{selectedVendor.storeDescription}</p>
                    
                    <div className="flex items-center mt-2">
                      <span className="text-secondary mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium">{selectedVendor.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500 ml-1">({selectedVendor.ratingCount} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      {selectedVendor.isVerified ? (
                        <Badge className="bg-green-100 text-green-800 mt-1">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-600 mt-1">Pending Approval</Badge>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Products</p>
                      <p className="text-sm font-medium">{Math.floor(Math.random() * 50) + 1} products</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Total Sales</p>
                      <p className="text-sm font-medium">{Math.floor(Math.random() * 500) + 50} orders</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-sm font-medium">${(Math.random() * 10000 + 1000).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Store Banner</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={selectedVendor.banner || "https://via.placeholder.com/800x300?text=Banner"} 
                    alt={`${selectedVendor.storeName} banner`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Vendor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="text-sm font-medium">{selectedVendor.user?.username || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedVendor.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium">
                      {selectedVendor.user?.firstName && selectedVendor.user?.lastName ? 
                        `${selectedVendor.user.firstName} ${selectedVendor.user.lastName}` : 
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{selectedVendor.user?.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">
                      {selectedVendor.user?.address ? 
                        `${selectedVendor.user.address}, ${selectedVendor.user.city || ""}, ${selectedVendor.user.country || ""}` : 
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registration Date</p>
                    <p className="text-sm font-medium">
                      {selectedVendor.user?.createdAt ? 
                        new Date(selectedVendor.user.createdAt).toLocaleDateString() : 
                        "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                
                {!selectedVendor.isVerified ? (
                  <Button 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsApproveDialogOpen(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Vendor
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Revoke Verification
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Approve Vendor Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this vendor? They will be able to sell products on the platform.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                <img 
                  src={selectedVendor.logo || "https://via.placeholder.com/48?text=Logo"} 
                  alt={selectedVendor.storeName} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{selectedVendor.storeName}</p>
                <p className="text-sm text-gray-500">{selectedVendor.user?.email}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveVendor} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject/Revoke Vendor Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedVendor?.isVerified ? "Revoke Verification" : "Reject Vendor"}
            </DialogTitle>
            <DialogDescription>
              {selectedVendor?.isVerified 
                ? "Are you sure you want to revoke this vendor's verification? They will no longer be able to sell on the platform."
                : "Are you sure you want to reject this vendor? They will not be able to sell on the platform."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                <img 
                  src={selectedVendor.logo || "https://via.placeholder.com/48?text=Logo"} 
                  alt={selectedVendor.storeName} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{selectedVendor.storeName}</p>
                <p className="text-sm text-gray-500">{selectedVendor.user?.email}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectVendor}>
              {selectedVendor?.isVerified 
                ? <><UserX className="mr-2 h-4 w-4" /> Revoke</>
                : <><XCircle className="mr-2 h-4 w-4" /> Reject</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVendors;
