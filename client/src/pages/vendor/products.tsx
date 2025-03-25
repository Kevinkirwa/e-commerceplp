import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product, Category } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  SlidersHorizontal, 
  Package,
  AlertCircle 
} from "lucide-react";

// Form schema for adding and editing products
const productSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  salePrice: z.coerce.number().positive({ message: "Sale price must be positive" }).optional().nullable(),
  categoryId: z.coerce.number({ invalid_type_error: "Please select a category" }),
  stockQuantity: z.coerce.number().int().nonnegative({ message: "Stock must be 0 or more" }),
  images: z.array(z.string()).min(1, { message: "At least one image URL is required" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

const VendorProducts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
  const [filterStock, setFilterStock] = useState<string | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const { toast } = useToast();

  // Fetch vendor products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Fetch categories for the product form
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const filteredProducts = products?.filter(product => {
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (filterCategory && product.categoryId !== filterCategory) {
      return false;
    }
    
    // Filter by stock
    if (filterStock === "in-stock" && product.stockQuantity <= 0) {
      return false;
    }
    if (filterStock === "out-of-stock" && product.stockQuantity > 0) {
      return false;
    }
    if (filterStock === "low-stock" && (product.stockQuantity <= 0 || product.stockQuantity > 10)) {
      return false;
    }
    
    return true;
  });

  // Form for adding/editing products
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      salePrice: null,
      categoryId: 0,
      stockQuantity: 0,
      images: [],
      slug: "",
    },
  });

  // Reset form for adding new product
  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      salePrice: null,
      categoryId: 0,
      stockQuantity: 0,
      images: [],
      slug: "",
    });
    setImageUrls([]);
  };

  // Set form values for editing a product
  const setFormForEdit = (product: Product) => {
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || null,
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      images: product.images || [],
      slug: product.slug,
    });
    setImageUrls(product.images || []);
  };

  // Add new image URL to the list
  const handleAddImageUrl = () => {
    if (!newImageUrl) return;
    
    const urlPattern = /^https?:\/\/.+$/;
    if (!urlPattern.test(newImageUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    setImageUrls([...imageUrls, newImageUrl]);
    form.setValue("images", [...imageUrls, newImageUrl]);
    setNewImageUrl("");
  };

  // Remove image URL from the list
  const handleRemoveImageUrl = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    form.setValue("images", updatedUrls);
  };

  // Handle form submission for adding a product
  const handleAddProduct = async (data: ProductFormValues) => {
    try {
      await apiRequest("POST", "/api/products", data);
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Product added",
        description: "Your product has been added successfully.",
      });
      
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Failed to add product",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle form submission for editing a product
  const handleEditProduct = async (data: ProductFormValues) => {
    if (!selectedProduct) return;
    
    try {
      await apiRequest("PATCH", `/api/products/${selectedProduct.id}`, data);
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully.",
      });
      
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Failed to update product",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await apiRequest("DELETE", `/api/products/${selectedProduct.id}`);
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully.",
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

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Products</h1>
        <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-gray-500">Manage your store products</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for your new product. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddProduct)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="product-url-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be used in the product URL (e.g., /products/product-slug)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your product..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            placeholder="Leave empty for no sale" 
                            {...field} 
                            value={field.value === null ? "" : field.value}
                            onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <div className="space-y-2">
                        <div className="flex">
                          <Input
                            placeholder="Enter image URL"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="flex-1 rounded-r-none"
                          />
                          <Button 
                            type="button" 
                            onClick={handleAddImageUrl}
                            className="rounded-l-none"
                          >
                            Add
                          </Button>
                        </div>
                        
                        {imageUrls.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`Product preview ${index + 1}`} 
                                  className="h-24 w-full object-contain border rounded"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                  onClick={() => handleRemoveImageUrl(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No images added yet</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filterCategory?.toString() || ""}
                onValueChange={(value) => setFilterCategory(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
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
                value={filterStock || ""}
                onValueChange={(value) => setFilterStock(value || undefined)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Stock</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock (≤ 10)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("");
                setFilterCategory(undefined);
                setFilterStock(undefined);
              }}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
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
                                : "https://via.placeholder.com/150"}
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
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
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
                        {product.stockQuantity > 0 ? (
                          <Badge className={product.stockQuantity <= 10 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {product.stockQuantity} in stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Out of stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedProduct(product);
                              setFormForEdit(product);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
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
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No products found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery || filterCategory || filterStock 
                  ? "Try adjusting your search filters"
                  : "Start adding products to your store"}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for your product. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditProduct)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="product-url-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used in the product URL (e.g., /products/product-slug)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="Leave empty for no sale" 
                          {...field} 
                          value={field.value === null ? "" : field.value}
                          onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value.toString()}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <div className="space-y-2">
                      <div className="flex">
                        <Input
                          placeholder="Enter image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="flex-1 rounded-r-none"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddImageUrl}
                          className="rounded-l-none"
                        >
                          Add
                        </Button>
                      </div>
                      
                      {imageUrls.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {imageUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={url} 
                                alt={`Product preview ${index + 1}`} 
                                className="h-24 w-full object-contain border rounded"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                onClick={() => handleRemoveImageUrl(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No images added yet</p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
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
                    : "https://via.placeholder.com/150"}
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

export default VendorProducts;
