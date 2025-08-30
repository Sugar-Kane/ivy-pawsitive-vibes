-- Fix RLS policy for orders table to prevent unauthorized access
-- Since authentication was removed, we need to ensure orders are only accessible 
-- through secure edge functions or by matching customer email in authenticated context

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create a more restrictive policy that only allows access when properly authenticated
-- This policy will deny all SELECT access to anonymous users
CREATE POLICY "Authenticated users can view their own orders" ON public.orders
FOR SELECT
USING (
  -- Only allow access if user is authenticated AND matches the order
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    customer_email = auth.email()
  )
);

-- Ensure the service role policy exists for edge functions
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
CREATE POLICY "Service role can manage orders" ON public.orders
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');