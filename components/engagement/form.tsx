"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, InfoIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { cn } from "@/lib/utils";
import { ChallengeFormSchema } from "@/lib/validations/engagement.validations";
import type { ChallengeFormValues } from "@/lib/validations/engagement.validations";
import { createChallenge } from "@/lib/actions/engagment.actions";

const PLATFORM_FEE = Number(process.env.COMMISSION_RATE || 0.15);

const associations = Array.from({ length: 10 }, (_, i) => ({
  id: `assoc_${i + 1}`,
  name: `Association ${i + 1}`,
}));

export function EngagementForm() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalAcceptTerms, setModalAcceptTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(ChallengeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 10,
      duration_days: 1,
      start_date: new Date(),
      association_id: "",
      allow_ai_usage: false,
      accept_terms: false,
    },
  });

  const watchedAmount = form.watch("amount");
  const [platformCommission, setPlatformCommission] = useState(0);
  const [associationPayout, setAssociationPayout] = useState(0);

  useEffect(() => {
    const amountNumber = Number(watchedAmount);
    if (!isNaN(amountNumber) && amountNumber >= 10 && amountNumber <= 500) {
      setPlatformCommission(amountNumber * PLATFORM_FEE);
      setAssociationPayout(amountNumber * (1 - PLATFORM_FEE));
    } else {
      setPlatformCommission(0);
      setAssociationPayout(0);
    }
  }, [watchedAmount]);

  async function onFormSubmit() {
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleFinalSubmit() {
    if (!modalAcceptTerms) {
      setFormError("Veuillez accepter les termes et conditions dans la modale.");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const values = form.getValues();
      
      // Utiliser la Server Action pour créer le challenge ET la transaction
      const result = await createChallenge({
        ...values
      });

      if (result.success && result.challengeId) {
        router.push(`/engagement/${result.challengeId}/payment`);
      } else {
        throw new Error(result.error || "Erreur lors de la création du défi");
      }

    } catch (error) {
      console.error("Failed to create challenge:", error);
      setFormError(error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la création du défi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-6 text-center">Créer un nouveau défi</h2>
        {formError && !isModalOpen && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du défi</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Courir 5km par jour" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre défi en détail..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  {watchedAmount >= 10 && watchedAmount <= 500 && (
                    <FormDescription className="mt-2 text-sm text-gray-600">
                      Commission plateforme (15%): {platformCommission.toFixed(2)} €<br />
                      {"Montant potentiel reversé à l'association"} (85%): {associationPayout.toFixed(2)} €
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Durée (jours)</FormLabel>
                    <FormControl>
                        <Input
                        type="number"
                        min="1"
                        placeholder="7"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant="outline"
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                            ) : (
                                <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                            initialFocus
                            locale={fr}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="association_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Association à soutenir</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une association" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {associations.map(assoc => (
                        <SelectItem key={assoc.id} value={assoc.id}>{assoc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allow_ai_usage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="allow_ai_usage"
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="allow_ai_usage" className="text-sm font-normal">
                     {" Autoriser l'utilisation de l'IA pour le suivi (optionnel)"}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accept_terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="accept_terms_form"
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="accept_terms_form" className="text-sm font-normal">
                      {"J'accepte les termes et conditions générales d'utilisation."}
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création en cours...</>
              ) : (
                "Créer mon défi"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <div className="md:col-span-1 mt-8 md:mt-0">
        <Alert>
          <InfoIcon className="h-5 w-5" />
          <AlertTitle className="font-semibold">{"Accès à l'application mobile"}</AlertTitle>
          <AlertDescription className="text-sm">
            Une fois votre défi créé et le paiement validé, vous aurez accès à une application mobile dédiée pour vous aider à suivre votre progression et à réussir votre engagement !
          </AlertDescription>
        </Alert>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la création du défi</DialogTitle>
            <DialogDescription className="text-sm">
              Une fois le paiement validé, <b>{platformCommission.toFixed(2)} €</b> (15%) seront prélevés par la plateforme.
              {"Le montant reversé à l'association"} <b>{form.getValues("association_id") ? associations.find(a => a.id === form.getValues("association_id"))?.name : ''}</b> sera de <b>{associationPayout.toFixed(2)} €</b> (85%).
              <br /><br />
              <strong>Vous serez redirigé vers la page de paiement pour finaliser votre défi.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="modal-terms" 
                checked={modalAcceptTerms} 
                onCheckedChange={(checked) => setModalAcceptTerms(checked as boolean)} 
              />
              <label
                htmlFor="modal-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {"J'accepte les termes & CGU pour finaliser."}
              </label>
            </div>
          </div>
          {formError && isModalOpen && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            )}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" onClick={() => { setModalAcceptTerms(false); setFormError(null); }}>
                  Annuler
                </Button>
            </DialogClose>
            <Button onClick={handleFinalSubmit} disabled={!modalAcceptTerms || isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
              ) : (
                "Créer et Procéder au Paiement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
