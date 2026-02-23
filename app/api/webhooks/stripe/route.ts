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

        if (!userId) {
          console.error("No userId in metadata!");
          break;
        }

        if (!subscriptionId) {
          console.error("No subscriptionId!");
          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const periodEnd = (subscription as any).current_period_end
          ? new Date(
              (subscription as any).current_period_end * 1000,
            ).toISOString()
          : null;

        const { data: existingUser, error: fetchError } = await supabase
          .from("User")
          .select("id, email, subscription_status")
          .eq("id", userId)
          .single();

        if (fetchError) {
          console.error("User not found in database:", fetchError);
          break;
        }

        const { data: updateData, error: updateError } = await supabase
          .from("User")
          .update({
            subscription_status: "premium",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_period_end: periodEnd,
          })
          .eq("id", userId)
          .select();

        if (updateError) {
          console.error("Failed to update user subscription:", updateError);
        }
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
