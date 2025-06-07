import { UserChallengesSummary } from "@/lib/actions/user-challenges.actions";
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, AlertTriangle, Calendar } from "lucide-react";

interface ChallengesSummaryProps {
  summary: UserChallengesSummary;
}

export function ChallengesSummary({ summary }: ChallengesSummaryProps) {
  const {
    totalChallenges,
    successfulChallenges,
    activeChallenges,
    totalDonated,
  } = summary;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des défis</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalChallenges}</div>
          <p className="text-xs text-muted-foreground">
            Défis créés sur la plateforme
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Défis réussis</CardTitle>
          <Trophy className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successfulChallenges}</div>
          <p className="text-xs text-muted-foreground">
            {successfulChallenges > 0 && totalChallenges > 0
              ? `${Math.round((successfulChallenges / totalChallenges) * 100)}% de réussite`
              : "Aucun défi réussi pour l'instant"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Défis en cours</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeChallenges}</div>
          <p className="text-xs text-muted-foreground">
            Défis actifs à compléter
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Montant reversé</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDonated.toFixed(2)}€</div>
          <p className="text-xs text-muted-foreground">
            Reversé à {summary.associationsDonatedTo.length} association(s)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}