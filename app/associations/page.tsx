import { AssociationSearch } from "@/components/associations/association-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recherche d'associations | Bet Yourself",
  description: "Recherchez des associations par nom ou catégorie et trouvez celle qui correspond à vos besoins.",
};

export default function AssociationsPage() {
  return (
    <div className="container mx-auto py-16 mt-12">
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