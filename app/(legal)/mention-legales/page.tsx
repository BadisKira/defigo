import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:px-16 mt-6 px-6 py-12 w-full  mx-auto">
      {/* Contenu principal */}
      <div className="md:col-span-3 space-y-8">
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
        <Separator />

        <section id="introduction">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-muted-foreground">
            Cette politique de confidentialité explique comment Bet Yourself collecte, utilise et protège les données personnelles de ses utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </section>

        <section id="responsable">
          <h2 className="text-xl font-semibold mb-2">2. Responsable du traitement</h2>
          <p className="text-muted-foreground">
            Le responsable du traitement des données est l’auto-entreprise [Nom à insérer], enregistrée sous le numéro SIRET [Numéro à insérer].
          </p>
        </section>

        <section id="donnees">
          <h2 className="text-xl font-semibold mb-2">3. Données collectées</h2>
          <p className="text-muted-foreground">
            Nous collectons uniquement les données nécessaires au bon fonctionnement de la plateforme : email, nom d’utilisateur, défis créés, paiements réalisés. Les services tiers utilisés incluent Clerk, Supabase, Stripe, et Google Fonts.
          </p>
        </section>

        <section id="duree">
          <h2 className="text-xl font-semibold mb-2">4. Durée de conservation</h2>
          <p className="text-muted-foreground">
            Les données sont conservées aussi longtemps que le compte utilisateur est actif.
          </p>
        </section>

        <section id="droits">
          <h2 className="text-xl font-semibold mb-2">5. Droits des utilisateurs</h2>
          <p className="text-muted-foreground">
            Chaque utilisateur peut demander à accéder, corriger ou supprimer ses données personnelles. Pour exercer ces droits, contactez [adresse email à insérer].
          </p>
        </section>

        <section id="cookies">
          <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
          <p className="text-muted-foreground">
            Nous utilisons des cookies techniques uniquement pour le bon fonctionnement du site. Aucun cookie publicitaire ou de tracking tiers n’est utilisé.
          </p>
        </section>

        <section id="securite">
          <h2 className="text-xl font-semibold mb-2">7. Sécurité des données</h2>
          <p className="text-muted-foreground">
            Toutes les données sont stockées de manière sécurisée via Supabase et Clerk. Stripe gère les transactions financières selon les normes PCI-DSS.
          </p>
        </section>

        <section id="modifications">
          <h2 className="text-xl font-semibold mb-2">8. Modifications</h2>
          <p className="text-muted-foreground">
            Nous nous réservons le droit de modifier cette politique à tout moment. En cas de changement significatif, les utilisateurs seront notifiés par email ou sur le site.
          </p>
        </section>
      </div>

      {/* Sommaire */}
      <div className="hidden md:block sticky top-20 self-start">
        <Card className="p-4 space-y-2 text-sm">
          <h3 className="font-semibold text-lg">Sommaire</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#introduction" className="hover:underline">1. Introduction</a></li>
            <li><a href="#responsable" className="hover:underline">2. Responsable du traitement</a></li>
            <li><a href="#donnees" className="hover:underline">3. Données collectées</a></li>
            <li><a href="#duree" className="hover:underline">4. Durée de conservation</a></li>
            <li><a href="#droits" className="hover:underline">5. Droits des utilisateurs</a></li>
            <li><a href="#cookies" className="hover:underline">6. Cookies</a></li>
            <li><a href="#securite" className="hover:underline">7. Sécurité des données</a></li>
            <li><a href="#modifications" className="hover:underline">8. Modifications</a></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
