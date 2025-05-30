"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

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
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkIfAnimationNeeded = useCallback(() => {
    if (!containerRef.current) return false;
    
    const containerWidth = containerRef.current.offsetWidth;
    const cardWidth = 320; 
    const gap = 24; 
    const padding = 32; 
    
    const availableWidth = containerWidth - padding;
    const totalCardsWidth = testimonials.length * cardWidth + (testimonials.length - 1) * gap;
    
    return totalCardsWidth > availableWidth;
  }, []);

  const showNext = useCallback(() => {
    if (shouldAnimate) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  }, [shouldAnimate]);

  useEffect(() => {
    const checkAnimation = () => {
      setShouldAnimate(checkIfAnimationNeeded());
    };

    checkAnimation();
    window.addEventListener('resize', checkAnimation);
    
    return () => window.removeEventListener('resize', checkAnimation);
  }, [checkIfAnimationNeeded]);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setInterval(showNext, 6000); // Change toutes les 3 secondes
      return () => clearInterval(timer);
    }
  }, [showNext, shouldAnimate]);

  const getTransform = () => {
    if (!shouldAnimate) return 'translateX(0)';
    
    const cardWidth = 320;
    const gap = 24;
    const offset = currentIndex * (cardWidth + gap);
    
    return `translateX(-${offset}px)`;
  };

  return (
    <section className="md:px-12 px-6 py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">
            Ils ont relevé leurs défis
          </h2>
        </div>
        
        <div className="relative" ref={containerRef}>
          <div 
            className={`flex gap-6 ${shouldAnimate ? 'transition-transform duration-700 ease-in-out' : 'justify-center flex-wrap'}`}
            style={{ 
              transform: shouldAnimate ? getTransform() : 'none',
              width: shouldAnimate ? `${testimonials.length * 320 + (testimonials.length - 1) * 24}px` : 'auto'
            }}
          >
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className={`${shouldAnimate ? 'flex-shrink-0' : 'flex-shrink'} ${shouldAnimate ? 'w-80' : 'w-full max-w-sm'}`}
              >
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
          
          {shouldAnimate && (
            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}