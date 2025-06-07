import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <>

      <section className=" md:px-12 px-6 relative min-h-screen flex items-center bg-muted overflow-hidden">
        <LinesComponent />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex justify-center">
            <div className="text-center relative z-10 max-w-4xl">
              <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                🎯 Atteins tes objectifs
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold  mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800">
                une promesse à tenir, un objectif à accomplir
              </h1>
              <p className="text-xl md:text-2xl text-secondary/80 mb-10">
                Défie-toi, engage-toi, aide une asso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-14 py-7 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 justify-center"
                >
                  <Link href={"engagement"}>Je lance mon défi</Link>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-12 flex items-center gap-8 justify-center">
                {/* <div>
                  <p className="text-3xl font-bold text-secondary">1+</p>
                  <p className="text-sm text-secondary/70">Défis relevés</p>
                </div> */}
                <div>
                  <p className="text-3xl font-bold text-secondary">{""}</p>
                  <p className="text-sm text-secondary/70">Building en cours... </p>
                </div>
                {/* <div>
                  <p className="text-3xl font-bold text-secondary">95%</p>
                  <p className="text-sm text-secondary/70">Taux de réussite</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </section>
    </>
  );
}

const LinesComponent = () => {
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100 0C200 150 300 300 400 450C500 600 600 750 800 850C900 900 1000 850 1100 800"
            fill="none"
            stroke="rgb(59 130 246)"
            className="animate-pulse-line" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1540 0C1240 150 1140 300 1040 450C940 600 840 750 640 850C540 900 440 850 340 800"
            fill="none"
            stroke="rgb(59 130 246)"
            className="animate-pulse-line-delayed" />
        </svg>
      </div>
    </>
  )
}