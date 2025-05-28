import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { EngagementForm } from "@/components/engagement/form";

export default async function EngagementPage() {
  return (
    <div className="bg-muted min-h-screen">
      <SignedIn>
        <div className="container mx-auto py-12">
          <h1 className="text-3xl font-bold text-center mb-8">Créer un engagement</h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Créez un défi personnel et engagez-vous à le réaliser. En cas de réussite, vous pourrez être fier de votre accomplissement. En cas d'échec, le montant que vous avez défini sera versé à l'association de votre choix.
          </p>
          <EngagementForm />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}