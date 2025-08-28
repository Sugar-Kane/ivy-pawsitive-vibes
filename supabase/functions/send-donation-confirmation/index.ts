import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonationConfirmationRequest {
  donorEmail: string;
  amount: number; // in cents
  donorName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { donorEmail, amount, donorName }: DonationConfirmationRequest = await req.json();

    if (!donorEmail || !amount) {
      throw new Error("Donor email and amount are required");
    }

    const formattedAmount = (amount / 100).toFixed(2);

    // Send admin notification
    const adminEmailResponse = await resend.emails.send({
      from: "Ivy Therapy <notifications@lovable.app>",
      to: ["admin@ivytherapy.com"], // Replace with actual admin email
      subject: `New Donation Received - $${formattedAmount}`,
      html: `
        <h2>New Donation Received</h2>
        <p>A new donation has been processed:</p>
        
        <h3>Donation Details:</h3>
        <ul>
          <li><strong>Amount:</strong> $${formattedAmount}</li>
          <li><strong>Donor Email:</strong> ${donorEmail}</li>
          ${donorName ? `<li><strong>Donor Name:</strong> ${donorName}</li>` : ''}
          <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        
        <p>Thank you for the continued support of Ivy's mission!</p>
      `,
    });

    // Send customer confirmation
    const customerEmailResponse = await resend.emails.send({
      from: "Ivy Therapy <hello@lovable.app>",
      to: [donorEmail],
      subject: "Thank you for your donation - Ivy Therapy",
      html: `
        <h2>Thank You for Your Donation!</h2>
        ${donorName ? `<p>Dear ${donorName},</p>` : '<p>Dear Supporter,</p>'}
        
        <p>Thank you for your generous donation of <strong>$${formattedAmount}</strong> to support Ivy's therapy mission.</p>
        
        <p>Your contribution will help us:</p>
        <ul>
          <li>Cover travel costs for therapy visits</li>
          <li>Maintain Ivy's training and certifications</li>
          <li>Purchase supplies and equipment needed for visits</li>
          <li>Reach more people in need of comfort and healing</li>
        </ul>
        
        <p>Because of supporters like you, Ivy can continue bringing joy and comfort to those who need it most.</p>
        
        <p>With heartfelt gratitude,<br>The Ivy Therapy Team</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This donation was processed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.<br>
          If you have any questions about your donation, please contact us at hello@ivystherapypaws.org
        </p>
      `,
    });

    console.log("Donation confirmation emails sent:", { adminEmailResponse, customerEmailResponse });

    return new Response(JSON.stringify({ 
      success: true,
      adminNotificationSent: !!adminEmailResponse,
      customerConfirmationSent: !!customerEmailResponse
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending donation confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);