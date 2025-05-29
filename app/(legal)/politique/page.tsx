// app/(legal)/politique-de-confidentialite/page.tsx

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="flex flex-col md:flex-row max-w-6xl mx-auto px-4 py-12 gap-12">
      {/* Contenu principal */}
      <div className="md:w-2/3 space-y-6">
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>

        <p className="text-muted-foreground">
          Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles sur la plateforme Bet Yourself.
        </p>

        <Separator />

        <section id="1">
          <h2 className="text-xl font-semibold mb-2">1. Données collectées</h2>
          <p>
            Lors de l’utilisation de notre service, nous collectons les données suivantes via Clerk et notre backend : email, nom, identifiant unique, détails des défis, montants engagés, durées, et éventuellement des preuves d’accomplissement.
          </p>
        </section>

        <section id="2">
          <h2 className="text-xl font-semibold mb-2">2. Base légale du traitement</h2>
          <p>
            Le traitement de vos données repose exclusivement sur votre consentement explicite, notamment pour la création de compte, le dépôt d’un défi, ou l’utilisation de vos contenus à des fins d’analyse (si vous cochez la case prévue à cet effet).
          </p>
        </section>

        <section id="3">
          <h2 className="text-xl font-semibold mb-2">3. Services tiers utilisés</h2>
          <p>
            Nous utilisons des prestataires reconnus pour garantir la sécurité de vos données : Clerk (authentification), Supabase (stockage et base de données), Stripe (paiement), Google Fonts (affichage), Mailgun/Sendgrid (emails).
          </p>
        </section>

        <section id="4">
          <h2 className="text-xl font-semibold mb-2">4. Durée de conservation</h2>
          <p>
            Les données sont conservées aussi longtemps que votre compte reste actif. En cas de suppression du compte, nous effaçons vos données personnelles de manière sécurisée, sauf obligations légales contraires.
          </p>
        </section>

        <section id="5">
          <h2 className="text-xl font-semibold mb-2">5. Transfert hors UE</h2>
          <p>
            Certaines données peuvent transiter par des serveurs situés hors Union Européenne (notamment aux États-Unis). Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne ou le cadre juridique du Data Privacy Framework.
          </p>
        </section>

        <section id="6">
          <h2 className="text-xl font-semibold mb-2">6. Vos droits</h2>
          <p>
            Vous disposez des droits suivants : accès, rectification, suppression, portabilité. Pour exercer vos droits, vous pouvez nous contacter à l’adresse suivante : [email à compléter].
          </p>
        </section>

        <section id="7">
          <h2 className="text-xl font-semibold mb-2">7. Cookies & trackers</h2>
          <p>
            À ce jour, nous n’utilisons aucun cookie ni outil de traçage tiers sur la plateforme.
          </p>
        </section>

        <section id="8">
          <h2 className="text-xl font-semibold mb-2">8. Loi applicable</h2>
          <p>
            Cette politique est régie par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>
      </div>

      {/* Sommaire sticky */}
      <aside className="md:w-1/3 sticky top-20 h-fit">
        <ScrollArea className="p-4 border rounded-md">
          <nav className="space-y-2 text-sm">
            <h3 className="font-semibold text-lg mb-2">Sommaire</h3>
            <ul className="space-y-1">
              <li><a href="#1" className="text-muted-foreground hover:underline">1. Données collectées</a></li>
              <li><a href="#2" className="text-muted-foreground hover:underline">2. Base légale</a></li>
              <li><a href="#3" className="text-muted-foreground hover:underline">3. Services tiers</a></li>
              <li><a href="#4" className="text-muted-foreground hover:underline">4. Durée de conservation</a></li>
              <li><a href="#5" className="text-muted-foreground hover:underline">5. Transfert hors UE</a></li>
              <li><a href="#6" className="text-muted-foreground hover:underline">6. Vos droits</a></li>
              <li><a href="#7" className="text-muted-foreground hover:underline">7. Cookies & trackers</a></li>
              <li><a href="#8" className="text-muted-foreground hover:underline">8. Loi applicable</a></li>
            </ul>
          </nav>
        </ScrollArea>
      </aside>
    </div>
  )
}
