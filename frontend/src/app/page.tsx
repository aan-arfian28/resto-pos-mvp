import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { MetricSection } from "@/components/landing/MetricSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <MetricSection />
      <FeatureCards />
      <Testimonials />
      <Footer />
    </main>
  );
}
