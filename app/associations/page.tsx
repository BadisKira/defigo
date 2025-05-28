import { AssociationSearch } from "@/components/associations/association-search";

export default function AssociationsPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-secondary mb-8">Recherche d&apos;associations</h1>
      <p className="text-gray-600 mb-8">
        Recherchez une association française à but non lucratif pour votre défi.
      </p>
      <AssociationSearch />
    </div>
  );
}