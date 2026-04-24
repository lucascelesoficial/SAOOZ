-- Team members table
CREATE TABLE IF NOT EXISTS public.business_team_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  owner_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email    TEXT NOT NULL,
  member_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  permissions     JSONB NOT NULL DEFAULT '{"view":true,"add_transactions":false,"edit_transactions":false,"delete_transactions":false,"export_reports":false}',
  invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  UNIQUE(business_id, member_email)
);

ALTER TABLE public.business_team_members ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their team
CREATE POLICY "team_owner_all" ON public.business_team_members
  FOR ALL USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());

-- Member can see their own invite and update (accept)
CREATE POLICY "team_member_self" ON public.business_team_members
  FOR SELECT USING (member_user_id = auth.uid());

CREATE POLICY "team_member_accept" ON public.business_team_members
  FOR UPDATE USING (member_user_id = auth.uid())
  WITH CHECK (member_user_id = auth.uid());

-- Helper: check if current user is active team member of a business
CREATE OR REPLACE FUNCTION public.is_business_team_member(bid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_team_members
    WHERE business_id = bid
      AND member_user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- Allow team members to SELECT business_profiles they're members of
CREATE POLICY "biz_profiles_team_select" ON public.business_profiles
  FOR SELECT USING (is_business_team_member(id));

-- Allow team members to SELECT revenues/expenses for businesses they're in
CREATE POLICY "biz_revenues_team_select" ON public.business_revenues
  FOR SELECT USING (is_business_team_member(business_id));

CREATE POLICY "biz_expenses_team_select" ON public.business_expenses
  FOR SELECT USING (is_business_team_member(business_id));
