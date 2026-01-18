import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import SomeWorks from "@/components/SomeWorks";
import ReviewCard from "@/components/ReviewCard";
import { GridBackgroundDemo } from "@/components/ui/GridBackground";
import ServiceProvider from "@/components/ServiceProvider";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      
      <HeroSection />
      <FeaturedSection />
      
      {/* <SomeWorks /> */}
      {/* <ReviewCard /> */}
      {/* <GridBackgroundDemo /> */}
      <ServiceProvider/>
      <Footer />
    </main>
  );
}
