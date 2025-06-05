import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronRight, Star, Users, MapPin } from "lucide-react";
import { getAssociations } from "@/lib/actions/association.actions";
import Image from "next/image";

export async function PartnersSection() {
  const { data } = await getAssociations({ limit: 7 });

  const gradients = [
    "from-purple-400 to-pink-400",
    "from-blue-400 to-cyan-400", 
    "from-green-400 to-emerald-400",
    "from-orange-400 to-red-400",
    "from-indigo-400 to-purple-400",
    "from-teal-400 to-blue-400",
    "from-rose-400 to-pink-400"
  ];

  return (
    <section className="relative md:px-12 px-6 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
      
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-pink-200/30 to-orange-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-green-200/30 to-teal-200/30 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 text-blue-600 font-medium mb-4">
            <Users className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Nos partenaires</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight mb-4">
            Associations qui nous font confiance
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Découvrez les associations partenaires qui collaborent avec nous pour créer un impact positif dans la communauté.
          </p>
          
          <Button 
            asChild 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-full"
          >
            <Link href="/associations" className="flex items-center space-x-2">
              <span>Voir toutes</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Grille des partenaires avec animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {data.map((partner, index) => (
            <div
              key={partner.id}
              className="group relative"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Carte principale */}
              <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50">
                
                {/* Badge catégorie flottant */}
                {partner.category && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    <Star className="w-3 h-3 inline mr-1" />
                    {partner.category}
                  </div>
                )}

                {/* Avatar avec gradient */}
                <div className={`relative w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  {partner.logo_url ? (
                    <Image
                      src={partner.logo_url} 
                      alt={partner.name}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {partner.name.charAt(0)}
                    </span>
                  )}
                  
                  {/* Pulse effect */}
                  {/* <div className={`absolute -inset-1 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 animate-pulse`}></div> */}
                </div>

                {/* Nom de l'association */}
                <h3 className="text-center font-semibold text-gray-800 text-sm leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                  {partner.name}
                </h3>

                {/* Localisation si disponible */}
                {partner.city && (
                  <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{partner.city}</span>
                  </div>
                )}

                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] rounded-2xl"></div>
              </div>

              {/* Ombre colorée */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform translate-y-2 blur-xl -z-10`}></div>
            </div>
          ))}
        </div>

        {/* Call to action en bas */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/50">
            <span className="text-gray-600">Plus de</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              20+
            </span>
            <span className="text-gray-600">associations partenaires</span>
          </div>
        </div>
      </div>
    </section>
  );
}