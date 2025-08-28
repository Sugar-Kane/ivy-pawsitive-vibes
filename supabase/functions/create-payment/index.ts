import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    console.log("Creating payment session for digital product");
    
    const { productName, amount } = await req.json();
    
    if (!productName || !amount || amount < 100) { // Minimum $1.00
      throw new Error("Invalid product or amount");
    }

    console.log(`Processing order for product: ${productName}, amount: $${amount / 100}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create checkout session for digital product
    const session = await stripe.checkout.sessions.create({
      customer_email: "adamkane427@gmail.com", // For testing - in production, get from user
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: productName,
              description: `Digital download: ${productName}`
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${req.headers.get("origin")}/shop?success=true`,
      cancel_url: `${req.headers.get("origin")}/shop?canceled=true`,
      metadata: {
        type: "digital_product",
        product_name: productName,
      },
    });

    // Create order record
    const { error: orderError } = await supabaseService.from("orders").insert({
      customer_email: "adamkane427@gmail.com", // For testing
      product_name: productName,
      amount: amount,
      status: "pending",
      stripe_session_id: session.id,
      created_at: new Date().toISOString()
    });

    if (orderError) {
      console.error("Error creating order record:", orderError);
      // Continue anyway - payment session created
    }

    console.log("Payment session created successfully", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});