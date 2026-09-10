-- ============================================================
-- FIX: Infinite recursion in profiles RLS policies
-- The old admin policy queried profiles FROM profiles,
-- causing infinite recursion. Replace with JWT-based checks.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

-- Also drop old-style policies from any earlier runs
DROP POLICY IF EXISTS "Users can view their own profile"  ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"       ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile"      ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles"         ON profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles"  ON profiles;

-- ============================================================
-- New non-recursive policies
-- Rule: every authenticated user can SELECT their OWN row.
-- No policy queries profiles from inside profiles.
-- ============================================================

-- SELECT: user can always read their own row
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: user can only insert their own row
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: user can update their own row
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Fix the same recursion issue in visitors, visits, departments
-- Those policies used EXISTS(SELECT FROM profiles ...) which is
-- fine as long as profiles policies don't recurse, but let's
-- replace them with a security definer function to be safe.
-- ============================================================

-- Helper function: returns the role of the current user
-- SECURITY DEFINER means it runs as the DB owner, bypassing RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- Rebuild visitors policies using the function
-- ============================================================
DROP POLICY IF EXISTS "visitors_select_auth"  ON visitors;
DROP POLICY IF EXISTS "visitors_insert_staff" ON visitors;
DROP POLICY IF EXISTS "visitors_update_admin" ON visitors;
DROP POLICY IF EXISTS "visitors_delete_admin" ON visitors;

-- Also drop old-style names
DROP POLICY IF EXISTS "Authenticated users can read visitors"    ON visitors;
DROP POLICY IF EXISTS "Reception and security can insert visitors" ON visitors;
DROP POLICY IF EXISTS "Only admins can update visitors"           ON visitors;
DROP POLICY IF EXISTS "Only admins can delete visitors"           ON visitors;
DROP POLICY IF EXISTS "Deny anonymous access to visitors"         ON visitors;

CREATE POLICY "visitors_select_auth"
  ON visitors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "visitors_insert_staff"
  ON visitors FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'reception', 'security'));

CREATE POLICY "visitors_update_admin"
  ON visitors FOR UPDATE
  USING (get_my_role() = 'admin');

CREATE POLICY "visitors_delete_admin"
  ON visitors FOR DELETE
  USING (get_my_role() = 'admin');

-- ============================================================
-- Rebuild visits policies using the function
-- ============================================================
DROP POLICY IF EXISTS "visits_select_auth"  ON visits;
DROP POLICY IF EXISTS "visits_insert_staff" ON visits;
DROP POLICY IF EXISTS "visits_update_staff" ON visits;
DROP POLICY IF EXISTS "visits_delete_admin" ON visits;

-- Also drop old-style names
DROP POLICY IF EXISTS "Authenticated users can read visits"       ON visits;
DROP POLICY IF EXISTS "Reception and security can insert visits"  ON visits;
DROP POLICY IF EXISTS "Authorized users can update visits"        ON visits;
DROP POLICY IF EXISTS "Only admins can delete visits"             ON visits;
DROP POLICY IF EXISTS "Deny anonymous access to visits"           ON visits;

CREATE POLICY "visits_select_auth"
  ON visits FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "visits_insert_staff"
  ON visits FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'reception', 'security'));

CREATE POLICY "visits_update_staff"
  ON visits FOR UPDATE
  USING (get_my_role() IN ('admin', 'reception', 'security'))
  WITH CHECK (get_my_role() IN ('admin', 'reception', 'security'));

CREATE POLICY "visits_delete_admin"
  ON visits FOR DELETE
  USING (get_my_role() = 'admin');

-- ============================================================
-- Rebuild departments policies using the function
-- ============================================================
DROP POLICY IF EXISTS "departments_select_auth"  ON departments;
DROP POLICY IF EXISTS "departments_insert_admin" ON departments;
DROP POLICY IF EXISTS "departments_update_admin" ON departments;
DROP POLICY IF EXISTS "departments_delete_admin" ON departments;

-- Also drop old-style names
DROP POLICY IF EXISTS "Authenticated users can read departments" ON departments;
DROP POLICY IF EXISTS "Only admins can insert departments"       ON departments;
DROP POLICY IF EXISTS "Only admins can update departments"       ON departments;
DROP POLICY IF EXISTS "Only admins can delete departments"       ON departments;
DROP POLICY IF EXISTS "Deny anonymous access to departments"     ON departments;

CREATE POLICY "departments_select_auth"
  ON departments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "departments_insert_admin"
  ON departments FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "departments_update_admin"
  ON departments FOR UPDATE
  USING (get_my_role() = 'admin');

CREATE POLICY "departments_delete_admin"
  ON departments FOR DELETE
  USING (get_my_role() = 'admin');

-- ============================================================
-- Verify: list all active policies
-- ============================================================
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles','visitors','visits','departments')
ORDER BY tablename, policyname;
