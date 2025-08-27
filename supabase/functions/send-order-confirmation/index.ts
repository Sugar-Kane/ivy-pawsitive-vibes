import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  downloadUrls: Array<{
    filename: string;
    url: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, downloadUrls }: OrderConfirmationRequest = await req.json();

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve order details
    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Generate download links HTML
    const downloadLinksHtml = downloadUrls.map(({ filename, url }) => 
      `<li><a href="${url}" style="color: #2754C5; text-decoration: underline;">${filename}</a></li>`
    ).join('');

    // Send order confirmation email
    const emailResponse = await resend.emails.send({
      from: "Ivy Therapy <orders@lovable.app>",
      to: [order.customer_email],
      subject: "Order Confirmation & Download Links - Ivy Therapy",
      html: `
        <h2>Thank You for Your Purchase!</h2>
        <p>Your order has been confirmed and is ready for download.</p>
        
        <h3>Order Details:</h3>
        <ul>
          <li><strong>Product:</strong> ${order.product_name}</li>
          <li><strong>Amount:</strong> $${(order.amount / 100).toFixed(2)} ${order.currency.toUpperCase()}</li>
          <li><strong>Order ID:</strong> ${order.id}</li>
        </ul>
        
        <h3>Download Your Files:</h3>
        <ul>
          ${downloadLinksHtml}
        </ul>
        
        <p><strong>Important:</strong> Your download links will expire in 30 days. Please download your files as soon as possible.</p>
        
        <p>If you have any issues with your download or questions about your purchase, please contact us.</p>
        
        <p>Thank you for supporting Ivy's therapy mission!</p>
        
        <p>Best regards,<br>Ivy Therapy Team</p>
      `,
    });

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      emailSent: !!emailResponse
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);