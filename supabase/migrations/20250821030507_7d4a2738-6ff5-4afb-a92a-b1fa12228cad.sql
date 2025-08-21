-- Fix newsletters table security vulnerability
-- First create the user roles system, then restrict newsletter access

-- Create user role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  );
$$;

-- Drop existing policies on user_roles and create new ones
DROP POLICY IF EXISTS "admins_can_manage_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "service_role_user_roles_access" ON public.user_roles;

-- Create policy for user_roles table - admins can manage all roles
CREATE POLICY "admins_can_manage_user_roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Service role policy for user_roles
CREATE POLICY "service_role_user_roles_access" 
ON public.user_roles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Now fix the newsletters table security
-- Drop the overly permissive policy that allows anyone to manage newsletters
DROP POLICY IF EXISTS "Anyone can manage newsletters" ON public.newsletters;

-- Create policy for admin users to manage newsletters
CREATE POLICY "admins_can_manage_newsletters" 
ON public.newsletters 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create policy for service role to access newsletters (needed for sending functionality)
CREATE POLICY "service_role_newsletters_access" 
ON public.newsletters 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);