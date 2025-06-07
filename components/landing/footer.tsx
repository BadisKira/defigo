import Link from "next/link";

export function Footer() {
  return (
    <footer className="md:px-12 px-6 bg-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 w-full">
            <h2 className="font-montserrat font-bold text-2xl mb-2 flex items-center">DéfiGo</h2>
            <p className="text-gray-300 max-w-md">
              DéfiGo n&apos;est pas un site de jeux d&apos;argent. 
              Tu ne peux pas gagner plus que ce que tu engages.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 w-full">
            <div>
              <h3 className="font-semibold text-lg mb-2">Liens utiles</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors ">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                    Associations partenaires
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Légal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/mention-legales" className="text-gray-300 hover:text-white transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="text-gray-300 hover:text-white transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/politique" className="text-gray-300 hover:text-white transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} DéfiGo . Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}