import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Erreur - deKliK',
  description: 'Une erreur est survenue lors de votre inscription à la newsletter'
};

export default async function ErrorPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const errorMessage = await searchParams || 'Une erreur est survenue';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">
            ❌ Erreur
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            {errorMessage.message}
          </p>
          <p className="text-gray-400 mb-8">
            Veuillez réessayer plus tard ou contacter le support.
          </p>
          <Link
            href="/"
            className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {"Retour à l'accueil"}
          </Link>
        </div>
      </div>
    </div>
  );
}
