import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Inscription newsletter réussie - deKliK',
  description: 'Merci de votre inscription à la newsletter deKliK !'
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-500 mb-4">
            ✅ Inscription réussie !
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Merci de votre inscription à notre newsletter !
          </p>
          <p className="text-gray-400 mb-8">
            Vous recevrez bientôt nos dernières actualités et offres exclusives.
          </p>
          <Link
            href="/"
            className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {"Retour à l'accueil"}
          </Link>
        </div>
      </div>
    </div>
  );
}
