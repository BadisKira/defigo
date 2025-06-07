// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import Link from "next/link";
// import { getUserChallenges } from "@/lib/actions/user-challenges.actions";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Loader2 } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { ChallengeStatus, ChallengeWithTransactionAndAssoc } from "@/types/challenge.types";
// import { useRouter } from "next/navigation";

// interface ChallengesTableProps {
//   status?: ChallengeStatus;
// }

// const LIMIT = 6;

// export function ChallengesTable({ status }: ChallengesTableProps) {
//   const router = useRouter();
//   const [challenges, setChallenges] = useState<ChallengeWithTransactionAndAssoc[]>([]);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     page: 1,
//     limit: LIMIT,
//     totalPages: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   const loadChallenges = useCallback(async (page: number) => {
//     try {
//       setLoading(true);
//       const result = await getUserChallenges({
//         status,
//         page,
//         limit: LIMIT,
//       });
//       setChallenges(result.challenges || []);
//       setPagination(result.pagination);
//     } catch (error) {
//       console.error("Erreur lors du chargement des défis:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [status]);

//   useEffect(() => {
//     loadChallenges(1);
//   }, [status, loadChallenges]);


//   const getStatusBadge = (status: ChallengeStatus) => {
//     switch (status) {
//       case "draft":
//         return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Brouillon</Badge>;
//       case "active":
//         return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En cours</Badge>;
//       case "validated":
//         return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Réussi</Badge>;
//       case "failed":
//         return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Échoué</Badge>;
//       case "expired":
//         return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Éxpiré</Badge>;  
//       default:
//         return <Badge variant="outline">Inconnu</Badge>;
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return format(new Date(dateString), "PPP", { locale: fr });
//   };

//   if (loading && challenges.length === 0) {
//     return (
//       <div className="flex justify-center items-center py-12">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (challenges.length === 0) {
//     return (
//       <Card>
//         <CardContent className="flex flex-col items-center justify-center py-12">
//           <p className="text-muted-foreground text-center mb-4">
//             {"Vous n'avez pas encore de défis"} {status ? getStatusLabel(status) : ""}.
//           </p>
//           <Button asChild variant="default">
//             <Link href="/engagement">
//               Créer mon premier défi
//             </Link>
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="rounded-md border">
//         <Table className="bg-white rounded-md">
//           <TableHeader>
//             <TableRow>
//               <TableHead>Défi</TableHead>
//               <TableHead>Montant</TableHead>
//               <TableHead>Association</TableHead>
//               <TableHead>Dates</TableHead>
//               <TableHead>Statut</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {challenges.map((challenge) => (
//               <TableRow key={challenge.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/engagement/${challenge.id}`)}>
//                 <TableCell className="font-medium">{challenge.title}</TableCell>
//                 <TableCell>{challenge.amount}€</TableCell>
//                 <TableCell>{challenge.associations.name || "Non spécifiée"}</TableCell>
//                 <TableCell>
//                   <div className="text-sm">
//                     <div>Début: {formatDate(challenge.start_date)}</div>
//                     <div>Fin: {formatDate(challenge.end_date!)}</div>
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   <div className="flex items-center justify-between">
//                     {getStatusBadge(challenge.status)}
//                     <Button variant="secondary" size="sm" className="ml-2" asChild>
//                       <Link href={`/engagement/${challenge.id}`}>Détails</Link>
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {pagination.totalPages > 1 && (
//         <Pagination>
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious
//                 onClick={() => {
//                   if (pagination.page > 1) loadChallenges(pagination.page - 1)
//                 }}
//                 className={cn(
//                   'cursor-pointer',
//                   pagination.page === 1 && "cursor-not-allowed opacity-50",
//                 )}
//               />
//             </PaginationItem>

//             {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
//               <PaginationItem key={page}>
//                 <PaginationLink
//                   onClick={() => loadChallenges(page)}
//                   isActive={pagination.page === page}
//                 >
//                   {page}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}

//             <PaginationItem>
//               <PaginationNext
//                 onClick={() => {
//                   if (pagination.page < pagination.totalPages) loadChallenges(pagination.page + 1)
//                 }}
//                 className={cn(
//                   'cursor-pointer',
//                   pagination.page === pagination.totalPages && "cursor-not-allowed opacity-50",
//                 )}
//               />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       )}
//     </div>
//   );
// }

// function getStatusLabel(status: ChallengeStatus): string {
//   switch (status) {
//     case "draft":
//         return "brouillon"
//     case "active":
//       return "en cours";
//     case "validated":
//       return "réussis";
//     case "failed":
//       return "échoués";
//     case "expired":
//       return "expiré"
//     default:
//       return "";
//   }
// }

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
            Aucun défi trouvé pour cette catégorie.
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
                <Link href={`/engagement/${challenge.id}`}>Détails</Link>
              </Button>

              {challenge.status === "draft" && <Button variant="destructive" size="sm" className="ml-2">
                Supprimer
              </Button>}
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