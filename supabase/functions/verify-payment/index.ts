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
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update order status
    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .update({
        status: "completed",
        download_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", sessionId)
      .select()
      .single();

    if (orderError) {
      console.error("Error updating order:", orderError);
      throw new Error("Failed to update order");
    }

    // Generate download links based on product
    let downloadUrls = [];
    if (order.product_name === "Ivy's Ebook") {
      downloadUrls.push("digital-products/ivys-ebook.pdf");
    } else if (order.product_name === "Ivy's Ebook Training Guide") {
      downloadUrls.push("digital-products/ivys-training-guide.pdf");
    }

    // Create signed URLs for download (valid for 24 hours)
    const signedUrls = [];
    for (const url of downloadUrls) {
      const { data: signedUrl } = await supabaseService.storage
        .from("digital-products")
        .createSignedUrl(url, 24 * 60 * 60); // 24 hours
      
      if (signedUrl) {
        signedUrls.push({
          filename: url.split('/').pop(),
          url: signedUrl.signedUrl
        });
      }
    }

    console.log("Payment verified and order updated:", order.id);
    
    return new Response(JSON.stringify({ 
      success: true,
      order: order,
      downloadUrls: signedUrls
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});