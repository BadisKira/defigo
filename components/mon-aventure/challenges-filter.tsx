"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserChallengesSummary } from "@/lib/actions/user-challenges.actions";
import Link from "next/link";
import { ArrowBigRight } from "lucide-react";

interface ChallengesFilterProps {
  currentStatus: string;
  summary: UserChallengesSummary;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function ChallengesFilter({ currentStatus, summary }: ChallengesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filterOptions: FilterOption[] = [
    {
      value: "all",
      label: "Tous les défis",
      count: summary.totalChallenges,
    },
    {
      value: "draft",
      label: "Brouillons",
      count: summary.draftChallenges,
      variant: "outline",
    },
    {
      value: "active",
      label: "En cours",
      count: summary.activeChallenges,
      variant: "default",
    },
    {
      value: "validated",
      label: "Réussis",
      count: summary.successfulChallenges,
      variant: "default",
    },
    {
      value: "failed",
      label: "Échoués",
      count: summary.failedChallenges,
      variant: "destructive",
    },
    {
      value: "expired",
      label: "Expirés",
      count: summary.expiredChallenges,
      variant: "secondary",
    },
  ];

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    
    // Reset page when changing status
    params.delete("page");
    
    const queryString = params.toString();
    const url = queryString ? `/mon-aventure?${queryString}` : "/mon-aventure";
    
    router.push(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={currentStatus === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange(option.value)}
          className="flex items-center gap-2"
        >
          {option.label}
          <Badge 
            variant={
              currentStatus === option.value 
                ? "secondary" 
                : option.variant || "secondary"
            }
            className="ml-1"
          >
            {option.count}
          </Badge>
        </Button>
      ))}
      <Button className="flex items-center gap-2" size={"sm"} asChild>
        <Link className="flex items-center" href={"/engagement"}>
            <span>
                Lancer mon défi
            </span> 
            <ArrowBigRight />
        </Link> 
      </Button>
    </div>
  );
}