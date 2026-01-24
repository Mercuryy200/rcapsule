import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);

          const periodEnd = (subscription as any).current_period_end
            ? new Date(
                (subscription as any).current_period_end * 1000,
              ).toISOString()
            : null;

          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_status: "premium",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_period_end: periodEnd,
            })
            .eq("id", userId);

          if (error) {
            console.error("Failed to update user subscription:", error);
          } else {
            console.log(`✅ User ${userId} upgraded to premium`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const status = subscription.status === "active" ? "premium" : "free";

        const periodEnd = (subscription as any).current_period_end
          ? new Date(
              (subscription as any).current_period_end * 1000,
            ).toISOString()
          : null;

        const { error } = await supabase
          .from("user")
          .update({
            subscription_status: status,
            subscription_period_end: periodEnd,
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("Failed to update subscription:", error);
        } else {
          console.log(
            `🔄 Subscription updated for customer ${customerId}: ${status}`,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            stripe_subscription_id: null,
            subscription_period_end: null,
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("Failed to downgrade user:", error);
        } else {
          console.log(`❌ User downgraded to free (customer: ${customerId})`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(`⚠️ Payment failed for customer ${customerId}`);
        break;
      }
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
