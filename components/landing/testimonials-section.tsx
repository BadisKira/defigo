"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Trophy, Heart, Target, Zap } from "lucide-react";

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

// Icônes pour chaque type de défi
const challengeIcons = {
  "Perte de poids": Target,
  "Arrêt du tabac": Heart,
  "Apprentissage": Zap,
  "Sport": Trophy,
};

// Couleurs pour chaque type de défi
const challengeColors = {
  "Perte de poids": "from-green-400 to-emerald-500",
  "Arrêt du tabac": "from-red-400 to-pink-500",
  "Apprentissage": "from-blue-400 to-indigo-500",
  "Sport": "from-orange-400 to-yellow-500",
};

export function TestimonialsSection() {
  return (
    <section className="relative md:px-12 px-6 py-20 md:py-32 overflow-hidden">
      {/* Background avec dégradé et formes flottantes */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
      
      {/* Éléments décoratifs animés */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>

      {/* Grille de points décorative */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header avec animation */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/10">
            <Quote className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-medium">Témoignages</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 leading-tight">
            Ils ont relevé leurs défis
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Découvrez comment nos utilisateurs ont transformé leurs objectifs en succès grâce à la motivation financière
          </p>
        </div>
        
        {/* Grille des témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => {
            const IconComponent = challengeIcons[testimonial.challenge as keyof typeof challengeIcons] || Trophy;
            const colorClass = challengeColors[testimonial.challenge as keyof typeof challengeColors] || "from-gray-400 to-gray-500";
            
            return (
              <div 
                key={testimonial.id} 
                className="group"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <Card className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden">
                  {/* Badge flottant avec icône */}
                  <div className={`absolute -top-3 -right-3 bg-gradient-to-r ${colorClass} p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>

                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></div>

                  <CardContent className="p-8 relative z-10">
                    {/* Quote icon décorative */}
                    <div className="absolute top-6 right-6 opacity-10">
                      <Quote className="w-12 h-12 text-white" />
                    </div>

                    {/* Profil utilisateur */}
                    <div className="flex items-center mb-6">
                      <div className="relative">
                        <Avatar className="h-16 w-16 mr-4 ring-4 ring-white/20 ring-offset-2 ring-offset-transparent">
                          <AvatarImage src={testimonial.image} alt={testimonial.name} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg">
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Status indicator */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{testimonial.name}</h3>
                        <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${colorClass} bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1 mt-1`}>
                          <IconComponent className="w-4 h-4 text-white" />
                          <span className="text-white/90 text-sm font-medium">{testimonial.challenge}</span>
                        </div>
                      </div>
                    </div>

                    {/* Étoiles avec animation */}
                    <div className="flex mb-6 space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 transition-all duration-300 ${
                            i < testimonial.rating 
                              ? "fill-yellow-400 text-yellow-400 group-hover:scale-110" 
                              : "text-gray-600"
                          }`}
                          style={{ transitionDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>

                    {/* Témoignage */}
                    <blockquote className="text-gray-200 text-lg leading-relaxed relative">
                      <span className="text-purple-400 text-2xl font-serif absolute -top-2 -left-2">&quot;</span>
                      <p className="relative z-10 pl-4">{testimonial.text}</p>
                      <span className="text-purple-400 text-2xl font-serif absolute -bottom-4 -right-2">&quot;</span>
                    </blockquote>
                  </CardContent>

                  {/* Bordure animée */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${colorClass} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>

                  {/* Ombre colorée */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform translate-y-2 blur-xl -z-10`}></div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Call to action en bas */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/10">
            <span className="text-gray-300">Plus de</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              1000+
            </span>
            <span className="text-gray-300">défis relevés</span>
          </div>
        </div>
      </div>
    </section>
  );
}