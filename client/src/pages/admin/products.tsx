import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product, Category, Vendor } from "@shared/schema";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  Filter, 
  ShoppingBag, 
  Eye, 
  CheckCircle, 
  XCircle,
  Trash2,
  Store,
  Tag
} from "lucide-react";

interface ProductWithDetails extends Product {
  categoryName?: string;
  vendorName?: string;
}

const AdminProducts: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [vendorFilter, setVendorFilter] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch products, categories, and vendors
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: vendors, isLoading: isLoadingVendors } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });
  
  // Combine product data with category and vendor details
  const productsWithDetails: ProductWithDetails[] = products?.map(product => {
    const category = categories?.find(cat => cat.id === product.categoryId);
    const vendor = vendors?.find(ven => ven.id === product.vendorId);
    
    return {
      ...product,
      categoryName: category?.name,
      vendorName: vendor?.storeName
    };
  }) || [];
  
  // Filter products based on criteria
  const filteredProducts = productsWithDetails?.filter(product => {
    // Filter by active status
    if (filter === "active" && !product.isActive) {
      return false;
    }
    if (filter === "inactive" && product.isActive) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter && product.categoryId !== categoryFilter) {
      return false;
    }
    
    // Filter by vendor
    if (vendorFilter && product.vendorId !== vendorFilter) {
      return false;
    }
    
    // Filter by search query (product name or description)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descMatch = product.description.toLowerCase().includes(searchLower);
      
      return nameMatch || descMatch;
    }
    
    return true;
  });

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await apiRequest("DELETE", `/api/products/${selectedProduct.id}`);
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Product deleted",
        description: `${selectedProduct.name} has been deleted successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast({
        title: "Failed to delete product",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle toggling product active status
  const handleToggleProductStatus = async (product: ProductWithDetails) => {
    try {
      await apiRequest("PATCH", `/api/products/${product.id}`, {
        isActive: !product.isActive
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: product.isActive ? "Product deactivated" : "Product activated",
        description: `${product.name} has been ${product.isActive ? "deactivated" : "activated"} successfully.`,
      });
    } catch (error) {
      toast({
        title: `Failed to ${product.isActive ? "deactivate" : "activate"} product`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Get badge for product stock status
  const getStockBadge = (stockQuantity: number) => {
    if (stockQuantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stockQuantity <= 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  if (isLoadingProducts || isLoadingCategories || isLoadingVendors) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Product Management</h1>
        <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-500">Manage all products across vendors</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Total of {products?.length || 0} products from {vendors?.length || 0} vendors</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              <Select
                value={categoryFilter?.toString() || ""}
                onValueChange={(value) => setCategoryFilter(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={vendorFilter?.toString() || ""}
                onValueChange={(value) => setVendorFilter(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Vendors</SelectItem>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.storeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("");
                setCategoryFilter(undefined);
                setVendorFilter(undefined);
              }}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filter}>
              {filteredProducts && filteredProducts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={product.images && product.images.length > 0 
                                    ? product.images[0] 
                                    : "https://via.placeholder.com/48"}
                                  alt={product.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.categoryName}</Badge>
                          </TableCell>
                          <TableCell>{product.vendorName}</TableCell>
                          <TableCell>
                            {product.salePrice ? (
                              <div>
                                <span className="font-medium text-primary-600">${product.salePrice.toFixed(2)}</span>
                                <span className="text-xs text-gray-500 line-through ml-1">
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium">${product.price.toFixed(2)}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStockBadge(product.stockQuantity)}
                            <span className="text-xs text-gray-500 block">
                              {product.stockQuantity} units
                            </span>
                          </TableCell>
                          <TableCell>
                            {product.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className={product.isActive ? "text-amber-500" : "text-green-600"}
                                onClick={() => handleToggleProductStatus(product)}
                              >
                                {product.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
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
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No products found</h3>
                  <p className="mt-1 text-gray-500">
                    {filter !== "all" 
                      ? `No ${filter} products available.`
                      : searchQuery || categoryFilter || vendorFilter 
                        ? "No products match your search criteria." 
                        : "No products available."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Detailed information about ${selectedProduct.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={selectedProduct.images && selectedProduct.images.length > 0 
                        ? selectedProduct.images[0] 
                        : "https://via.placeholder.com/200"}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedProduct.images.slice(1, 4).map((img, index) => (
                        <div key={index} className="aspect-square rounded overflow-hidden bg-gray-100">
                          <img 
                            src={img} 
                            alt={`${selectedProduct.name} - view ${index + 2}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="sm:w-2/3 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{selectedProduct.name}</h3>
                    <p className="text-gray-500 text-sm">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      {selectedProduct.isActive ? (
                        <Badge className="bg-green-100 text-green-800 mt-1">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-1">Inactive</Badge>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Stock Status</p>
                      <div className="mt-1">{getStockBadge(selectedProduct.stockQuantity)}</div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-medium">${selectedProduct.price.toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Sale Price</p>
                      <p className="text-sm font-medium">
                        {selectedProduct.salePrice 
                          ? `$${selectedProduct.salePrice.toFixed(2)}` 
                          : "Not on sale"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <div className="flex items-center mt-1">
                        <Tag className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-sm font-medium">{selectedProduct.categoryName}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <div className="flex items-center mt-1">
                        <Store className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-sm font-medium">{selectedProduct.vendorName}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedProduct.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Product URL</p>
                      <p className="text-sm font-medium truncate">
                        /products/{selectedProduct.slug}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer Ratings</p>
                    <div className="flex items-center">
                      <div className="flex text-secondary">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(selectedProduct.rating) ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            ) : i < Math.ceil(selectedProduct.rating) && selectedProduct.rating % 1 >= 0.5 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                              </svg>
                            )}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium ml-2">
                        {selectedProduct.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({selectedProduct.ratingCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                
                <Button 
                  variant={selectedProduct.isActive ? "secondary" : "default"}
                  onClick={() => {
                    handleToggleProductStatus(selectedProduct);
                    setIsViewDialogOpen(false);
                  }}
                >
                  {selectedProduct.isActive 
                    ? <><XCircle className="mr-2 h-4 w-4" /> Deactivate Product</>
                    : <><CheckCircle className="mr-2 h-4 w-4" /> Activate Product</>
                  }
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden">
                <img 
                  src={selectedProduct.images && selectedProduct.images.length > 0 
                    ? selectedProduct.images[0] 
                    : "https://via.placeholder.com/48"}
                  alt={selectedProduct.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">${selectedProduct.price.toFixed(2)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
