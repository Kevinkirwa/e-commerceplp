
import { storage } from "../storage";
import type { User, Order } from "@shared/schema";

export async function generateReferralCode(userId: number): Promise<string> {
  const user = await storage.getUser(userId);
  return `${user.username}-${Math.random().toString(36).substring(7)}`;
}

export async function processAffiliateCommission(order: Order, referralCode?: string) {
  if (!referralCode) return;
  
  const commission = order.total * 0.05; // 5% commission
  // Update affiliate's balance
  await storage.updateUserBalance(referralCode, commission);
}
