import React from "react";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromotionBanner from "@/components/home/PromotionBanner";
import TopVendors from "@/components/home/TopVendors";
import Features from "@/components/home/Features";
import Newsletter from "@/components/home/Newsletter";

const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <PromotionBanner />
      <TopVendors />
      <Features />
      <Newsletter />
    </>
  );
};

export default Home;
