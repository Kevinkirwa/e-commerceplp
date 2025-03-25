import {
  users, categories, vendors, products, orders, orderItems, reviews, wishlists,
  type User, type InsertUser, type Category, type InsertCategory, 
  type Vendor, type InsertVendor, type Product, type InsertProduct,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Review, type InsertReview, type Wishlist, type InsertWishlist
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByUserId(userId: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  
  // Product methods
  getProducts(filters?: { categoryId?: number, vendorId?: number, search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(userId?: number, vendorId?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Order Item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  getVendorOrderItems(vendorId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, orderItem: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;
  
  // Review methods
  getProductReviews(productId: number): Promise<Review[]>;
  getVendorReviews(vendorId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Wishlist methods
  getUserWishlist(userId: number): Promise<Wishlist[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, productId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private vendors: Map<number, Vendor>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private wishlists: Map<number, Wishlist>;
  private currentIds: {
    users: number;
    categories: number;
    vendors: number;
    products: number;
    orders: number;
    orderItems: number;
    reviews: number;
    wishlists: number;
  };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.vendors = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.wishlists = new Map();
    this.currentIds = {
      users: 1,
      categories: 1,
      vendors: 1,
      products: 1,
      orders: 1,
      orderItems: 1,
      reviews: 1,
      wishlists: 1,
    };

    // Initialize with dummy data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    this.createUser({
      username: "admin",
      email: "admin@shopverse.com",
      password: "$2b$10$Xtw5lwK5FJCbJkG5UGHP8O2V2XCS.z7D2T25f/W7iXVa7YLe.H5Gq", // "password"
      role: "admin"
    });

    // Create categories
    const categories = [
      { name: "Electronics", slug: "electronics", description: "Electronic gadgets and devices", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500" },
      { name: "Fashion", slug: "fashion", description: "Clothing, shoes, and accessories", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500" },
      { name: "Home & Garden", slug: "home-garden", description: "Home decor and garden supplies", image: "https://images.unsplash.com/photo-1606826822218-c9fe3642b8e6?w=500" },
      { name: "Beauty", slug: "beauty", description: "Beauty and personal care products", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500" },
      { name: "Sports", slug: "sports", description: "Sports equipment and fitness gear", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500" },
      { name: "Toys", slug: "toys", description: "Toys and games for all ages", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500" },
    ];

    categories.forEach(category => this.createCategory(category));

    // Create vendor users and vendor profiles
    const vendorUsers = [
      { username: "techworld", email: "tech@shopverse.com", password: "$2b$10$Xtw5lwK5FJCbJkG5UGHP8O2V2XCS.z7D2T25f/W7iXVa7YLe.H5Gq", role: "vendor" },
      { username: "fashionhub", email: "fashion@shopverse.com", password: "$2b$10$Xtw5lwK5FJCbJkG5UGHP8O2V2XCS.z7D2T25f/W7iXVa7YLe.H5Gq", role: "vendor" },
      { username: "homeessentials", email: "home@shopverse.com", password: "$2b$10$Xtw5lwK5FJCbJkG5UGHP8O2V2XCS.z7D2T25f/W7iXVa7YLe.H5Gq", role: "vendor" },
      { username: "beautyzone", email: "beauty@shopverse.com", password: "$2b$10$Xtw5lwK5FJCbJkG5UGHP8O2V2XCS.z7D2T25f/W7iXVa7YLe.H5Gq", role: "vendor" },
    ];

    vendorUsers.forEach((user, index) => {
      const createdUser = this.createUser(user);
      const vendors = [
        { userId: createdUser.id, storeName: "Tech World", storeDescription: "The latest in tech gadgets", logo: "https://images.unsplash.com/photo-1560343787-3b671997bdab?w=100", banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800", isVerified: true, rating: 4.8, ratingCount: 230 },
        { userId: createdUser.id, storeName: "Fashion Hub", storeDescription: "Trendy fashion for everyone", logo: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=100", banner: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800", isVerified: true, rating: 4.7, ratingCount: 184 },
        { userId: createdUser.id, storeName: "Home Essentials", storeDescription: "Everything for your home", logo: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=100", banner: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800", isVerified: true, rating: 4.9, ratingCount: 312 },
        { userId: createdUser.id, storeName: "Beauty Zone", storeDescription: "Beauty products for all", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100", banner: "https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?w=800", isVerified: true, rating: 4.6, ratingCount: 158 },
      ];
      
      this.createVendor(vendors[index]);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const newUser: User = { ...user, id, createdAt: new Date(), isVerified: false, loyaltyPoints: 0 };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUserId(userId: number): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(
      (vendor) => vendor.userId === userId
    );
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.currentIds.vendors++;
    const newVendor: Vendor = { ...vendor, id, rating: 0, ratingCount: 0 };
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, vendorData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...vendorData };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  // Product methods
  async getProducts(filters?: { categoryId?: number, vendorId?: number, search?: string }): Promise<Product[]> {
    let filteredProducts = Array.from(this.products.values());
    
    if (filters) {
      if (filters.categoryId) {
        filteredProducts = filteredProducts.filter(product => product.categoryId === filters.categoryId);
      }
      
      if (filters.vendorId) {
        filteredProducts = filteredProducts.filter(product => product.vendorId === filters.vendorId);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          product => product.name.toLowerCase().includes(searchTerm) || 
                    product.description.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    return filteredProducts;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentIds.products++;
    const newProduct: Product = { 
      ...product, 
      id, 
      rating: 0, 
      ratingCount: 0,
      createdAt: new Date() 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getOrders(userId?: number, vendorId?: number): Promise<Order[]> {
    let filteredOrders = Array.from(this.orders.values());
    
    if (userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === userId);
    }
    
    if (vendorId) {
      const vendorOrderItems = await this.getVendorOrderItems(vendorId);
      const orderIds = new Set(vendorOrderItems.map(item => item.orderId));
      filteredOrders = filteredOrders.filter(order => orderIds.has(order.id));
    }
    
    return filteredOrders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentIds.orders++;
    const newOrder: Order = { ...order, id, createdAt: new Date() };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...orderData };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async getVendorOrderItems(vendorId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.vendorId === vendorId
    );
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentIds.orderItems++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async updateOrderItem(id: number, orderItemData: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const orderItem = this.orderItems.get(id);
    if (!orderItem) return undefined;
    
    const updatedOrderItem = { ...orderItem, ...orderItemData };
    this.orderItems.set(id, updatedOrderItem);
    return updatedOrderItem;
  }

  // Review methods
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }

  async getVendorReviews(vendorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.vendorId === vendorId
    );
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentIds.reviews++;
    const newReview: Review = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    
    // Update product rating
    const product = await this.getProduct(review.productId);
    if (product) {
      const productReviews = await this.getProductReviews(review.productId);
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / productReviews.length;
      
      await this.updateProduct(product.id, {
        rating: avgRating,
        ratingCount: productReviews.length
      });
    }
    
    // Update vendor rating
    const vendor = await this.getVendor(review.vendorId);
    if (vendor) {
      const vendorReviews = await this.getVendorReviews(review.vendorId);
      const totalRating = vendorReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / vendorReviews.length;
      
      await this.updateVendor(vendor.id, {
        ...vendor,
        rating: avgRating,
        ratingCount: vendorReviews.length
      });
    }
    
    return newReview;
  }

  // Wishlist methods
  async getUserWishlist(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values()).filter(
      (wishlist) => wishlist.userId === userId
    );
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    // Check if already exists
    const existing = Array.from(this.wishlists.values()).find(
      (item) => item.userId === wishlist.userId && item.productId === wishlist.productId
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.currentIds.wishlists++;
    const newWishlist: Wishlist = { ...wishlist, id, createdAt: new Date() };
    this.wishlists.set(id, newWishlist);
    return newWishlist;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    const wishlist = Array.from(this.wishlists.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
    
    if (wishlist) {
      return this.wishlists.delete(wishlist.id);
    }
    
    return false;
  }
}

export const storage = new MemStorage();
