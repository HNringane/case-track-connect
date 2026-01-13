-- Update the handle_new_user function to use the role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, id_number, phone)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'id_number',
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  -- Get role from user metadata, default to 'victim' if not provided
  user_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::user_role,
    'victim'::user_role
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;