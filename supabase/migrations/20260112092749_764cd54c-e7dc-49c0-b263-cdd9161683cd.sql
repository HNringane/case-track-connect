-- Fix the permissive notifications insert policy
DROP POLICY "System can insert notifications" ON public.notifications;

-- Create a proper policy: users can insert notifications for case participants
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- User can notify themselves
      user_id = auth.uid() OR
      -- Police/admin can notify anyone
      public.has_role(auth.uid(), 'police') OR
      public.has_role(auth.uid(), 'admin')
    )
  );