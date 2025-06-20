import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { DefiForm } from "@/components/defi/form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un defi – deKliK",
  description:" Prêt à te lancer ? Crée ton defi, choisis ton enjeu et engage-toi pour de vrai. deKliK t’accompagne pour franchir le cap et transformer tes objectifs en réalité."
};


export default async function EngagementPage() {
  return (
    <div className="bg-muted min-h-screen">
      <SignedIn>
        <div className="container mx-auto py-12 mt-12">
          <h1 className="text-3xl font-bold text-center mb-8">Prêt à provoquer ton déclic ?</h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            {"Fixe-toi un defi qui compte vraiment. Passe à l’action, bats la procrastination et fais la différence—pour toi et pour une cause qui te tient à cœur"}
          </p>
          <DefiForm />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}