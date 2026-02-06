import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from "@/lib/stripe";
import { prisma } from '@/lib/prisma';
import { finalizeOrder } from '@/app/actions/shop';

export async function POST(req) {
  let event

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      (await headers()).get('stripe-signature'),
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const errorMessage = err.message
    // On error, log and return the error message.
    if (err) console.log(err)
    console.log(`Error message: ${errorMessage}`)
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  const permittedEvents = ['checkout.session.completed']

  if (permittedEvents.includes(event.type)) {
    let data

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          data = event.data.object
          console.log(`CheckoutSession status: ${data.payment_status}`)

          if (data.payment_status === 'paid') {
            const orderId = data.metadata.orderId || data.client_reference_id;

            if (!orderId) {
              console.error('No orderId found in session metadata');
              break;
            }

            // Update Order and Create PrintJob via shared helper
            // We use the helper to ensure consistent logic with the Success page
            await finalizeOrder(orderId);

            console.log(`Order ${orderId} process triggered via webhook.`);
          }
          break
        default:
          throw new Error(`Unhandled event: ${event.type}`)
      }
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { message: 'Webhook handler failed' },
        { status: 500 }
      )
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: 'Received' }, { status: 200 })
}