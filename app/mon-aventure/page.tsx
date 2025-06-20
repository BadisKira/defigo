import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserChallengesSummary } from "@/lib/actions/user-challenges.actions";
import { ChallengesTable } from "@/components/mon-aventure/challenges-table";
import { ChallengesSummary } from "@/components/mon-aventure/challenges-summary";
import { AssociationsDonations } from "@/components/mon-aventure/associations-donations";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeStatus } from "@/types/challenge.types";
import { ChallengesFilter } from "@/components/mon-aventure/challenges-filter";

export const metadata: Metadata = {
  title: "Mon aventure – Suivi de mes défis – deKliK",
  description: "Suis tous tes défis, tes réussites et ton impact solidaire sur deKliK. Visualise ton parcours et reste motivé pour aller toujours plus loin."
};
interface MonAventurePageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

// Validation sécurisée des statuts
const validStatuses: (ChallengeStatus | 'all')[] = [
  'all', 'draft', 'active', 'validated', 'failed', 'expired'
];

function isValidStatus(status: string): status is ChallengeStatus | 'all' {
  return validStatuses.includes(status as ChallengeStatus | 'all');
}

export default async function MonAventurePage({ searchParams }: MonAventurePageProps) {
  const params = await searchParams;
  const statusParam = params.status || 'all';
  const pageParam = params.page || '1';

  // Validation sécurisée des paramètres
  if (!isValidStatus(statusParam)) {
    redirect('/mon-aventure?status=all');
  }

  const page = parseInt(pageParam, 10);
  if (isNaN(page) || page < 1) {
    redirect('/mon-aventure?status=' + statusParam);
  }

  const currentStatus = statusParam === 'all' ? undefined : statusParam as ChallengeStatus;

  // Récupération du résumé (optimisé avec la fonction PostgreSQL)
  const summary = await getUserChallengesSummary();

  return (
    <main className="md:px-16 px-6 container mx-auto py-24">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mon Aventure</h1>
          <p className="text-muted-foreground">
            Suivez vos défis, vos réussites et vos contributions aux associations.
          </p>
        </div>

        {/* Résumé des statistiques */}
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <ChallengesSummary summary={summary} />
        </Suspense>

        {/* Filtres avec URL state */}
        <div className="space-y-4">
          <ChallengesFilter 
            currentStatus={statusParam} 
            summary={summary}
          />

          {/* Table des défis avec pagination */}
          <Suspense 
            key={`${statusParam}-${page}`}
            fallback={<Skeleton className="h-[400px] w-full" />}
          >
            <ChallengesTable 
              status={currentStatus} 
              page={page}
            />
          </Suspense>
        </div>

        {/* Section contributions */}
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