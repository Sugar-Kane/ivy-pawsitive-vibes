import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  newsletterId: string;
  title: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsletterId, title, content }: SendNewsletterRequest = await req.json();
    
    console.log(`Starting newsletter send for: ${title}`);

    // Get all verified subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('email_subscribers')
      .select('email')
      .eq('verified', true);

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw new Error('Failed to fetch subscribers');
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No verified subscribers found' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${subscribers.length} verified subscribers`);

    // Create newsletter HTML template
    const newsletterHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c5530; margin-bottom: 10px;">Ivy's Healing Hands</h1>
            <p style="color: #666; margin: 0;">Holistic Massage Therapy</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #2c5530; margin-top: 0;">${title}</h2>
            <div style="white-space: pre-line; color: #333;">
              ${content}
            </div>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              Thank you for subscribing to our newsletter!
            </p>
            <p style="color: #666; font-size: 12px;">
              <a href="https://oqvqctgewpbzgbawyosj.supabase.co/functions/v1/unsubscribe?email={{email}}" 
                 style="color: #666; text-decoration: underline;">
                Unsubscribe
              </a>
            </p>
          </div>
        </body>
      </html>
    `;

    let sentCount = 0;
    let failedCount = 0;

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        const personalizedHtml = newsletterHtml.replace('{{email}}', subscriber.email);
        
        const emailResponse = await resend.emails.send({
          from: "Ivy's Healing Hands <noreply@yourdomain.com>",
          to: [subscriber.email],
          subject: title,
          html: personalizedHtml,
        });

        if (emailResponse.error) {
          console.error(`Failed to send to ${subscriber.email}:`, emailResponse.error);
          failedCount++;
        } else {
          sentCount++;
          
          // Log successful delivery
          await supabase
            .from('notification_logs')
            .insert({
              subscriber_email: subscriber.email,
              notification_type: 'newsletter',
              subject: title,
              delivery_status: 'sent',
              resend_message_id: emailResponse.data?.id
            });

          // Update last notification sent for subscriber
          await supabase
            .from('email_subscribers')
            .update({ last_notification_sent: new Date().toISOString() })
            .eq('email', subscriber.email);
        }
      } catch (emailError) {
        console.error(`Error sending to ${subscriber.email}:`, emailError);
        failedCount++;
        
        // Log failed delivery
        await supabase
          .from('notification_logs')
          .insert({
            subscriber_email: subscriber.email,
            notification_type: 'newsletter',
            subject: title,
            delivery_status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
          });
      }
    }

    // Update newsletter status
    await supabase
      .from('newsletters')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_to_count: sentCount
      })
      .eq('id', newsletterId);

    console.log(`Newsletter send complete. Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalSubscribers: subscribers.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
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