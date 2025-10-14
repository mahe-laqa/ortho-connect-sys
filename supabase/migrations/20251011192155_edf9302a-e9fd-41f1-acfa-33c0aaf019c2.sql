-- Fix: Make first user an admin, subsequent users get patient role
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users (excluding the one being inserted)
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- First user becomes admin, rest become patients by default
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'patient');
  END IF;
  
  RETURN NEW;
END;
$$;