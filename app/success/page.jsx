import { redirect } from 'next/navigation'
import { Stripe } from 'stripe'
import { CheckCircle, Home, Mail } from 'lucide-react'
import Link from 'next/link'

import { stripe } from "@/lib/stripe";
import { prisma } from '@/lib/prisma';
import { finalizeOrder } from '@/app/actions/shop';

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams

  if (!session_id)
    throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })

  const { status, metadata } = session;

  if (status === 'open') {
    return redirect('/')
  }

  if (status === 'complete') {
    // Update order status if orderId is present
    // Verify and Finalize Order (Status + PrintJob)
    if (metadata?.orderId) {
      await finalizeOrder(metadata.orderId);
    }

    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-neutral-100">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Ordine Ricevuto!</h1>

          <p className="text-neutral-600 mb-6">
            Grazie per l'Ordine, lo inizieremo a preparare il prima possibile.
          </p>

          <div className="bg-neutral-50 rounded-xl p-4 mb-8 text-sm text-neutral-600 border border-neutral-100">
            <p className="flex items-center justify-center gap-2 mb-1">
              <Mail className="w-4 h-4" />
              Hai bisogno di aiuto?
            </p>
            <a
              href="mailto:rappstudenti@itisrossi.vi.it?subject=Problema%20Sito%20Bar"
              className="text-blue-600 font-medium hover:underline block"
            >
              Inviaci una Email
            </a>
            <p className="text-xs text-neutral-400 mt-1">rappstudenti@itisrossi.vi.it</p>
          </div>

          <Link
            href="https://bar-itisrossi.vercel.app/orders"
            className="w-full bg-neutral-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-neutral-800 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Torna ai miei ordini
          </Link>
        </div>
      </main>
    )
  }
}
