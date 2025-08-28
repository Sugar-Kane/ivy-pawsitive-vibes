import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating donation payment session");
    
    const { amount } = await req.json();
    
    if (!amount || amount < 100) { // Minimum $1.00
      throw new Error("Invalid donation amount");
    }

    console.log(`Processing donation for amount: $${amount / 100}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create a one-time payment session for donation
    const session = await stripe.checkout.sessions.create({
      customer_email: "adamkane427@gmail.com", // For testing
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "Donation to Ivy's Therapy Mission",
              description: "Support therapy visits and bring comfort to those who need it most"
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${req.headers.get("origin")}/donate?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/donate?canceled=true`,
      metadata: {
        type: "donation",
        amount: amount.toString(),
        donor_email: "adamkane427@gmail.com", // For testing
      },
    });

    console.log("Donation session created successfully", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating donation session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});