import { AssociationSearch } from "@/components/associations/association-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Associations partenaires – deKliK",
  description:"Découvre les associations que tu peux soutenir grâce à tes défis sur deKliK. Chaque defi compte pour faire avancer une cause."
};

export default function AssociationsPage() {
  return (
    <div className="container mx-auto py-12 mt-12">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">{"Recherche d'associations"}</h1>
        <p className="text-gray-600 text-lg">
          Trouvez des associations par nom ou filtrez par catégorie pour découvrir celle qui correspond à vos besoins.
        </p>
      </div>
      <AssociationSearch />
    </div>
  );
}