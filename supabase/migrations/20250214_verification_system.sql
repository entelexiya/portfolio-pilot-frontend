-- =============================================================================
-- PortfolioPilot: Verification System (Stage 1)
-- Run this in Supabase SQL Editor or via: supabase db push
-- =============================================================================
-- Logic:
-- - Achievement status = last completed verification_request (approved → verified, rejected → rejected).
-- - One achievement → many verification_requests.
-- - Token one-time: after Confirm/Reject, request is approved/rejected, link dead.
-- - Verifier = normal user; role assigned when they first open magic link.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles: add role (student | verifier)
-- -----------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'verifier'));

COMMENT ON COLUMN profiles.role IS 'student = default; verifier = can confirm/reject verification requests (assigned when teacher first opens magic link).';

-- -----------------------------------------------------------------------------
-- 2. achievements: add verification fields, then drop old verified
-- -----------------------------------------------------------------------------
ALTER TABLE achievements
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verifier_comment text,
  ADD COLUMN IF NOT EXISTS verification_link text;

COMMENT ON COLUMN achievements.verification_status IS 'Derived from last completed verification_request: approved → verified, rejected → rejected. pending when there is an open request.';
COMMENT ON COLUMN achievements.verified_by IS 'User id of verifier who approved (from the verification_request that was approved).';
COMMENT ON COLUMN achievements.verifier_comment IS 'Comment from verifier on confirm or reject; displayed as witness statement.';
COMMENT ON COLUMN achievements.verification_link IS 'Proof URL provided by student (e.g. results page, GitHub); teacher checks it, system does not validate.';

-- Migrate existing boolean verified → verification_status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'verified'
  ) THEN
    UPDATE achievements SET verification_status = CASE WHEN verified = true THEN 'verified' ELSE 'unverified' END;
    ALTER TABLE achievements DROP COLUMN verified;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. verification_requests (one-time token, addressed to verifier_email)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verifier_email text NOT NULL,
  verifier_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE verification_requests IS 'One achievement can have many requests. Status of achievement = last completed request (approved/rejected). Token is one-time; after action, link is invalid.';
COMMENT ON COLUMN verification_requests.verifier_email IS 'Email entered by student; letter sent here. Only this person can confirm (after opening link, verifier_id is set).';
COMMENT ON COLUMN verification_requests.verifier_id IS 'Set when teacher opens magic link (account created or existing); links request to verifier account.';
COMMENT ON COLUMN verification_requests.token IS 'Single-use token in /verify/[token]. Invalid after status is approved or rejected.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_requests_token ON verification_requests(token);
CREATE INDEX IF NOT EXISTS idx_verification_requests_achievement_id ON verification_requests(achievement_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status) WHERE status = 'pending';

-- -----------------------------------------------------------------------------
-- 4. Trigger: sync achievement status from last completed verification_request
-- -----------------------------------------------------------------------------
-- When a verification_request is set to approved or rejected, set the
-- achievement's verification_status (and verified_by, verified_at, verifier_comment)
-- from this request. So "achievement status = last completed request" is enforced in DB.
CREATE OR REPLACE FUNCTION public.sync_achievement_verification_from_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    UPDATE achievements a
    SET
      verification_status = CASE WHEN NEW.status = 'approved' THEN 'verified' ELSE 'rejected' END,
      verified_by         = NEW.verifier_id,
      verified_at         = now(),
      verifier_comment    = NEW.verifier_comment
    WHERE a.id = NEW.achievement_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Store verifier_comment on the request when verifier confirms/rejects (app writes it there)
ALTER TABLE verification_requests
  ADD COLUMN IF NOT EXISTS verifier_comment text;

COMMENT ON COLUMN verification_requests.verifier_comment IS 'Comment from verifier on confirm/reject; copied to achievement by trigger.';

DROP TRIGGER IF EXISTS after_verification_request_resolved ON verification_requests;
CREATE TRIGGER after_verification_request_resolved
  AFTER UPDATE OF status ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_achievement_verification_from_request();

-- When a new pending request is created, set achievement to pending
CREATE OR REPLACE FUNCTION public.set_achievement_pending_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    UPDATE achievements SET verification_status = 'pending' WHERE id = NEW.achievement_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_verification_request_insert ON verification_requests;
CREATE TRIGGER on_verification_request_insert
  AFTER INSERT ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_achievement_pending_on_request();
