"use client";

import { useState, useEffect } from "react";
import { useAssociations } from "@/hooks/useAssociations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

export function AssociationSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const {
    results,
    loading,
    error,
    page,
    setSearchQuery,
    nextPage,
    prevPage,
  } = useAssociations();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setSearchQuery(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, setSearchQuery]);

 

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Rechercher une association..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button variant="default" disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Erreur: {error.message}
        </div>
      )}

      {loading && <div className="text-center py-8">Chargement...</div>}

      {results && results.associations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune association trouvée pour cette recherche.
        </div>
      )}

      {results && results.associations.length > 0 && (
        <>
          <div className="grid gap-4">
            {results.associations.map((association) => (
              <Card key={association.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{association.title}</CardTitle>
                  {association.creation_date && (
                    <CardDescription>
                      Créée le {new Date(association.creation_date).toLocaleDateString("fr-FR")}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  {association.object && (
                    <p className="text-sm text-gray-600 mb-2">{association.object}</p>
                  )}
                  {(association.address || association.zipcode || association.city) && (
                    <p className="text-sm">
                      {association.address}{" "}
                      {association.zipcode} {association.city}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>{
                      console.log("Search for an association")
                    }}
                  >
                    Sélectionner
                  </Button>
                  {association.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(association.website, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Site web
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              {results.total_results} résultats • Page {page} sur {results.total_pages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={page >= results.total_pages}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}