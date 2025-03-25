import {
  User, Category, Vendor, Product, Order, OrderItem, Review, Wishlist,
  users, categories, vendors, products, orders, orderItems, reviews, wishlists
} from "@shared/schema";

class MemStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private vendors: Map<number, Vendor>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private wishlists: Map<number, Wishlist>;
  private currentIds: { [key: string]: number };
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

    this.initializeData();
  }

  initializeData() {
    this.createUser({
      username: "admin",
      email: "admin@shopverse.com",
      password: "$2b$10$Xtw5lwK5FJCbJkG5UGHP8O2V2XCS.z7D2T25f/W7iXVa7YLe.H5Gq",
      role: "admin",
    });

    const categories = [
      { name: "Electronics", slug: "electronics", description: "Electronic gadgets", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500" },
      { name: "Fashion", slug: "fashion", description: "Clothing, shoes, and accessories", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500" },
    ];

    categories.forEach((category) => this.createCategory(category));
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'isVerified' | 'loyaltyPoints'>) {
    const id = this.currentIds.users++;
    const newUser = { ...user, id, createdAt: new Date(), isVerified: false, loyaltyPoints: 0 };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id, userData) {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCategories() {
    return Array.from(this.categories.values());
  }

  async getCategory(id) {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug) {
    return Array.from(this.categories.values()).find((category) => category.slug === slug);
  }

  async createCategory(category) {
    const id = this.currentIds.categories++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id, categoryData) {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id) {
    return this.categories.delete(id);
  }
}

export const storage = new MemStorage();
