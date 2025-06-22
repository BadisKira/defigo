"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserChallenges, UserChallengesParams, UserChallengesResult } from "@/lib/actions/user-challenges.actions";
import { ChallengeStatus, ChallengeWithTransactionAndAssoc } from "@/types/challenge.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, Target, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { deleteChallenge } from "@/lib/actions/defi.actions";

interface ChallengesTableProps {
  status?: ChallengeStatus;
  page?: number;
}

export function ChallengesTable({ status, page = 1 }: ChallengesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<UserChallengesResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    async function fetchChallenges() {
      try {
        setLoading(true);
        setError(null);

        const params: UserChallengesParams = {
          status,
          page,
          limit: 10,
        };

        const result = await getUserChallenges(params);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchChallenges();
  }, [status, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);

    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/mon-aventure?${queryString}` : "/mon-aventure";

    router.push(url);
  };

  const getStatusBadge = (status: ChallengeStatus) => {
    const config = {
      draft: { label: "Brouillon", variant: "outline" as const },
      active: { label: "En cours", variant: "default" as const },
      validated: { label: "Réussi", variant: "default" as const },
      failed: { label: "Échoué", variant: "destructive" as const },
      expired: { label: "Expiré", variant: "secondary" as const },
    };

    return config[status] || { label: status, variant: "outline" as const };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.challenges?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Aucun defi trouvé pour cette catégorie.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Liste des défis */}
      <div className="space-y-4">
        {data.challenges.map((challenge: ChallengeWithTransactionAndAssoc) => (
          <Card key={challenge.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  {challenge.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.description}
                    </p>
                  )}
                </div>
                <Badge {...getStatusBadge(challenge.status)}>
                  {getStatusBadge(challenge.status).label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center gap-6 flex-wrap text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  <span>{challenge.amount}€</span>
                </div>

                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{challenge.duration_days} jours</span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(challenge.created_at), "dd MMM yyyy", { locale: fr })}
                  </span>
                </div>

                {challenge.associations && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">→</span>
                    <span className="font-medium">{challenge.associations.name}</span>
                  </div>
                )}
              </div>

            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" className="ml-2" asChild>
                <Link href={`/defi/${challenge.id}`}>Détails</Link>
              </Button>

              {challenge.status === "draft" &&

                <Button variant="destructive"
                  onClick={async () => {
                    const result = await deleteChallenge(challenge.id);
                    if (result && result.success) {
                      const tempChallenges = data.challenges.filter((t_challenge) => challenge.id !== t_challenge.id)
                      setData({
                        pagination : data.pagination,
                        challenges:tempChallenges 
                      });
                    }
                  }}

                  size="sm" className="ml-2">
                  Supprimer
                </Button>

              }
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} sur {data.pagination.totalPages}
            ({data.pagination.total} défis au total)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}