import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PhotoSubmissionRequest {
  photoUrls: string[];
  eventDate: string;
  story?: string;
  submitterName?: string;
  submitterEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoUrls, eventDate, story, submitterName, submitterEmail }: PhotoSubmissionRequest = await req.json();

    if (!photoUrls || !photoUrls.length || !eventDate) {
      throw new Error("Photo URLs and event date are required");
    }

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Insert photo submission into database
    const { data: submission, error: submissionError } = await supabaseService
      .from("photo_submissions")
      .insert({
        photo_urls: photoUrls,
        event_date: eventDate,
        story: story || null,
        submitted_by_name: submitterName || null,
        submitted_by_email: submitterEmail || null,
        status: 'pending'
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error creating photo submission:", submissionError);
      throw new Error("Failed to submit photos");
    }

    // Send admin notification
    const formattedDate = new Date(eventDate).toLocaleDateString();
    const photoCount = photoUrls.length;
    
    const adminEmailResponse = await resend.emails.send({
      from: "Ivy Therapy <notifications@lovable.app>",
      to: ["admin@ivytherapy.com"], // Replace with actual admin email
      subject: "New Photo Submission - Ivy Therapy Gallery",
      html: `
        <h2>New Photo Submission</h2>
        <p>A new photo submission has been received for the gallery:</p>
        
        <h3>Submission Details:</h3>
        <ul>
          <li><strong>Event Date:</strong> ${formattedDate}</li>
          <li><strong>Number of Photos:</strong> ${photoCount}</li>
          ${submitterName ? `<li><strong>Submitted by:</strong> ${submitterName}</li>` : ''}
          ${submitterEmail ? `<li><strong>Email:</strong> ${submitterEmail}</li>` : ''}
        </ul>
        
        ${story ? `<h3>Story:</h3><p>${story}</p>` : ''}
        
        <p>Please review and approve/reject this submission in the admin dashboard.</p>
        <p><strong>Submission ID:</strong> ${submission.id}</p>
      `,
    });

    console.log("Photo submission created and admin notified:", submission.id);

    return new Response(JSON.stringify({ 
      success: true,
      submissionId: submission.id,
      adminNotificationSent: !!adminEmailResponse
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in photo submission:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);