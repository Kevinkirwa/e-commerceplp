import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { 
  insertUserSchema, insertProductSchema, insertCategorySchema, 
  insertVendorSchema, insertOrderSchema, insertOrderItemSchema,
  insertReviewSchema, insertWishlistSchema
} from "@shared/schema";
import { z } from "zod";
import paymentRoutes from "./payments";
import { 
  getPersonalizedRecommendations, 
  getTrendingProducts, 
  getRelatedProducts, 
  getYouMightAlsoLike 
} from './services/recommendations';

// Add user object to Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

// Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "shopverse_jwt_secret";
const JWT_EXPIRES_IN = '7d';

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user has required role
const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ==== Auth Routes ====
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const hashedPassword = await hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: userData.role || "customer"
      });
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user information" });
    }
  });
  
  // ==== Category Routes ====
  
  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });
  
  // Get category by ID
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to get category" });
    }
  });
  
  // Create category (admin only)
  app.post("/api/categories", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Update category (admin only)
  app.patch("/api/categories/:id", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      
      const updatedCategory = await storage.updateCategory(id, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  // Delete category (admin only)
  app.delete("/api/categories/:id", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // ==== Vendor Routes ====
  
  // Get all vendors
  app.get("/api/vendors", async (_req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vendors" });
    }
  });
  
  // Get vendor by ID
  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.getVendor(parseInt(req.params.id));
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vendor" });
    }
  });
  
  // Create vendor (authenticated users)
  app.post("/api/vendors", isAuthenticated, async (req, res) => {
    try {
      // Check if user already has a vendor account
      const existingVendor = await storage.getVendorByUserId(req.user!.id);
      if (existingVendor) {
        return res.status(400).json({ message: "User already has a vendor account" });
      }
      
      const vendorData = insertVendorSchema.parse({
        ...req.body,
        userId: req.user!.id,
        isVerified: false
      });
      
      const vendor = await storage.createVendor(vendorData);
      
      // Update user role to vendor
      await storage.updateUser(req.user!.id, { role: "vendor" });
      
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor account" });
    }
  });
  
  // Update vendor (vendor owner or admin)
  app.patch("/api/vendors/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Check if user is vendor owner or admin
      if (vendor.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const vendorData = insertVendorSchema.partial().parse(req.body);
      
      // Only admin can update isVerified status
      if (req.user!.role !== "admin") {
        delete vendorData.isVerified;
      }
      
      const updatedVendor = await storage.updateVendor(id, vendorData);
      res.json(updatedVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  
  // ==== Product Routes ====
  
  // Get all products with filters
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        vendorId: req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined,
        search: req.query.search as string | undefined
      };
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  });
  
  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });
  
  // Create product (vendors only)
  app.post("/api/products", isAuthenticated, hasRole(["vendor", "admin"]), async (req, res) => {
    try {
      let vendorId = req.body.vendorId;
      
      // If user is vendor, must use their own vendor ID
      if (req.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.user!.id);
        if (!vendor) {
          return res.status(400).json({ message: "Vendor account not found" });
        }
        vendorId = vendor.id;
      }
      
      const productData = insertProductSchema.parse({
        ...req.body,
        vendorId
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  // Update product (vendor owner or admin)
  app.patch("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user is vendor owner or admin
      if (req.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.user!.id);
        if (!vendor || vendor.id !== product.vendorId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productData = insertProductSchema.partial().parse(req.body);
      
      // Don't allow changing vendorId
      delete productData.vendorId;
      
      const updatedProduct = await storage.updateProduct(id, productData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  // Delete product (vendor owner or admin)
  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user is vendor owner or admin
      if (req.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.user!.id);
        if (!vendor || vendor.id !== product.vendorId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      } else if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // ==== Order Routes ====
  
  // Get user orders
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      let userId, vendorId;
      
      // If admin, can see all orders
      if (req.user!.role === "admin") {
        userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
        vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined;
      } 
      // If vendor, can only see orders for their products
      else if (req.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.user!.id);
        if (!vendor) {
          return res.status(400).json({ message: "Vendor account not found" });
        }
        vendorId = vendor.id;
      } 
      // If customer, can only see their own orders
      else {
        userId = req.user!.id;
      }
      
      const orders = await storage.getOrders(userId, vendorId);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get orders" });
    }
  });
  
  // Get single order
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to view this order
      if (req.user!.role === "customer" && order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (req.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.user!.id);
        if (!vendor) {
          return res.status(400).json({ message: "Vendor account not found" });
        }
        
        const orderItems = await storage.getOrderItems(id);
        const hasVendorItems = orderItems.some(item => item.vendorId === vendor.id);
        
        if (!hasVendorItems) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }
      
      // Get order items
      const items = await storage.getOrderItems(id);
      
      res.json({
        ...order,
        items
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get order" });
    }
  });
  
  // Create order
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user!.id,
        status: "pending",
        paymentStatus: "pending"
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order items are required" });
      }
      
      const orderItems = await Promise.all(
        items.map(async (item: any) => {
          const orderItemData = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id,
            status: "pending"
          });
          
          return storage.createOrderItem(orderItemData);
        })
      );
      
      res.status(201).json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  // Update order (admin only)
  app.patch("/api/orders/:id", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      
      const updatedOrder = await storage.updateOrder(id, orderData);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update order" });
    }
  });
  
  // Update order item status (vendor or admin)
  app.patch("/api/order-items/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const orderItem = await storage.updateOrderItem(id, { status });
      if (!orderItem) {
        return res.status(404).json({ message: "Order item not found" });
      }
      
      res.json(orderItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order item" });
    }
  });
  
  // ==== Review Routes ====
  
  // Get product reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });
  
  // Get vendor reviews
  app.get("/api/vendors/:id/reviews", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const reviews = await storage.getVendorReviews(vendorId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });
  
  // Create review (authenticated users)
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  // ==== Wishlist Routes ====
  
  // Get user wishlist
  app.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const wishlist = await storage.getUserWishlist(req.user!.id);
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to get wishlist" });
    }
  });
  
  // Add product to wishlist
  app.post("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      const wishlistItem = await storage.addToWishlist({
        userId: req.user!.id,
        productId
      });
      
      res.status(201).json(wishlistItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });
  
  // Remove product from wishlist
  app.delete("/api/wishlist/:productId", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const removed = await storage.removeFromWishlist(req.user!.id, productId);
      
      if (!removed) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });
  
  // ==== Payment Routes ====
  app.use("/api/payments", paymentRoutes);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}