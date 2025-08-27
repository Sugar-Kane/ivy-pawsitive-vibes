import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentNotificationRequest {
  appointmentId: string;
  sendCustomerConfirmation?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, sendCustomerConfirmation = false }: AppointmentNotificationRequest = await req.json();

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve appointment details
    const { data: appointment, error: appointmentError } = await supabaseService
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error("Appointment not found");
    }

    const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString();
    const appointmentTime = appointment.appointment_time;

    // Send admin notification
    const adminEmailResponse = await resend.emails.send({
      from: "Ivy Therapy <notifications@lovable.app>",
      to: ["admin@ivytherapy.com"], // Replace with actual admin email
      subject: "New Appointment Booking - Ivy Therapy",
      html: `
        <h2>New Appointment Booking</h2>
        <p>A new appointment has been scheduled:</p>
        
        <h3>Appointment Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
          <li><strong>Location:</strong> ${appointment.location}</li>
        </ul>
        
        <h3>Contact Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${appointment.name}</li>
          <li><strong>Business:</strong> ${appointment.business_name}</li>
          <li><strong>Phone:</strong> ${appointment.contact_number}</li>
        </ul>
        
        ${appointment.notes ? `<h3>Notes:</h3><p>${appointment.notes}</p>` : ''}
        
        <p>Please contact the client to confirm the appointment details.</p>
      `,
    });

    console.log("Admin notification sent:", adminEmailResponse);

    let customerEmailResponse = null;
    
    // Send customer confirmation if requested
    if (sendCustomerConfirmation) {
      // Note: We would need a customer email field in the appointments table
      // For now, this is commented out but ready to implement
      /*
      customerEmailResponse = await resend.emails.send({
        from: "Ivy Therapy <bookings@lovable.app>",
        to: [appointment.customer_email], // Would need this field
        subject: "Appointment Confirmation - Ivy Therapy",
        html: `
          <h2>Appointment Confirmation</h2>
          <p>Hello ${appointment.name},</p>
          
          <p>Your appointment request has been received and is being processed.</p>
          
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${appointmentDate}</li>
            <li><strong>Time:</strong> ${appointmentTime}</li>
            <li><strong>Location:</strong> ${appointment.location}</li>
          </ul>
          
          <p>We will contact you shortly to confirm the final details.</p>
          
          <p>Best regards,<br>Ivy Therapy Team</p>
        `,
      });
      */
    }

    return new Response(JSON.stringify({ 
      success: true,
      adminNotificationSent: !!adminEmailResponse,
      customerConfirmationSent: !!customerEmailResponse
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending appointment notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);