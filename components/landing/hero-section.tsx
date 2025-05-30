import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className=" md:px-12 px-6 relative min-h-screen flex items-center bg-muted overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left relative z-10">
            <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
              🎯 Atteins tes objectifs
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
             une promesse à tenir, un objectif à accomplir 
            </h1>
            <p className="text-xl md:text-2xl text-secondary/80 mb-10">
              Défie-toi, engage-toi, aide une asso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Link href={"engagement"}>Je lance mon défi</Link>
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="font-semibold text-lg px-8 py-6 rounded-full"
              >
                En savoir plus
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-secondary">10k+</p>
                <p className="text-sm text-secondary/70">Défis relevés</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary">50k€+</p>
                <p className="text-sm text-secondary/70">Reversés aux assos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary">95%</p>
                <p className="text-sm text-secondary/70">Taux de réussite</p>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl"></div>
            <Image
              src="https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg"
              alt="Success Illustration"
              fill
              className="object-cover rounded-3xl"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Abstract shapes */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
    </section>
  );
}