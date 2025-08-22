-- Fix critical security vulnerability: Customer contact information exposed to public
-- The appointments table currently allows anyone to read all customer data including names, phone numbers, and addresses

-- Drop the overly permissive policy that allows anyone to view appointments
DROP POLICY IF EXISTS "Anyone can view appointments" ON public.appointments;

-- Create a secure policy that only allows admin users to view appointment data
-- This protects customer privacy while allowing admin staff to manage appointments
CREATE POLICY "Only admins can view appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Keep the public insert policy for appointment booking functionality
-- This allows the booking form to work without authentication
-- Note: The existing "Anyone can create appointments" policy remains unchanged

-- Add admin policies for managing appointments (UPDATE/DELETE)
CREATE POLICY "Admins can update appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete appointments" 
ON public.appointments 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Service role policy for appointments (needed for potential backend operations)
CREATE POLICY "service_role_appointments_access" 
ON public.appointments 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);