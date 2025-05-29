import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CguPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:px-16 mt-6 px-6 py-12 w-full  mx-auto">
      <div className="md:col-span-3 space-y-8">
        <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
        <Separator />

        <section id="presentation">
          <h2 className="text-xl font-semibold mb-2">1. Présentation du service</h2>
          <p className="text-muted-foreground">
            Bet Yourself est une plateforme d'engagement personnel exploitée par une auto-entreprise enregistrée en France sous le numéro SIRET [à compléter].
            Elle permet aux utilisateurs de se fixer un défi personnel, de déposer une somme d'argent associée, et de récupérer cette somme en cas de réussite. En cas d'échec, la somme est reversée à une association choisie par l'utilisateur, après déduction d'une commission.
          </p>
        </section>

        <section id="fonctionnement">
          <h2 className="text-xl font-semibold mb-2">2. Fonctionnement</h2>
          <p className="text-muted-foreground">
            L'utilisateur renseigne un défi, une date de début, une durée, un montant, et une association bénéficiaire. Le paiement est traité via un prestataire sécurisé.
            La réussite du défi est déclarée par l'utilisateur à la fin de la période. Aucune validation externe n’est exigée à ce stade.
          </p>
        </section>

        <section id="commission">
          <h2 className="text-xl font-semibold mb-2">3. Commissions et flux financiers</h2>
          <p className="text-muted-foreground">
            Une commission fixe de 15% est prélevée sur chaque engagement, que le défi soit réussi ou non. Le reste est soit remboursé à l’utilisateur, soit transféré à l’association choisie. La plateforme encaisse les fonds directement et se réserve le droit de passer à une solution en compte de paiement type Stripe Connect.
            <br />
            [À définir] : l’utilisateur reçoit un reçu ou une confirmation de transaction. La plateforme recommande de conserver cette preuve pour ses dossiers.
          </p>
        </section>

        <section id="mobile">
          <h2 className="text-xl font-semibold mb-2">4. Accès à l'application mobile</h2>
          <p className="text-muted-foreground">
            L’application mobile est en cours de développement. Son accès sera réservé aux utilisateurs ayant validé un paiement sur la plateforme. Elle offrira des fonctionnalités de rappel, de suivi de progression, et d’aide à la réussite des défis.
          </p>
        </section>

        <section id="regles">
          <h2 className="text-xl font-semibold mb-2">5. Règles de bonne conduite</h2>
          <p className="text-muted-foreground">
            Toute tentative de fraude, la création de défis à caractère dangereux, illégal ou inapproprié entraînera une exclusion immédiate de la plateforme. En cas de fraude manifeste, la somme engagée ne sera pas remboursée, et aucun recours ne sera possible.
          </p>
        </section>

        <section id="responsabilite">
          <h2 className="text-xl font-semibold mb-2">6. Responsabilité</h2>
          <p className="text-muted-foreground">
            Bet Yourself est un outil d’aide à la motivation, mais ne peut garantir la réussite des objectifs fixés par l’utilisateur. La responsabilité de la plateforme ne saurait être engagée en cas d’échec du défi, d’interprétation erronée des résultats ou d’incapacité technique temporaire. En cas de bug majeur bloquant une transaction, l’utilisateur peut contacter le support pour une résolution au cas par cas.
          </p>
        </section>

        <section id="loi">
          <h2 className="text-xl font-semibold mb-2">7. Loi applicable</h2>
          <p className="text-muted-foreground">
            Les présentes conditions sont régies par le droit français. Tout litige sera porté devant les tribunaux compétents du ressort du siège social de l'éditeur.
          </p>
        </section>
      </div>

      <div className="hidden md:block sticky top-20 self-start">
        <Card className="p-4 space-y-2 text-sm">
          <h3 className="font-semibold text-lg">Sommaire</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#presentation" className="hover:underline">1. Présentation du service</a></li>
            <li><a href="#fonctionnement" className="hover:underline">2. Fonctionnement</a></li>
            <li><a href="#commission" className="hover:underline">3. Commissions</a></li>
            <li><a href="#mobile" className="hover:underline">4. Application mobile</a></li>
            <li><a href="#regles" className="hover:underline">5. Règles de conduite</a></li>
            <li><a href="#responsabilite" className="hover:underline">6. Responsabilité</a></li>
            <li><a href="#loi" className="hover:underline">7. Loi applicable</a></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
