import { storage } from "../storage";
import type { Product, User } from "@shared/schema";
import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

export async function getPersonalizedRecommendations(userId: number, limit: number = 6): Promise<Product[]> {
  try {
    // Get user's order history and preferences
    const orders = await storage.getOrders(userId);
    const wishlist = await storage.getUserWishlist(userId);
    const user = await storage.getUser(userId);

    // Generate personalized recommendations using AI
    const prompt = `Based on user preferences:
      - Previous orders: ${orders.map(o => o.id).join(', ')}
      - Wishlist items: ${wishlist.map(w => w.productId).join(', ')}
      - User profile: ${JSON.stringify(user)}
      Suggest product categories and features they might like.`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 100
    });

    const suggestions = completion.data.choices[0].text?.split('\n') || [];

    // Get recommended products based on AI suggestions
    const recommendedProducts = await storage.getProducts({
      categoryIds: suggestions.map(s => parseInt(s))
    });

    return recommendedProducts.slice(0, limit);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return getTrendingProducts(limit);
  }
}

/**
 * Get trending products based on order frequency and ratings
 * @param limit - The maximum number of trending products to return
 * @returns An array of trending products
 */
export async function getTrendingProducts(limit: number = 6): Promise<Product[]> {
  try {
    // Get all products
    const allProducts = await storage.getProducts();
    
    // Get all order items to calculate product popularity
    const allOrders = await storage.getOrders();
    const orderItemPromises = allOrders.map(order => storage.getOrderItems(order.id));
    const allOrderItems = await Promise.all(orderItemPromises);
    const orderItems = allOrderItems.flat();
    
    // Count product occurrences in orders
    const productOrderCounts = new Map<number, number>();
    orderItems.forEach(item => {
      const currentCount = productOrderCounts.get(item.productId) || 0;
      productOrderCounts.set(item.productId, currentCount + 1);
    });
    
    // Score products based on:
    // - Number of times ordered
    // - Rating
    // - Whether they're on sale
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      
      // Order frequency score
      const orderCount = productOrderCounts.get(product.id) || 0;
      score += orderCount * 2;
      
      // Rating score
      score += product.rating * 2;
      
      // Sale score
      if (product.salePrice && product.salePrice < product.price) {
        score += 5;
      }
      
      return { product, score };
    });
    
    // Sort by score and return top products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  } catch (error) {
    console.error('Error generating trending products:', error);
    return [];
  }
}

/**
 * Get related products for a specific product
 * @param productId - The ID of the product to get related products for
 * @param limit - The maximum number of related products to return
 * @returns An array of related products
 */
export async function getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
  try {
    // Get the product
    const product = await storage.getProduct(productId);
    if (!product) {
      return [];
    }
    
    // Get products from the same category
    const sameCategoryProducts = await storage.getProducts({ categoryId: product.categoryId });
    
    // Filter out the original product
    const relatedProducts = sameCategoryProducts.filter(p => p.id !== productId);
    
    // Get products from the same vendor
    const sameVendorProducts = await storage.getProducts({ vendorId: product.vendorId });
    const sameVendorDifferentCategory = sameVendorProducts.filter(
      p => p.id !== productId && p.categoryId !== product.categoryId
    );
    
    // Combine and deduplicate
    const combinedProducts = [...relatedProducts, ...sameVendorDifferentCategory];
    const uniqueProductIds = new Set<number>();
    const uniqueProducts: Product[] = [];
    
    for (const product of combinedProducts) {
      if (!uniqueProductIds.has(product.id)) {
        uniqueProductIds.add(product.id);
        uniqueProducts.push(product);
      }
    }
    
    // Return limited number of related products
    return uniqueProducts.slice(0, limit);
  } catch (error) {
    console.error('Error generating related products:', error);
    return [];
  }
}

/**
 * Get "you might also like" product recommendations
 * @param products - Products the user has viewed or added to cart
 * @param limit - The maximum number of recommendations to return
 * @returns An array of "you might also like" product recommendations
 */
export async function getYouMightAlsoLike(
  products: Product[],
  userId?: number,
  limit: number = 6
): Promise<Product[]> {
  try {
    if (products.length === 0) {
      // If no products provided and user is logged in, get personalized recommendations
      if (userId) {
        return getPersonalizedRecommendations(userId, limit);
      }
      // Otherwise return trending products
      return getTrendingProducts(limit);
    }
    
    // Extract categories and vendors from input products
    const categoryIds = [...new Set(products.map(product => product.categoryId))];
    const vendorIds = [...new Set(products.map(product => product.vendorId))];
    const inputProductIds = products.map(product => product.id);
    
    // Get products from the same categories
    let recommendations: Product[] = [];
    for (const categoryId of categoryIds) {
      const categoryProducts = await storage.getProducts({ categoryId });
      recommendations = [...recommendations, ...categoryProducts];
    }
    
    // Add some products from the same vendors but different categories
    for (const vendorId of vendorIds) {
      const vendorProducts = await storage.getProducts({ vendorId });
      const differentCategoryProducts = vendorProducts.filter(
        product => !categoryIds.includes(product.categoryId)
      );
      recommendations = [...recommendations, ...differentCategoryProducts];
    }
    
    // Filter out the input products and deduplicate
    const uniqueProductIds = new Set<number>();
    const uniqueRecommendations: Product[] = [];
    
    for (const product of recommendations) {
      if (!inputProductIds.includes(product.id) && !uniqueProductIds.has(product.id)) {
        uniqueProductIds.add(product.id);
        uniqueRecommendations.push(product);
      }
    }
    
    // Score products based on:
    // - Shared category with input products
    // - Shared vendor with input products
    // - Rating
    // - Whether they're on sale
    const scoredRecommendations = uniqueRecommendations.map(product => {
      let score = 10; // Base score
      
      // Category match
      if (categoryIds.includes(product.categoryId)) {
        score += 5;
      }
      
      // Vendor match
      if (vendorIds.includes(product.vendorId)) {
        score += 3;
      }
      
      // Rating score
      score += product.rating;
      
      // Sale score
      if (product.salePrice && product.salePrice < product.price) {
        score += 2;
      }
      
      return { product, score };
    });
    
    // Sort by score and return top recommendations
    return scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  } catch (error) {
    console.error('Error generating "you might also like" recommendations:', error);
    return getTrendingProducts(limit);
  }
}