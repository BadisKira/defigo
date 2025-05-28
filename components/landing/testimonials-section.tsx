"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Testimonial = {
  id: number;
  name: string;
  image: string;
  text: string;
  rating: number;
  challenge: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Thomas L.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Grâce à Bet Yourself, j'ai perdu 8kg en 3 mois. Le fait de mettre de l'argent en jeu m'a vraiment motivé !",
    rating: 5,
    challenge: "Perte de poids",
  },
  {
    id: 2,
    name: "Sophie M.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "J'ai enfin arrêté de fumer après 10 ans. Savoir que mon argent irait à une bonne cause m'a aidé à tenir bon.",
    rating: 5,
    challenge: "Arrêt du tabac",
  },
  {
    id: 3,
    name: "Marc D.",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    text: "Le concept est génial ! J'ai réussi à apprendre l'espagnol en 6 mois comme prévu, sinon mon argent allait à une asso.",
    rating: 4,
    challenge: "Apprentissage",
  },
  {
    id: 4,
    name: "Julie R.",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    text: "Bet Yourself m'a permis de me fixer un vrai objectif sportif et de m'y tenir. J'ai couru mon premier 10km !",
    rating: 5,
    challenge: "Sport",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const showPrev = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 2 : prev - 1));
    }
  }, [isAnimating]);

  const showNext = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev === testimonials.length - 2 ? 0 : prev + 1));
    }
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(showNext, 5000);
    return () => clearInterval(timer);
  }, [showNext]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">
            Ils ont relevé leurs défis
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={showPrev}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={showNext}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex gap-6 transition-transform duration-500 ease-in-out"
               style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="min-w-[calc(33.33%-1rem)] px-2">
                <Card className="h-full transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-secondary">{testimonial.name}</h3>
                        <p className="text-sm text-primary font-medium">{testimonial.challenge}</p>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating 
                                  ? "fill-primary text-primary" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}