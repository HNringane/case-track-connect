-- Create enums for case management
CREATE TYPE public.case_status AS ENUM ('submitted', 'under-review', 'investigation', 'resolution', 'completed');
CREATE TYPE public.case_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.user_role AS ENUM ('victim', 'police', 'admin');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  id_number TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  victim_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  officer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  description TEXT,
  status public.case_status NOT NULL DEFAULT 'submitted',
  priority public.case_priority NOT NULL DEFAULT 'medium',
  progress INTEGER NOT NULL DEFAULT 10,
  status_label TEXT NOT NULL DEFAULT 'In Progress',
  province TEXT,
  city TEXT,
  location TEXT,
  station_name TEXT,
  anonymous BOOLEAN DEFAULT false,
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_update TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create case_updates table for timeline
CREATE TABLE public.case_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  stage public.case_status NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  case_number TEXT,
  message TEXT NOT NULL,
  details TEXT,
  priority public.case_priority DEFAULT 'medium',
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies (only readable by the user or admins)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Cases policies
CREATE POLICY "Victims can view own cases"
  ON public.cases FOR SELECT
  USING (
    victim_id = auth.uid() OR
    public.has_role(auth.uid(), 'police') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Victims can create cases"
  ON public.cases FOR INSERT
  WITH CHECK (victim_id = auth.uid());

CREATE POLICY "Police can update cases"
  ON public.cases FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'police') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Case updates policies
CREATE POLICY "Users can view case updates for their cases"
  ON public.case_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_updates.case_id
      AND (
        cases.victim_id = auth.uid() OR
        public.has_role(auth.uid(), 'police') OR
        public.has_role(auth.uid(), 'admin')
      )
    )
  );

CREATE POLICY "Police can insert case updates"
  ON public.case_updates FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'police') OR
    public.has_role(auth.uid(), 'admin') OR
    created_by = auth.uid()
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Default role is victim
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'victim');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update case progress based on status
CREATE OR REPLACE FUNCTION public.update_case_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update progress and status_label based on status
  NEW.progress := CASE NEW.status
    WHEN 'submitted' THEN 10
    WHEN 'under-review' THEN 35
    WHEN 'investigation' THEN 60
    WHEN 'resolution' THEN 85
    WHEN 'completed' THEN 100
  END;
  
  NEW.status_label := CASE NEW.status
    WHEN 'completed' THEN 'Completed'
    ELSE 'In Progress'
  END;
  
  NEW.last_update := now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_case_status_change
  BEFORE UPDATE OF status ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_case_on_status_change();

-- Enable realtime for cases and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_updates;