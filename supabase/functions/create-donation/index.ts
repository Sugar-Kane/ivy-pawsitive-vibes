import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Consider restricting to your domain in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating donation payment session");
    
    // Validate request origin for additional security
    const origin = req.headers.get("origin");
    if (!origin) {
      throw new Error("Origin header required");
    }
    
    const { amount } = await req.json();
    
    // Enhanced validation
    if (!amount || typeof amount !== 'number' || amount < 100 || amount > 1000000) { // $1 - $10,000 limit
      throw new Error("Invalid donation amount. Must be between $1 and $10,000");
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
    // Don't expose detailed error messages to clients
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    const publicError = errorMessage.includes("Invalid donation amount") || errorMessage.includes("Origin header required") 
      ? errorMessage 
      : "Payment processing error";
    
    return new Response(JSON.stringify({ error: publicError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});