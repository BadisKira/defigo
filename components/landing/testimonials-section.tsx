"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function TestimonialsSection() {

  return (
    <section className="relative md:px-12 px-6 py-20 md:py-32 overflow-hidden">
      {/* Background avec dégradé et formes flottantes */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-800/30 to-purple-800/20"></div>

      {/* Éléments décoratifs animés */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-gray-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>

      {/* Grille de points décorative */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header avec animation */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-600/10 to-blue-600/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/10">

            <>
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Commencez votre défi</span>
            </>

          </div>

          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight">
            {"Votre premier défi vous attend"}
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {"Soyez le premier à transformer vos objectifs en succès grâce à la motivation financière"}
          </p>
        </div>




        <div className="max-w-4xl mx-auto">
          {/* Card principale pour l'état vide */}
          <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden group">
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></div>

            {/* Éléments décoratifs flottants */}
            <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-gray-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-700"></div>

            <CardContent className="p-12 md:p-16 text-center relative z-10">
              {/* Icône centrale avec animation */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-blue-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 p-6 rounded-full">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                {/* Cercles animés autour de l'icône */}
                <div className="absolute -inset-4 border border-blue-400/30 rounded-full animate-ping"></div>
                <div className="absolute -inset-8 border border-purple-400/20 rounded-full animate-ping delay-1000"></div>
              </div>

              {/* Titre et description */}
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Créez votre premier défi
              </h3>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Transformez vos objectifs en engagement concret. Fixez-vous un défi, misez sur votre réussite et laissez la motivation financière vous pousser vers le succès.
              </p>



              <Button
                asChild
                variant={"ghost"}
                className="group/btn relative inline-flex items-center space-x-3 bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 hover:from-gray-600 hover:via-blue-500 hover:to-purple-500 text-white font-bold py-8 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              >
                <Link href={"/engagement"}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-2xl "></div>
                  <Sparkles className="w-6 h-6 group-hover/btn:rotate-12 transition-transform duration-300" />
                  <span className="text-xl">Commencer mon défi</span>
                  <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>

              {/* Texte d'encouragement */}
              <p className="text-gray-600 mt-6 text-lg">
                Rejoignez les milliers de personnes qui ont déjà transformé leurs vies
              </p>
            </CardContent>

            {/* Bordure animée */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10"></div>

            {/* Ombre colorée */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform translate-y-2 blur-xl -z-10"></div>
          </Card>

        </div>

      </div>
    </section>
  );
}