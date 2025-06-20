"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Target, Heart, PiggyBank, Award, Sparkles } from "lucide-react";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
};

const steps: Step[] = [
  {
    id: "step-1",
    title: "Choisis ton objectif",
    description:
      "Fixe-toi un defi personnel motivant et réaliste : perdre du poids, arrêter de fumer, apprendre une langue, courir un marathon... C'est toi qui décides !",
    icon: <Target className="h-6 w-6 text-white" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "step-2",
    title: "Sélectionne une association",
    description:
      "Choisis une association parmi notre liste de partenaires qui recevra ta mise si tu n'atteins pas ton objectif. Une motivation supplémentaire pour réussir !",
    icon: <Heart className="h-6 w-6 text-white" />,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "step-3",
    title: "Dépose ta mise",
    description:
      "Détermine le montant que tu souhaites engager. Plus la somme est importante, plus ta motivation sera grande. Tu peux miser de 10€ à 500€.",
    icon: <PiggyBank className="h-6 w-6 text-white" />,
    gradient: "from-emerald-500 to-green-500",
  },
  {
    id: "step-4",
    title: "Déclare le résultat",
    description:
      "À la fin du defi, indique simplement si tu as réussi ou non. Si tu déclares ta réussite, tu récupères ta mise moins la commission de la plateforme (4%). Sinon, l’association reçoit ton don. Pas besoin d’uploader de preuve , tu es seul juge !",
    icon: <Award className="h-6 w-6 text-white" />,
    gradient: "from-purple-500 to-indigo-500",
  }


];

export function HowItWorksSection() {
  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-pink-200/20 to-orange-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-green-200/20 to-teal-200/20 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* En-tête avec style modernisé */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-blue-600 font-medium">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">{"Guide d'utilisation"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
            Comment ça marche ?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez en 4 étapes simples comment transformer vos défis personnels en impact positif pour les associations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full" defaultValue="step-1">
            {steps.map((step, index) => (
              <AccordionItem
                key={step.id}
                value={step.id}
                className="group mb-6 border-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"

              >
                <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50/50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-blue-50/50 [&[data-state=open]]:to-purple-50/50">
                  <div className="flex items-center w-full">
                    {/* Numéro d'étape */}
                    <div className="mr-6 flex-shrink-0">
                      <div className="relative">
                        <div className={`w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          {step.icon}
                        </div>
                        {/* Badge numéro */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 text-left">
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-8 pt-2 pb-6">
                  <div className="ml-20 md:ml-20">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </AccordionContent>

                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] rounded-2xl pointer-events-none"></div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Section finale avec statistiques */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Processus en</span>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                4 étapes
              </span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Simple et</span>
              <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                efficace
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}