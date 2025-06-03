import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { PartnersSection } from "@/components/landing/partners-section";
import {TestimonialsSection} from "@/components/landing/testimonials-section";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <PartnersSection />
      <TestimonialsSection  />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
