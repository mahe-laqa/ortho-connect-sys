-- Fix PUBLIC_DATA_EXPOSURE: profiles table allows anonymous access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Allow staff to view all profiles (for doctor name lookups, etc.)
CREATE POLICY "Staff can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'doctor'::app_role) OR
    has_role(auth.uid(), 'receptionist'::app_role)
  );

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);