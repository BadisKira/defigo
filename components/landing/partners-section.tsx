import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const partners = [
  {
    name: "Les Restos du Cœur",
    logo: "https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg",
  },
  {
    name: "Croix-Rouge",
    logo: "https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg",
  },
  {
    name: "Secours Populaire",
    logo: "https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg",
  },
  {
    name: "WWF",
    logo: "https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg",
  },
  {
    name: "Unicef",
    logo: "https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg",
  },
  {
    name: "Emmaüs",
    logo: "https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg",
  },
  {
    name: "Fondation Abbé Pierre",
    logo: "https://images.pexels.com/photos/3228833/pexels-photo-3228833.jpeg",
  },
];

export function PartnersSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex  justify-between">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
          Nos associations partenaires
        </h2>
        <Button asChild>
        <Link href={"associations"}> see them all</Link>
        </Button>
        
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center space-y-4"
            >
              <div className="relative w-24 h-24 grayscale hover:grayscale-0 transition-all duration-300">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-sm text-center font-medium text-secondary">
                {partner.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}