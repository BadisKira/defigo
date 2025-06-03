import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  getChallenge,
  markChallengeAsSuccessful,
  markChallengeAsFailed,
  MarkChallengeAsSuccessfulParams,
  MarkChallengeAsFailedParams,
} from "@/lib/actions/engagment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Calendar, Euro, Trophy, XCircle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { ChallengeStatus } from "@/types/challenge.types";

export const metadata: Metadata = {
  title: "Détails du Challenge | Bet Yourself",
  description: "Consultez les détails de votre challenge et suivez votre progression.",
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
};

const getStatusBadge = (status: ChallengeStatus) => {
  const statusConfig = {
    pending: { label: "En cours", variant: "outline", icon: <Calendar className="h-3 w-3" /> },
    success: { label: "Réussi", variant: "default", icon: <Trophy className="h-3 w-3" /> },
    failed: { label: "Échoué", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant as "outline" | "default" | "destructive"} className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
};



async function handleMarkAsSuccessful(formData: FormData, challengeId: string) {
  const donateAnyway = formData.get("donateAnyway") === "on";
  const notes = formData.get("notes") as string;

  const params: MarkChallengeAsSuccessfulParams = {
    challengeId,
    donateToAssociation: donateAnyway,
    accomplishmentNote: notes
  };

  await markChallengeAsSuccessful(params);

  redirect(`/engagement/${challengeId}?success=true`);
}

async function handleMarkAsFailed(formData: FormData, challengeId: string) {
  const notes = formData.get("notes") as string;

  const params: MarkChallengeAsFailedParams = {
    challengeId,
    failureNote: notes
  };

  await markChallengeAsFailed(params);

  redirect(`/engagement/${challengeId}?failed=true`);
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}
// Composant de page
export default async function ChallengeDetailsPage({
  params,
}: PageProps) {
  const { userId } = await auth();
  const { id } = await params;
  if (!userId) {
    redirect("/sign-in");
  }

  const challenge = await getChallenge(id);

  if (!challenge) {
    console.error("Erreur lors de la récupération du challenge:");
    notFound();
  }


  const isPending = challenge.status === "pending";
  const isSuccess = challenge.status === "success";
  const isFailed = challenge.status === "failed";

  return (

    <div className="container max-w-4xl md:px-16 px-6  mx-auto py-24 ">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/engagement">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Détails du Challenge</h1>
      </div>

      <Card className="mb-8 shadow-md border-muted/40 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(challenge.status)}
                <span className="text-sm text-muted-foreground">
                  {challenge.status === 'pending' ? "En cours jusqu'au " + formatDate(challenge.end_date) : ''}
                </span>
              </div>
              <CardTitle className="text-xl md:text-2xl">{challenge.title}</CardTitle>
            </div>
            <div className="flex items-center text-xl font-semibold bg-primary/10 text-primary rounded-lg px-3 py-1.5 self-start">
              <Euro className="mr-1.5 h-5 w-5" />
              {challenge.amount}€
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-base mb-2 flex items-center">
                <span className="bg-primary/10 p-1 rounded-md mr-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </span>
                Période
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pl-2 border-l-2 border-primary/20">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Début</span>
                  <span className="font-medium">{formatDate(challenge.start_date)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Fin</span>
                  <span className="font-medium">{formatDate(challenge.end_date)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-base mb-2">Description</h3>
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-muted-foreground">{challenge.description || "Aucune description fournie."}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-base mb-2 flex items-center">
                <span className="bg-primary/10 p-1 rounded-md mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </span>
                Association
              </h3>
              <div className="pl-2 border-l-2 border-primary/20">
                <p className="font-medium">
                  {challenge.association_name || "Non spécifiée"}
                </p>
              </div>
            </div>

            {challenge.accomplishment_note && (
              <div>
                <h3 className="font-medium text-base mb-2">Notes</h3>
                <div className="bg-muted/30 p-3 rounded-md italic">
                  <p className="text-muted-foreground">{"challenge.accomplishment_note"}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isPending && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="bg-primary/10 p-1.5 rounded-md mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </span>
              Avez-vous réussi votre challenge ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-green-50/50 dark:bg-green-950/10 border-b border-green-100 dark:border-green-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    {"J'ai réussi mon challenge !"}
                  </CardTitle>
                  <CardDescription>
                    {"Félicitations ! Vous pouvez récupérer 85% de votre mise ou choisir de la donner à l'association."}                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form action={async (formData) => {
                    "use server"
                    await handleMarkAsSuccessful(formData, id);
                  }} className="space-y-5">
                    <div className="flex items-center space-x-2 p-3 bg-green-50/50 dark:bg-green-950/10 rounded-md">
                      <Switch id="donateAnyway" name="donateAnyway" />
                      <Label htmlFor="donateAnyway" className="font-medium">{"Donner quand même à l'association"}</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="successNotes" className="text-sm font-medium">Notes (optionnel)</Label>
                      <Textarea
                        id="successNotes"
                        name="notes"
                        placeholder="Partagez votre expérience ou des détails sur votre réussite..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Trophy className="mr-2 h-4 w-4" />
                     {" Valider ma réussite"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-red-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-red-50/50 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                   {" Je n'ai pas réussi mon challenge"}
                  </CardTitle>
                  <CardDescription>
                    {"Pas de souci, votre mise sera reversée à l'association que vous avez choisie."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form action={async (formData) => {
                    "use server"
                    await handleMarkAsFailed(formData, id);
                  }} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="failedNotes" className="text-sm font-medium">Notes (optionnel)</Label>
                      <Textarea
                        id="failedNotes"
                        name="notes"
                        placeholder="Partagez votre expérience ou ce que vous avez appris..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <Button type="submit" variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <XCircle className="mr-2 h-4 w-4" />
                      {"Confirmer l'échec"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-green-100 dark:bg-green-900/20 p-1.5 rounded-md mr-2">
              <Trophy className="h-5 w-5 text-green-600" />
            </span>
            Challenge réussi !
          </h2>
          <Card className="border-green-200 shadow-md overflow-hidden">
            <CardHeader className="bg-green-50/50 dark:bg-green-950/10 border-b border-green-100 dark:border-green-900/20">
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Félicitations pour votre réussite !
              </CardTitle>
              <CardDescription>
                Vous avez relevé ce défi avec succès.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="p-4 bg-green-50/50 dark:bg-green-950/10 rounded-lg border border-green-100 dark:border-green-900/20 flex items-center">
                  <div className="mr-3 bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <p>
                    {challenge.transaction?.status === "refunded"
                      ? "Vous avez récupéré 85% de votre mise, soit " + (challenge.amount * 0.85).toFixed(2) + "€."
                      : "Vous avez choisi de donner votre mise à l'association " + (challenge.association_name || "choisie") + ". Merci pour votre générosité !"}
                  </p>
                </div>

                {1 == 1 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Vos notes
                    </h3>
                    <p className="text-sm italic bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-100 dark:border-gray-700">{"challenge.notes"}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 dark:bg-gray-900/10 border-t border-gray-100 dark:border-gray-800 py-4">
              <Button asChild variant="outline" className="border-green-200 hover:bg-green-50 hover:text-green-700">
                <Link href="/engagement" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                  Retour à mes challenges
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {isFailed && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-red-100 dark:bg-red-900/20 p-1.5 rounded-md mr-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </span>
            Challenge non réussi
          </h2>
          <Card className="border-red-200 shadow-md overflow-hidden">
            <CardHeader className="bg-red-50/50 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20">
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Merci pour votre participation
              </CardTitle>
              <CardDescription>
                {"Ce n'est pas grave, l'important c'est d'avoir essayé !"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="p-4 bg-red-50/50 dark:bg-red-950/10 rounded-lg border border-red-100 dark:border-red-900/20 flex items-center">
                  <div className="mr-3 bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                  <p>Votre mise de <span className="font-semibold text-red-700 dark:text-red-400">{challenge.amount}€</span> {"a été reversée à l'association"} <span className="font-semibold">{challenge.association_name || "choisie"}</span>.</p>
                </div>

                {1 == 1 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Vos notes
                    </h3>
                    <p className="text-sm italic bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-100 dark:border-gray-700">{"challenge.notes"}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 dark:bg-gray-900/10 border-t border-gray-100 dark:border-gray-800 py-4">
              <Button asChild variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-700">
                <Link href="/engagement" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                  Retour à mes challenges
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}