import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  email: string;
  name?: string;
  type: 'welcome' | 'newsletter_confirmation';
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, type, data }: NotificationEmailRequest = await req.json();
    console.log(`Sending ${type} email to ${email}`);

    let emailContent = {
      from: "Ivy's Healing Hands <noreply@yourdomain.com>", // Change this to your verified domain
      to: [email],
      subject: "",
      html: ""
    };

    switch (type) {
      case 'newsletter_confirmation':
        emailContent.subject = "Welcome to Ivy's Healing Hands Newsletter!";
        emailContent.html = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #4ade80; text-align: center;">Welcome to Ivy's Healing Hands!</h1>
            <p>Thank you for subscribing to our newsletter${name ? `, ${name}` : ''}!</p>
            <p>You'll now receive updates about:</p>
            <ul>
              <li>Wellness tips and techniques</li>
              <li>Special promotions and events</li>
              <li>New services and offerings</li>
              <li>Health and healing insights</li>
            </ul>
            <p>We're excited to be part of your wellness journey!</p>
            <p style="margin-top: 30px;">
              <strong>Ivy's Healing Hands</strong><br>
              Your partner in wellness and healing
            </p>
          </div>
        `;
        break;

      case 'welcome':
        emailContent.subject = "Welcome to Ivy's Healing Hands";
        emailContent.html = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #4ade80; text-align: center;">Welcome!</h1>
            <p>Hello${name ? ` ${name}` : ''},</p>
            <p>Welcome to Ivy's Healing Hands. We're here to support your wellness journey with our healing services.</p>
            <p>Feel free to reach out if you have any questions or would like to schedule an appointment.</p>
            <p style="margin-top: 30px;">
              <strong>Ivy's Healing Hands</strong><br>
              Your partner in wellness and healing
            </p>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send(emailContent);
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);