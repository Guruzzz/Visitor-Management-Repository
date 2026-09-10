-- ============================================================
-- VISITOR MANAGEMENT SYSTEM - COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ------------------------------------------------------------
-- ENUMS
-- (drop first in case of partial previous runs)
-- ------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'reception', 'security');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('checked_in', 'checked_out');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ------------------------------------------------------------
-- TABLE: profiles
-- Must be created before any table that references user roles.
-- id is a foreign key to auth.users so Supabase Auth owns it.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   VARCHAR(255)                    NOT NULL,
  email       VARCHAR(255) UNIQUE             NOT NULL,
  phone       VARCHAR(20)                     NOT NULL DEFAULT '',
  role        user_role                       NOT NULL DEFAULT 'reception',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()       NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);


-- ------------------------------------------------------------
-- TABLE: departments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE             NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);


-- ------------------------------------------------------------
-- TABLE: visitors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_number   VARCHAR(50) UNIQUE          NOT NULL,
  full_name        VARCHAR(255)                NOT NULL,
  phone            VARCHAR(20)                 NOT NULL,
  national_id      VARCHAR(50)                 NOT NULL,
  company          VARCHAR(255)                NOT NULL,
  photo_url        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()   NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW()   NOT NULL
);


-- ------------------------------------------------------------
-- TABLE: visits
-- visitor_id references visitors.id
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visits (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id           UUID                        NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  visit_reference      VARCHAR(100) UNIQUE         NOT NULL,
  person_being_visited VARCHAR(255)                NOT NULL,
  department           VARCHAR(100)                NOT NULL,
  purpose              TEXT                        NOT NULL,
  check_in_at          TIMESTAMPTZ DEFAULT NOW()   NOT NULL,
  check_out_at         TIMESTAMPTZ,
  duration             INTEGER,                    -- minutes, calculated on checkout
  status               visit_status DEFAULT 'checked_in' NOT NULL,
  qr_code_identifier   VARCHAR(255) UNIQUE         NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW()   NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT NOW()   NOT NULL
);


-- ------------------------------------------------------------
-- INDEXES (for fast searches used by the app)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_visitors_phone        ON visitors(phone);
CREATE INDEX IF NOT EXISTS idx_visitors_national_id  ON visitors(national_id);
CREATE INDEX IF NOT EXISTS idx_visitors_company      ON visitors(company);
CREATE INDEX IF NOT EXISTS idx_visitors_full_name    ON visitors(full_name);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id     ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_status         ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_check_in_at    ON visits(check_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role         ON profiles(role);


-- ------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits      ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- RLS POLICIES: profiles
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

-- Any authenticated user can read their own row
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all rows
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can insert their own profile (needed on first sign-up)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (e.g. change role)
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ------------------------------------------------------------
-- RLS POLICIES: departments
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "departments_select_auth"  ON departments;
DROP POLICY IF EXISTS "departments_insert_admin" ON departments;
DROP POLICY IF EXISTS "departments_update_admin" ON departments;
DROP POLICY IF EXISTS "departments_delete_admin" ON departments;

CREATE POLICY "departments_select_auth"
  ON departments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "departments_insert_admin"
  ON departments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "departments_update_admin"
  ON departments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "departments_delete_admin"
  ON departments FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ------------------------------------------------------------
-- RLS POLICIES: visitors
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "visitors_select_auth"         ON visitors;
DROP POLICY IF EXISTS "visitors_insert_staff"        ON visitors;
DROP POLICY IF EXISTS "visitors_update_admin"        ON visitors;
DROP POLICY IF EXISTS "visitors_delete_admin"        ON visitors;

CREATE POLICY "visitors_select_auth"
  ON visitors FOR SELECT
  USING (auth.role() = 'authenticated');

-- reception, security, and admin can register visitors
CREATE POLICY "visitors_insert_staff"
  ON visitors FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','reception','security'))
  );

CREATE POLICY "visitors_update_admin"
  ON visitors FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "visitors_delete_admin"
  ON visitors FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ------------------------------------------------------------
-- RLS POLICIES: visits
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "visits_select_auth"   ON visits;
DROP POLICY IF EXISTS "visits_insert_staff"  ON visits;
DROP POLICY IF EXISTS "visits_update_staff"  ON visits;
DROP POLICY IF EXISTS "visits_delete_admin"  ON visits;

CREATE POLICY "visits_select_auth"
  ON visits FOR SELECT
  USING (auth.role() = 'authenticated');

-- reception, security, admin can check visitors in
CREATE POLICY "visits_insert_staff"
  ON visits FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','reception','security'))
  );

-- reception, security, admin can check visitors out (UPDATE)
CREATE POLICY "visits_update_staff"
  ON visits FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','reception','security'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','reception','security'))
  );

CREATE POLICY "visits_delete_admin"
  ON visits FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ------------------------------------------------------------
-- GRANTS
-- ------------------------------------------------------------
GRANT ALL ON profiles    TO authenticated;
GRANT ALL ON departments TO authenticated;
GRANT ALL ON visitors    TO authenticated;
GRANT ALL ON visits      TO authenticated;


-- ------------------------------------------------------------
-- VIEW: active_visits  (used by Dashboard real-time query)
-- Matches exactly the columns selected in visitors.ts:
--   .select('*, visitors(*)')  on visits table
-- The view is informational; the app queries visits directly.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW active_visits AS
SELECT
  v.id,
  v.visit_reference,
  v.qr_code_identifier,
  v.visitor_id,
  vi.full_name        AS visitor_name,
  vi.visitor_number,
  vi.company,
  vi.phone,
  vi.national_id,
  vi.photo_url,
  v.person_being_visited,
  v.department,
  v.purpose,
  v.check_in_at,
  v.check_out_at,
  v.duration,
  v.status,
  EXTRACT(EPOCH FROM (NOW() - v.check_in_at))::INTEGER / 60 AS duration_minutes,
  v.created_at,
  v.updated_at
FROM visits v
JOIN visitors vi ON v.visitor_id = vi.id
WHERE v.status = 'checked_in'
ORDER BY v.check_in_at DESC;

GRANT SELECT ON active_visits TO authenticated;


-- ------------------------------------------------------------
-- SEED: default departments
-- ------------------------------------------------------------
INSERT INTO departments (name, description) VALUES
  ('Sales',           'Sales Department'),
  ('Engineering',     'Engineering and Development'),
  ('Marketing',       'Marketing Department'),
  ('Human Resources', 'HR Department'),
  ('Operations',      'Operations Department'),
  ('Finance',         'Finance Department'),
  ('IT',              'Information Technology'),
  ('Security',        'Security Department')
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- DONE.
-- Next: create users in Auth → Users, then run the
-- profile INSERT below for each one.
-- ============================================================
