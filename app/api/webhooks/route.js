import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from "@/lib/stripe";
import { prisma } from '@/lib/prisma'; // Import prisma

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

            // Update Order to PAID
            const updatedOrder = await prisma.shopOrder.update({
              where: { id: orderId },
              data: { status: 'PAID' },
              include: { items: true }
            });

            // Generate Print Text
            // Re-implementing the print text generation here since we removed it from action
            const now = new Date();
            const dateStr = now.toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' });
            let printText = `ORDINE BAR\n${dateStr}\n\nCODICE RITIRO: ${updatedOrder.pickupCode}\n\n`;
            printText += `${updatedOrder.studentName} (${updatedOrder.studentClass})\n`;
            updatedOrder.items.forEach((i) => {
              let itemLine = `${i.qty} x ${i.nameSnapshot}`;
              if (i.topicSnapshot) {
                itemLine += ` [${i.topicSnapshot}]`;
              }
              if (i.selectedOptions) {
                itemLine += ` (${i.selectedOptions})`;
              }
              printText += `${itemLine}\n`;
            });
            if (updatedOrder.note) printText += `NOTE: ${updatedOrder.note}\n`;
            printText += `\nTOTALE: ${(updatedOrder.totalCents / 100).toFixed(2)}€\n`;
            printText += `\n--------------------------------\n`;

            // Create PrintJob
            await prisma.printJob.create({
              data: {
                orderId: updatedOrder.id,
                payloadText: printText,
                status: 'QUEUED'
              }
            });

            // Increment Revenue
            await prisma.settings.update({
              where: { id: 1 },
              data: {
                lifetimeRevenueCents: { increment: updatedOrder.totalCents }
              }
            });

            console.log(`Order ${orderId} finalized and sent to print queue.`);
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