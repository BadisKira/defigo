"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { getUserChallenges } from "@/lib/actions/user-challenges.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Challenge, ChallengeStatus } from "@/types/challenge.types";

interface ChallengesTableProps {
  status?: ChallengeStatus;
}

const LIMIT = 6;

export function ChallengesTable({ status }: ChallengesTableProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadChallenges = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getUserChallenges({
        status,
        page,
        limit: LIMIT,
      });
      setChallenges(result.challenges || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Erreur lors du chargement des défis:", error);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadChallenges(1);
  }, [status, loadChallenges]);


  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En cours</Badge>;
      case "success":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Réussi</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Échoué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: fr });
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            {"Vous n'avez pas encore de défis"} {status ? getStatusLabel(status) : ""}.
          </p>
          <Button asChild variant="default">
            <Link href="/engagement">
              Créer mon premier défi
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table className="bg-white rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>Défi</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Association</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/mon-aventure/${challenge.id}`}>
                <TableCell className="font-medium">{challenge.title}</TableCell>
                <TableCell>{challenge.amount}€</TableCell>
                <TableCell>{challenge.association_name || "Non spécifiée"}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Début: {formatDate(challenge.start_date)}</div>
                    <div>Fin: {formatDate(challenge.end_date)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(challenge.status)}
                    <Button variant="secondary" size="sm" className="ml-2" asChild>
                      <Link href={`/engagement/${challenge.id}`}>Détails</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (pagination.page > 1) loadChallenges(pagination.page - 1)
                }}
                className={cn(
                  'cursor-pointer',
                  pagination.page === 1 && "cursor-not-allowed opacity-50",
                )}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => loadChallenges(page)}
                  isActive={pagination.page === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (pagination.page < pagination.totalPages) loadChallenges(pagination.page + 1)
                }}
                className={cn(
                  'cursor-pointer',
                  pagination.page === pagination.totalPages && "cursor-not-allowed opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function getStatusLabel(status: ChallengeStatus): string {
  switch (status) {
    case "pending":
      return "en cours";
    case "success":
      return "réussis";
    case "failed":
      return "échoués";
    default:
      return "";
  }
}