-- Auto-create/update app user row when Supabase Auth user is created.
-- Handles email-based merge for existing users re-registering.
-- Run in Supabase SQL editor for BOTH staging and production projects.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
    SET identity_id = NEW.id::text,
        auth_provider = COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        updated_at = now()
    WHERE email = NEW.email;

  IF NOT FOUND THEN
    INSERT INTO public.users (identity_id, email, auth_provider)
    VALUES (NEW.id::text, NEW.email, COALESCE(NEW.raw_app_meta_data->>'provider', 'email'));
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger first if re-running (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
