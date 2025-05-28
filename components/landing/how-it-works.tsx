"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Target, Heart, PiggyBank, Award } from "lucide-react";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const steps: Step[] = [
  {
    id: "step-1",
    title: "Choisis ton objectif",
    description:
      "Fixe-toi un défi personnel motivant et réaliste : perdre du poids, arrêter de fumer, apprendre une langue, courir un marathon... C'est toi qui décides !",
    icon: <Target className="h-6 w-6 text-primary" />,
  },
  {
    id: "step-2",
    title: "Sélectionne une association",
    description:
      "Choisis une association parmi notre liste de partenaires qui recevra ta mise si tu n'atteins pas ton objectif. Une motivation supplémentaire pour réussir !",
    icon: <Heart className="h-6 w-6 text-primary" />,
  },
  {
    id: "step-3",
    title: "Dépose ta mise",
    description:
      "Détermine le montant que tu souhaites engager. Plus la somme est importante, plus ta motivation sera grande. Tu peux miser de 10€ à 1000€.",
    icon: <PiggyBank className="h-6 w-6 text-primary" />,
  },
  {
    id: "step-4",
    title: "Prouve ta réussite ou laisse la mise à l'asso",
    description:
      "À la fin de ton défi, télécharge les preuves de ta réussite. Si tu as atteint ton objectif, tu récupères ta mise. Sinon, l'association reçoit ton don !",
    icon: <Award className="h-6 w-6 text-primary" />,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
          Comment ça marche ?
        </h2>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full" defaultValue="step-1">
            {steps.map((step) => (
              <AccordionItem
                key={step.id}
                value={step.id}
                className="mb-4 border rounded-lg bg-white overflow-hidden transition-all duration-300"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="mr-4 p-2 rounded-full bg-muted">
                      {step.icon}
                    </div>
                    <span className="text-xl font-medium text-secondary">
                      {step.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-2 pb-4 text-gray-700">
                  {step.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}