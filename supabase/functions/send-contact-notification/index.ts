import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  address?: string;
  subject: string;
  message: string;
  structured_address?: any;
  coordinates?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      organization, 
      address,
      subject, 
      message,
      structured_address,
      coordinates
    }: ContactRequest = await req.json();

    if (!firstName || !lastName || !email || !subject || !message) {
      throw new Error("Required fields are missing");
    }

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Store contact submission in database
    const { error: submissionError } = await supabaseService
      .from("contact_submissions")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        organization: organization || null,
        address: address || null,
        subject: subject,
        message: message,
        structured_address: structured_address || null,
        coordinates: coordinates || null
      });

    if (submissionError) {
      console.error("Error storing contact submission:", submissionError);
      throw submissionError;
    }

    // Send admin notification
    const adminEmailResponse = await resend.emails.send({
      from: "Ivy Therapy <notifications@lovable.app>",
      to: ["adamkane13@gmail.com"], // Admin email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p>A new contact form has been submitted:</p>
        
        <h3>Contact Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${firstName} ${lastName}</li>
          <li><strong>Email:</strong> ${email}</li>
          ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ''}
          ${organization ? `<li><strong>Organization:</strong> ${organization}</li>` : ''}
          ${address ? `<li><strong>Address:</strong> ${address}</li>` : ''}
        </ul>
        
        <h3>Subject:</h3>
        <p>${subject}</p>
        
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
        
        <p>Please respond to this inquiry within 24-48 hours.</p>
      `,
    });

    // Send customer confirmation
    const customerEmailResponse = await resend.emails.send({
      from: "Ivy Therapy <hello@lovable.app>",
      to: [email],
      subject: "Your contact information has been recorded - Ivy Therapy",
      html: `
        <h2>Thank You for Contacting Us!</h2>
        <p>Hello ${firstName},</p>
        
        <p>We have received your message and will reach out within 24–48 hours.</p>
        
        <h3>Your Message:</h3>
        <ul>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Message:</strong></li>
        </ul>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 5px;">${message}</p>
        
        <p>If you need immediate assistance, please call us at (209) 819-9985.</p>
        
        <p>Best regards,<br>Ivy Therapy Team</p>
      `,
    });

    console.log("Contact form emails sent:", { adminEmailResponse, customerEmailResponse });

    return new Response(JSON.stringify({ 
      success: true,
      adminNotificationSent: !!adminEmailResponse,
      customerConfirmationSent: !!customerEmailResponse
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in contact form submission:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);