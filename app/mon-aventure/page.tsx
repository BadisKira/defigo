import { Suspense } from "react";
import { Metadata } from "next";
import { getUserChallengesSummary } from "@/lib/actions/user-challenges.actions";
import { ChallengesTable } from "@/components/mon-aventure/challenges-table";
import { ChallengesSummary } from "@/components/mon-aventure/challenges-summary";
import { AssociationsDonations } from "@/components/mon-aventure/associations-donations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Mon Aventure | DéfiGo",
  description: "Suivez vos défis, vos réussites et vos contributions aux associations",
};

export default async function MonAventurePage() {
  const summary = await getUserChallengesSummary();

  return (
    <main className=" md:px-16 px-6 container mx-auto py-24 ">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mon Aventure</h1>
          <p className="text-muted-foreground">
            Suivez vos défis, vos réussites et vos contributions aux associations.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <ChallengesSummary summary={summary} />
        </Suspense>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous les défis</TabsTrigger>
            <TabsTrigger value="draft">Brouillons</TabsTrigger>
            <TabsTrigger value="pending">En cours</TabsTrigger>
            <TabsTrigger value="success">Réussis</TabsTrigger>
            <TabsTrigger value="failed">Échoués</TabsTrigger>
            <TabsTrigger value="expired">Éxpirés</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <ChallengesTable status={undefined} />
            </Suspense>
          </TabsContent>

          <TabsContent value="draft">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <ChallengesTable status="draft" />
            </Suspense>
          </TabsContent>

          <TabsContent value="pending">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <ChallengesTable status="pending" />
            </Suspense>
          </TabsContent>

          <TabsContent value="success">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <ChallengesTable status="validated" />
            </Suspense>
          </TabsContent>

          <TabsContent value="failed">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <ChallengesTable status="failed" />
            </Suspense>
          </TabsContent>

          <TabsContent value="expired">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <ChallengesTable status="expired" />
            </Suspense>
          </TabsContent>
        </Tabs>

        {summary.associationsDonatedTo.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Mes Contributions</h2>
            <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
              <AssociationsDonations associations={summary.associationsDonatedTo} />
            </Suspense>
          </div>
        )}
      </div>
    </main>
  );
}