-- ── Team member profile flag ─────────────────────────────────────────────────
-- Indicates that this user was created exclusively via a team invite.
-- Used by middleware to bypass the subscription gate and redirect /central → /empresa.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_team_member BOOLEAN NOT NULL DEFAULT FALSE;

-- ── accept_pending_team_invites() ─────────────────────────────────────────────
-- SECURITY DEFINER so it can read auth.users.email and update business_team_members
-- even for rows where member_user_id IS NULL (no RLS policy covers that case).
-- Returns the list of business_ids that were just accepted.
CREATE OR REPLACE FUNCTION public.accept_pending_team_invites()
RETURNS TABLE(business_id UUID, owner_user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID;
  v_user_email TEXT;
BEGIN
  -- Resolve current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get the authenticated user's email from auth schema
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  IF v_user_email IS NULL THEN
    RETURN;
  END IF;

  -- Accept all pending invites whose member_email matches this user
  UPDATE public.business_team_members
  SET
    member_user_id = v_user_id,
    status         = 'active',
    accepted_at    = NOW()
  WHERE member_email = v_user_email
    AND status       = 'pending';

  -- Return every active membership (including pre-existing ones)
  RETURN QUERY
    SELECT btm.business_id, btm.owner_user_id
    FROM public.business_team_members btm
    WHERE btm.member_user_id = v_user_id
      AND btm.status = 'active';
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_pending_team_invites() TO authenticated;

-- Note: team_member_self policy (SELECT by member_user_id) already exists in 027.
-- No additional RLS changes needed here.
