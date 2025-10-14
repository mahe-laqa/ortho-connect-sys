-- Add comprehensive server-side validation for patient data

-- Add email format validation constraint
ALTER TABLE public.patients 
  ADD CONSTRAINT patient_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL);

-- Create validation function for patient data
CREATE OR REPLACE FUNCTION validate_patient_data()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  -- Trim whitespace from text fields
  NEW.first_name = trim(NEW.first_name);
  NEW.last_name = trim(NEW.last_name);
  
  IF NEW.email IS NOT NULL THEN
    NEW.email = trim(lower(NEW.email));
  END IF;
  
  IF NEW.address IS NOT NULL THEN
    NEW.address = trim(NEW.address);
  END IF;
  
  -- Validate medical history length
  IF NEW.medical_history IS NOT NULL AND length(NEW.medical_history) > 10000 THEN
    RAISE EXCEPTION 'Medical history cannot exceed 10,000 characters';
  END IF;
  
  -- Validate allergies length
  IF NEW.allergies IS NOT NULL AND length(NEW.allergies) > 5000 THEN
    RAISE EXCEPTION 'Allergies field cannot exceed 5,000 characters';
  END IF;
  
  -- Validate notes length
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 5000 THEN
    RAISE EXCEPTION 'Notes field cannot exceed 5,000 characters';
  END IF;
  
  -- Validate gender if provided
  IF NEW.gender IS NOT NULL AND NEW.gender NOT IN ('Male', 'Female', 'Other', 'Prefer not to say') THEN
    RAISE EXCEPTION 'Invalid gender value';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for patient validation
DROP TRIGGER IF EXISTS validate_patient_before_insert ON public.patients;
CREATE TRIGGER validate_patient_before_insert
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION validate_patient_data();

-- Add validation for appointments table
CREATE OR REPLACE FUNCTION validate_appointment_data()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  -- Validate duration is positive
  IF NEW.duration_minutes IS NOT NULL AND NEW.duration_minutes <= 0 THEN
    RAISE EXCEPTION 'Appointment duration must be positive';
  END IF;
  
  -- Validate duration is reasonable (max 8 hours)
  IF NEW.duration_minutes IS NOT NULL AND NEW.duration_minutes > 480 THEN
    RAISE EXCEPTION 'Appointment duration cannot exceed 8 hours';
  END IF;
  
  -- Validate notes length
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 5000 THEN
    RAISE EXCEPTION 'Notes field cannot exceed 5,000 characters';
  END IF;
  
  -- Validate reason length
  IF NEW.reason IS NOT NULL AND length(NEW.reason) > 500 THEN
    RAISE EXCEPTION 'Reason field cannot exceed 500 characters';
  END IF;
  
  -- Trim text fields
  IF NEW.reason IS NOT NULL THEN
    NEW.reason = trim(NEW.reason);
  END IF;
  
  IF NEW.notes IS NOT NULL THEN
    NEW.notes = trim(NEW.notes);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for appointment validation
DROP TRIGGER IF EXISTS validate_appointment_before_insert ON public.appointments;
CREATE TRIGGER validate_appointment_before_insert
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_data();

-- Add validation for doctors table
CREATE OR REPLACE FUNCTION validate_doctor_data()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  -- Validate experience years is non-negative
  IF NEW.experience_years IS NOT NULL AND NEW.experience_years < 0 THEN
    RAISE EXCEPTION 'Experience years cannot be negative';
  END IF;
  
  -- Validate experience years is reasonable (max 60 years)
  IF NEW.experience_years IS NOT NULL AND NEW.experience_years > 60 THEN
    RAISE EXCEPTION 'Experience years cannot exceed 60';
  END IF;
  
  -- Validate consultation fee is non-negative
  IF NEW.consultation_fee IS NOT NULL AND NEW.consultation_fee < 0 THEN
    RAISE EXCEPTION 'Consultation fee cannot be negative';
  END IF;
  
  -- Trim license number
  IF NEW.license_number IS NOT NULL THEN
    NEW.license_number = trim(NEW.license_number);
  END IF;
  
  -- Validate education length
  IF NEW.education IS NOT NULL AND length(NEW.education) > 2000 THEN
    RAISE EXCEPTION 'Education field cannot exceed 2,000 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for doctor validation
DROP TRIGGER IF EXISTS validate_doctor_before_insert ON public.doctors;
CREATE TRIGGER validate_doctor_before_insert
  BEFORE INSERT OR UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION validate_doctor_data();