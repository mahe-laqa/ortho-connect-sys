-- Fix 1: Update functions to have proper search_path settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS VARCHAR(20)
LANGUAGE PLPGSQL
SET search_path = public
AS $$
DECLARE
  new_id VARCHAR(20);
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'PT' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.patients WHERE patient_id = new_id) INTO id_exists;
    EXIT WHEN NOT id_exists;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Fix 2: Secure role assignment with database trigger (removes client-side vulnerability)
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- All new users get 'patient' role by default
  -- Admins must be assigned manually by existing admins
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign roles on user creation
DROP TRIGGER IF EXISTS on_user_role_assignment ON auth.users;
CREATE TRIGGER on_user_role_assignment
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- Fix 3: Restrict patients table access to staff only
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;

CREATE POLICY "Staff can view all patients" ON public.patients
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'doctor')
  );

-- Fix 4: Restrict user_roles table access
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

-- Users can only view their own role
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 5: Restrict appointments access to staff only
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;

CREATE POLICY "Staff can view all appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'doctor')
  );

-- Fix 6: Restrict doctors table access to staff only
DROP POLICY IF EXISTS "Authenticated users can view doctors" ON public.doctors;

CREATE POLICY "Staff can view doctors" ON public.doctors
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'doctor')
  );

-- Fix 7: Add INSERT policy for profiles table (defense in depth)
CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fix 8: Add validation constraints for data integrity (without IF NOT EXISTS)
DO $$ 
BEGIN
  -- Drop constraints if they exist, then add them
  ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patient_name_length;
  ALTER TABLE public.patients ADD CONSTRAINT patient_name_length CHECK (
    length(first_name) > 0 AND length(first_name) <= 100 AND
    length(last_name) > 0 AND length(last_name) <= 100
  );
  
  ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patient_phone_length;
  ALTER TABLE public.patients ADD CONSTRAINT patient_phone_length CHECK (
    length(phone) >= 7 AND length(phone) <= 20
  );
END $$;

-- Add indexes for better performance on role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);