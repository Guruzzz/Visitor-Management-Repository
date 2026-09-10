-- ============================================================
-- CREATE PROFILES FOR EXISTING AUTH USERS
-- Run this in Supabase SQL Editor
-- ============================================================

-- STEP 1: See all your current auth users and their profile status
SELECT
  u.id,
  u.email,
  u.created_at,
  p.role,
  p.full_name,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END AS status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at;

-- ============================================================
-- STEP 2: Insert profiles for users that have none.
-- First user created becomes admin, the rest become reception.
-- Cast to user_role enum is required.
-- ============================================================

INSERT INTO profiles (id, full_name, email, phone, role)
SELECT
  u.id,
  SPLIT_PART(u.email, '@', 1) AS full_name,
  u.email,
  '',
  CASE
    WHEN u.created_at = (SELECT MIN(created_at) FROM auth.users)
      THEN 'admin'::user_role
    ELSE 'reception'::user_role
  END AS role
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: Fix roles — replace emails with your actual ones
-- ============================================================

-- UPDATE profiles SET role = 'admin'::user_role     WHERE email = 'your-admin@example.com';
-- UPDATE profiles SET role = 'reception'::user_role WHERE email = 'your-reception@example.com';
-- UPDATE profiles SET role = 'security'::user_role  WHERE email = 'your-security@example.com';

-- ============================================================
-- STEP 4: Set real full names — replace as needed
-- ============================================================

-- UPDATE profiles SET full_name = 'Tendai Moyo'    WHERE email = 'admin@yourorg.com';
-- UPDATE profiles SET full_name = 'Rudo Chikwanda' WHERE email = 'reception@yourorg.com';

-- ============================================================
-- STEP 5: Verify
-- ============================================================

SELECT id, full_name, email, role, created_at
FROM profiles
ORDER BY created_at;
