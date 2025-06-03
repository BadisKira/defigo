"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { getAssociations, getCategories } from "@/lib/actions/association.actions";
import { Association } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ExternalLink, Star, MapPin, Mail, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

export function AssociationSearch() {
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAssociations, setAllAssociations] = useState<Association[]>([]);
  const [filteredAssociations, setFilteredAssociations] = useState<Association[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const gradients = [
    "from-blue-400 to-purple-500",
    "from-green-400 to-blue-500",
    "from-purple-400 to-pink-500",
    "from-yellow-400 to-red-500",
    "from-indigo-400 to-purple-500",
    "from-pink-400 to-red-500",
    "from-teal-400 to-blue-500",
    "from-orange-400 to-pink-500"
  ];

  const loadAllAssociations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAssociations({
        limit: 100 
      });
      
      if (!result.success) {
        setError(result.error || "Une erreur est survenue lors du chargement");
        setAllAssociations([]);
      } else {
        const associations = result.data || [];
        setAllAssociations(associations);
        setFilteredAssociations(associations);
      }
    } catch (err) {
      setError("Une erreur est survenue lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories", err);
    }
  };
  //filtrage coté client 
  const filterAssociations = () => {
    let filtered = allAssociations;

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(association =>
        association.name.toLowerCase().includes(searchLower) ||
        association.description?.toLowerCase().includes(searchLower) ||
        association.city?.toLowerCase().includes(searchLower) ||
        association.address?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(association => association.category === selectedCategory);
    }

    setFilteredAssociations(filtered);
  };

  const openAssociationModal = (association: Association) => {
    setSelectedAssociation(association);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssociation(null);
  };

  useEffect(() => {
    filterAssociations();
  }, [debouncedSearchTerm, selectedCategory, allAssociations]);

  useEffect(() => {
    loadAllAssociations();
    loadCategories();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 overflow-x-hidden">
      {/* Barre de recherche */}
      <div className="flex items-center space-x-4 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Rechercher une association..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-0 bg-white/50 backdrop-blur-sm focus:bg-white/80 transition-all"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-56 border-0 bg-white/50 backdrop-blur-sm focus:bg-white/80">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
        </div>
      )}

      {/* Résultats */}
      {!loading && !error && (
        <>
          {/* Nombre de résultats */}
          <div className="mb-6 text-gray-600 text-center">
            <p className="text-lg font-medium">
              {filteredAssociations.length > 0 ? (
                <>
                  <span className="text-blue-600 font-bold">{filteredAssociations.length}</span> 
                  {filteredAssociations.length === 1 ? ' association trouvée' : ' associations trouvées'}
                  {allAssociations.length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      sur {allAssociations.length} au total
                    </span>
                  )}
                </>
              ) : (
                "Aucune association trouvée"
              )}
            </p>
          </div>
          
          {/* Grille des associations */}
          {filteredAssociations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredAssociations.map((association, index) => (
                <div
                  key={association.id}
                  className="group relative cursor-pointer"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onClick={() => openAssociationModal(association)}
                >
                  {/* Carte principale */}
                  <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50">
                    
                    {/* Badge catégorie flottant */}
                    {association.category && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full shadow-md">
                        <Star className="w-3 h-3 inline mr-1" />
                        {association.category}
                      </div>
                    )}

                    {/* Avatar avec gradient */}
                    <div className={`relative w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      {association.logo_url ? (
                        <Image
                          src={association.logo_url} 
                          alt={association.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {association.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Nom de l'association */}
                    <h3 className="text-center font-semibold text-gray-800 text-sm leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                      {association.name}
                    </h3>

                    {/* Localisation si disponible */}
                    {association.city && (
                      <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{association.city}</span>
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
          )}
        </>
      )}

      {/* Modal des détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedAssociation && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar de l'association */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradients[0]} rounded-2xl shadow-lg flex items-center justify-center`}>
                      {selectedAssociation.logo_url ? (
                        <Image
                          src={selectedAssociation.logo_url} 
                          alt={selectedAssociation.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {selectedAssociation.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-gray-800">
                        {selectedAssociation.name}
                      </DialogTitle>
                      {selectedAssociation.category && (
                        <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full mt-1">
                          <Star className="w-3 h-3 inline mr-1" />
                          {selectedAssociation.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                {selectedAssociation.description && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedAssociation.description}</p>
                  </div>
                )}

                {/* Informations de contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Adresse */}
                  {(selectedAssociation.address || selectedAssociation.city) && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        Adresse
                      </h4>
                      <div className="text-gray-600 text-sm">
                        {selectedAssociation.address && (
                          <p>{selectedAssociation.address}</p>
                        )}
                        <p>
                          {selectedAssociation.postal_code && `${selectedAssociation.postal_code} `}
                          {selectedAssociation.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {(selectedAssociation.email || selectedAssociation.phone) && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">Contact</h4>
                      <div className="space-y-1">
                        {selectedAssociation.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-blue-500" />
                            <a href={`mailto:${selectedAssociation.email}`} className="hover:text-blue-600">
                              {selectedAssociation.email}
                            </a>
                          </div>
                        )}
                        {selectedAssociation.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-blue-500" />
                            <a href={`tel:${selectedAssociation.phone}`} className="hover:text-blue-600">
                              {selectedAssociation.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date de création */}
                {selectedAssociation.created_at && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Date de création</h4>
                    <p className="text-gray-600 text-sm">
                      {new Date(selectedAssociation.created_at).toLocaleDateString("fr-FR", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      console.log("Association sélectionnée:", selectedAssociation);
                      // Ici vous pouvez ajouter votre logique de sélection
                      closeModal();
                    }}
                    className="flex-1"
                  >
                    Sélectionner cette association
                  </Button>
                  {selectedAssociation.website_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedAssociation.website_url!, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Site web
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}