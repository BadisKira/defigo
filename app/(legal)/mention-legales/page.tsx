import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function MentionsLegalesPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 py-12 max-w-7xl mx-auto">
      {/* Contenu principal */}
      <div className="md:col-span-3 space-y-8">
        <h1 className="text-3xl font-bold">Mentions légales</h1>
        <Separator />

        <section id="editeur">
          <h2 className="text-xl font-semibold mb-2">1. Éditeur du site</h2>
          <p className="text-muted-foreground">
            [Nom de l’entreprise ou de l’individu] <br />
            [Adresse] <br />
            [Numéro SIRET / RCS] <br />
            Email : [email@example.com]
          </p>
        </section>

        <section id="publication">
          <h2 className="text-xl font-semibold mb-2">2. Directeur de la publication</h2>
          <p className="text-muted-foreground">
            [Nom complet de la personne responsable de la publication du site]
          </p>
        </section>

        <section id="hebergeur">
          <h2 className="text-xl font-semibold mb-2">3. Hébergeur</h2>
          <p className="text-muted-foreground">
            [Nom de l’hébergeur] <br />
            [Adresse de l’hébergeur] <br />
            Site : [https://example.com]
          </p>
        </section>

        <section id="propriete">
          <h2 className="text-xl font-semibold mb-2">4. Propriété intellectuelle</h2>
          <p className="text-muted-foreground">
            Tous les contenus présents sur le site (textes, images, logos, etc.) sont la propriété de Bet Yourself, sauf mention contraire. Toute reproduction, distribution ou usage non autorisé est strictement interdit.
          </p>
        </section>

        <section id="responsabilite">
          <h2 className="text-xl font-semibold mb-2">5. Limitation de responsabilité</h2>
          <p className="text-muted-foreground">
            L’éditeur ne peut être tenu responsable des dommages directs ou indirects causés au matériel de l’utilisateur, ni de tout bug, incompatibilité ou dysfonctionnement résultant de l’utilisation du site.
          </p>
        </section>
      </div>

      {/* Sommaire */}
      <div className="hidden md:block sticky top-20 self-start">
        <Card className="p-4 space-y-2 text-sm">
          <h3 className="font-semibold text-lg">Sommaire</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#editeur" className="hover:underline">1. Éditeur du site</a></li>
            <li><a href="#publication" className="hover:underline">2. Directeur de la publication</a></li>
            <li><a href="#hebergeur" className="hover:underline">3. Hébergeur</a></li>
            <li><a href="#propriete" className="hover:underline">4. Propriété intellectuelle</a></li>
            <li><a href="#responsabilite" className="hover:underline">5. Limitation de responsabilité</a></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
