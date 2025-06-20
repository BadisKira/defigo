'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Challenge } from '@/types/challenge.types'

export default function PaymentSuccessPage() {
  // const [isVerifying, setIsVerifying] = useState(true)
  const [defi, ] = useState<Challenge | null>(null)
  // const searchParams = useSearchParams()
  // const router = useRouter()
  // const sessionId = searchParams.get('session_id')

//   useEffect(() => {
//     if (sessionId) {
//       verifyPayment(sessionId)
//     } else {
//       router.push('/')
//     }
//   }, [sessionId])

//   const verifyPayment = async (sessionId: string) => {
//     try {
//       const response = await fetch(`/api/verify-payment?session_id=${sessionId}`)
//       const data = await response.json()
      
//       setEngagement(data.defi)
//     } catch (error) {
//       console.error('Erreur vérification:', error)
//     } finally {
//       setIsVerifying(false)
//     }
//   }

//   if (isVerifying) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
//           <p>Vérification du paiement...</p>
//         </div>
//       </div>
//     )
//   }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          defi activé ! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Votre defi est maintenant actif. À vous de jouer !
        </p>

        {defi && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">{defi.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{defi.description}</p>
            <p className="text-sm">
              <span className="font-semibold">Montant:</span> {defi.amount}€
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/mon-aventure"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
          >
            Voir mes engagements
          </Link>
          
          <Link 
            href="/defi"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
          >
            Créer un nouvel defi
          </Link>
        </div>
      </div>
    </div>
  )
}