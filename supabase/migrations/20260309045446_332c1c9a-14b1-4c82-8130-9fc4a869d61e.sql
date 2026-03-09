
-- Fix 1: Convert RESTRICTIVE policies to PERMISSIVE for patients table
DROP POLICY IF EXISTS "Staff can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Admins and receptionists can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Admins and receptionists can update patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can delete patients" ON public.patients;

CREATE POLICY "Staff can view all patients" ON public.patients FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins and receptionists can insert patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role));

CREATE POLICY "Admins and receptionists can update patients" ON public.patients FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role));

CREATE POLICY "Admins can delete patients" ON public.patients FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Same for appointments (also restrictive-only)
DROP POLICY IF EXISTS "Staff can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;

CREATE POLICY "Staff can view all appointments" ON public.appointments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Staff can insert appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Staff can update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can delete appointments" ON public.appointments FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Same for doctors
DROP POLICY IF EXISTS "Staff can view doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can manage doctors" ON public.doctors;

CREATE POLICY "Staff can view doctors" ON public.doctors FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can manage doctors" ON public.doctors FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 4: Same for user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 5: Same for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role));

CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Fix 6: Revoke direct execute on has_role from public/authenticated to prevent UUID enumeration
-- The function will still work in RLS policies (which run as table owner)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon, authenticated;
