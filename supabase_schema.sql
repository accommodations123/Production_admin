-- ==============================================================================
-- NEXTKINLIFE ADMIN DASHBOARD SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Admins, Hosts, Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT,
    full_name TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    role TEXT DEFAULT 'user', -- 'super_admin', 'admin', 'recruiter', 'host', 'user'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'blocked'
    is_approved BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    phone TEXT,
    whatsapp TEXT,
    street_address TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    occupation TEXT,
    headline TEXT,
    profession TEXT,
    bio TEXT,
    about TEXT,
    website TEXT,
    facebook TEXT,
    instagram TEXT,
    linkedin TEXT,
    id_proof TEXT,
    document_url TEXT,
    metadata JSONB,
    hourly_rate NUMERIC,
    consultation_rate NUMERIC,
    currency TEXT DEFAULT '₹',
    education TEXT,
    degree TEXT,
    institution TEXT,
    university TEXT,
    graduation_year TEXT,
    years_of_experience NUMERIC,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    rejection_reason TEXT,
    block_reason TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRATIONS for PROFILES:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consultation_rate NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT '₹';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 1b. PROFILE REVIEWS TABLE (Reviews for People / Professional Directory)
CREATE TABLE IF NOT EXISTS public.profile_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID,
    reviewer_name TEXT,
    reviewer_avatar TEXT,
    rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_reviews_profile_id ON public.profile_reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_reviews_status ON public.profile_reviews(status);

-- 2. PROPERTIES TABLE (Accommodations)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID,
    host_name TEXT,
    "hostName" TEXT,
    user_name TEXT,
    phone TEXT,
    email TEXT,
    title TEXT,
    description TEXT,
    category_id TEXT DEFAULT 'apartment',
    property_type TEXT DEFAULT 'Apartment',
    privacy_type TEXT,
    guests INTEGER DEFAULT 1,
    guest_capacity INTEGER DEFAULT 1,
    bedrooms INTEGER DEFAULT 1,
    bathrooms NUMERIC DEFAULT 1,
    pets_allowed BOOLEAN DEFAULT false,
    area TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    zip_code TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    video TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '[]'::jsonb,
    legal_docs JSONB DEFAULT '[]'::jsonb,
    price_per_night NUMERIC DEFAULT 0,
    price_per_month NUMERIC DEFAULT 0,
    price_per_hour NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    is_approved BOOLEAN DEFAULT false,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    organizer_name TEXT,
    organizer_email TEXT,
    category TEXT,
    location TEXT,
    city TEXT,
    country TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    time TEXT,
    price NUMERIC DEFAULT 0,
    capacity INTEGER DEFAULT 0,
    banner_image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    is_approved BOOLEAN DEFAULT false,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EVENT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.event_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id TEXT,
    user_name TEXT,
    rating NUMERIC DEFAULT 5,
    comment TEXT,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. JOBS TABLE (Careers)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    job_type TEXT DEFAULT 'Full-time',
    workplace_type TEXT DEFAULT 'Remote',
    experience_level TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active', -- 'Active', 'Draft', 'Closed', 'Paused'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_name TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    cover_letter TEXT,
    experience_years NUMERIC,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Reviewing', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'
    notes TEXT,
    source TEXT DEFAULT 'Direct',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BUY & SELL LISTINGS
CREATE TABLE IF NOT EXISTS public.buy_sell (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    name TEXT,
    seller_name TEXT,
    email TEXT,
    seller_email TEXT,
    phone TEXT,
    seller_phone TEXT,
    whatsapp TEXT,
    seller_whatsapp TEXT,
    seller_instagram TEXT,
    seller_facebook TEXT,
    title TEXT,
    description TEXT,
    price NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    category TEXT,
    subcategory TEXT,
    condition TEXT DEFAULT 'Used',
    city TEXT,
    country TEXT,
    zip_code TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STAY REQUESTS (Post Stay)
CREATE TABLE IF NOT EXISTS public.stay_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    user_name TEXT,
    userName TEXT,
    title TEXT,
    description TEXT,
    stay_description TEXT,
    city TEXT,
    country TEXT,
    destination_city TEXT,
    destination_country TEXT,
    stay_type TEXT,
    accommodation_type TEXT,
    room_type TEXT,
    budget NUMERIC,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    guests INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    is_approved BOOLEAN DEFAULT false,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TRAVEL TRIPS
CREATE TABLE IF NOT EXISTS public.travel_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id TEXT,
    host_name TEXT,
    host_email TEXT,
    host_phone TEXT,
    title TEXT,
    origin TEXT,
    destination TEXT,
    from_city TEXT,
    from_country TEXT,
    to_city TEXT,
    to_country TEXT,
    airline TEXT,
    flight_number TEXT,
    travel_date TIMESTAMPTZ,
    departure_time TEXT,
    arrival_date TIMESTAMPTZ,
    arrival_time TEXT,
    seats_available INTEGER DEFAULT 1,
    price NUMERIC DEFAULT 0,
    currency TEXT DEFAULT '$',
    notes TEXT,
    description TEXT,
    is_approved BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'cancelled', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist in case table was created earlier
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS host_email TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS host_phone TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS from_city TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS from_country TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS to_city TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS to_country TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS airline TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS flight_number TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS arrival_date TIMESTAMPTZ;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS arrival_time TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT '$';
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 10. MODERATION REPORTS
CREATE TABLE IF NOT EXISTS public.people_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id TEXT,
    target_id TEXT,
    reason TEXT,
    resolved BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stay_request_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id TEXT,
    target_id TEXT,
    reason TEXT,
    resolved BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- POSTGRESQL SECURITY HELPER FUNCTIONS (SECURITY DEFINER)
-- ==============================================================================

-- 1. Helper to determine if the active session is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_blocked BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role, is_blocked INTO v_role, v_blocked
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN (v_role IN ('super_admin', 'admin') AND (v_blocked IS NOT TRUE));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Helper to determine if the active session is a Recruiter or Admin
CREATE OR REPLACE FUNCTION public.is_recruiter()
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_blocked BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role, is_blocked INTO v_role, v_blocked
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN (v_role IN ('super_admin', 'admin', 'recruiter') AND (v_blocked IS NOT TRUE));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- ADMIN MODERATION RPC FUNCTIONS (MANDATORY ADMIN-ONLY EXECUTION)
-- ==============================================================================

-- Approve Host Application
CREATE OR REPLACE FUNCTION public.admin_approve_host(host_id UUID)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.profiles
    SET status = 'approved',
        is_approved = true,
        is_verified = true,
        role = 'host',
        updated_at = NOW()
    WHERE id = host_id;

    RETURN jsonb_build_object('success', true, 'message', 'Host approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reject Host Application
CREATE OR REPLACE FUNCTION public.admin_reject_host(host_id UUID, reason TEXT DEFAULT 'KYC details do not meet guidelines')
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.profiles
    SET status = 'rejected',
        is_approved = false,
        rejection_reason = reason,
        updated_at = NOW()
    WHERE id = host_id;

    RETURN jsonb_build_object('success', true, 'message', 'Host rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Block Profile
CREATE OR REPLACE FUNCTION public.admin_block_profile(target_id UUID, reason TEXT DEFAULT 'Blocked by administrator')
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.profiles
    SET status = 'blocked',
        is_blocked = true,
        block_reason = reason,
        updated_at = NOW()
    WHERE id = target_id;

    RETURN jsonb_build_object('success', true, 'message', 'Profile blocked successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Approve Property
CREATE OR REPLACE FUNCTION public.admin_approve_property(prop_id UUID)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.properties
    SET status = 'approved',
        is_approved = true,
        updated_at = NOW()
    WHERE id = prop_id;

    RETURN jsonb_build_object('success', true, 'message', 'Property approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reject Property
CREATE OR REPLACE FUNCTION public.admin_reject_property(prop_id UUID, reason TEXT DEFAULT 'Listing details incomplete or non-compliant')
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.properties
    SET status = 'rejected',
        is_approved = false,
        rejection_reason = reason,
        updated_at = NOW()
    WHERE id = prop_id;

    RETURN jsonb_build_object('success', true, 'message', 'Property rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Approve Event
CREATE OR REPLACE FUNCTION public.admin_approve_event(event_id UUID)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.events
    SET status = 'approved',
        is_approved = true,
        updated_at = NOW()
    WHERE id = event_id;

    RETURN jsonb_build_object('success', true, 'message', 'Event approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reject Event
CREATE OR REPLACE FUNCTION public.admin_reject_event(event_id UUID, reason TEXT DEFAULT 'Event rejected by administrator')
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.events
    SET status = 'rejected',
        is_approved = false,
        rejection_reason = reason,
        updated_at = NOW()
    WHERE id = event_id;

    RETURN jsonb_build_object('success', true, 'message', 'Event rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Approve Buy & Sell Listing
CREATE OR REPLACE FUNCTION public.admin_approve_buysell(item_id UUID)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.buy_sell
    SET status = 'approved',
        updated_at = NOW()
    WHERE id = item_id;

    RETURN jsonb_build_object('success', true, 'message', 'Listing approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reject Buy & Sell Listing
CREATE OR REPLACE FUNCTION public.admin_reject_buysell(item_id UUID, reason TEXT DEFAULT 'Listing non-compliant')
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.buy_sell
    SET status = 'rejected',
        rejection_reason = reason,
        updated_at = NOW()
    WHERE id = item_id;

    RETURN jsonb_build_object('success', true, 'message', 'Listing rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Approve Stay Request
CREATE OR REPLACE FUNCTION public.admin_approve_stay_request(request_id UUID)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.stay_requests
    SET status = 'approved',
        is_approved = true,
        updated_at = NOW()
    WHERE id = request_id;

    RETURN jsonb_build_object('success', true, 'message', 'Stay request approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reject Stay Request
CREATE OR REPLACE FUNCTION public.admin_reject_stay_request(request_id UUID, reason TEXT DEFAULT 'Request does not meet quality guidelines')
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Administrator privileges required.';
    END IF;

    UPDATE public.stay_requests
    SET status = 'rejected',
        is_approved = false,
        rejection_reason = reason,
        updated_at = NOW()
    WHERE id = request_id;

    RETURN jsonb_build_object('success', true, 'message', 'Stay request rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — HARDENED PRODUCTION SECURITY
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buy_sell ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_request_reports ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;

CREATE POLICY "Public read active profiles" ON public.profiles
    FOR SELECT USING (is_blocked IS NOT TRUE OR auth.uid() = id OR public.is_admin());

CREATE POLICY "User insert own initial profile" ON public.profiles
    FOR INSERT WITH CHECK (
        (auth.uid() = id OR auth.uid() IS NULL)
        AND (role = 'user' OR role IS NULL)
        AND (status = 'pending' OR status IS NULL)
        AND (is_approved IS NOT TRUE)
        AND (is_verified IS NOT TRUE)
        AND (is_blocked IS NOT TRUE)
    );

CREATE POLICY "User update own profile non-moderation fields" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin() OR (
            auth.uid() = id
            AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
            AND is_approved = (SELECT is_approved FROM public.profiles WHERE id = auth.uid())
            AND is_verified = (SELECT is_verified FROM public.profiles WHERE id = auth.uid())
            AND is_blocked = (SELECT is_blocked FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Admin full manage profiles" ON public.profiles
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. PROPERTIES POLICIES
DROP POLICY IF EXISTS "Allow all access to properties" ON public.properties;

CREATE POLICY "Public read approved properties" ON public.properties
    FOR SELECT USING (
        (status = 'approved' AND is_approved = true)
        OR (auth.uid() = host_id)
        OR public.is_admin()
    );

CREATE POLICY "Host insert pending property" ON public.properties
    FOR INSERT WITH CHECK (
        (auth.uid() = host_id OR public.is_admin())
        AND (status IN ('draft', 'pending'))
        AND (is_approved IS NOT TRUE OR public.is_admin())
    );

CREATE POLICY "Host update own property" ON public.properties
    FOR UPDATE USING (auth.uid() = host_id OR public.is_admin())
    WITH CHECK (
        public.is_admin() OR (
            auth.uid() = host_id
            AND (status IN ('draft', 'pending'))
            AND is_approved = (SELECT is_approved FROM public.properties WHERE id = properties.id)
        )
    );

CREATE POLICY "Admin manage properties" ON public.properties
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. EVENTS POLICIES
DROP POLICY IF EXISTS "Allow all access to events" ON public.events;

CREATE POLICY "Public read approved events" ON public.events
    FOR SELECT USING (
        (status = 'approved' AND is_approved = true)
        OR public.is_admin()
    );

CREATE POLICY "User insert pending event" ON public.events
    FOR INSERT WITH CHECK (
        status IN ('draft', 'pending')
        AND (is_approved IS NOT TRUE OR public.is_admin())
    );

CREATE POLICY "Admin manage events" ON public.events
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. BUY & SELL POLICIES
DROP POLICY IF EXISTS "Allow all access to buy_sell" ON public.buy_sell;

CREATE POLICY "Public read approved marketplace" ON public.buy_sell
    FOR SELECT USING (
        status IN ('approved', 'active', 'sold')
        OR (user_id = auth.uid()::text)
        OR public.is_admin()
    );

CREATE POLICY "User insert pending listing" ON public.buy_sell
    FOR INSERT WITH CHECK (
        status IN ('draft', 'pending')
        OR public.is_admin()
    );

CREATE POLICY "Admin manage marketplace" ON public.buy_sell
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. TRAVEL TRIPS POLICIES
DROP POLICY IF EXISTS "Allow all access to travel_trips" ON public.travel_trips;

CREATE POLICY "Public read approved travel trips" ON public.travel_trips
    FOR SELECT USING (
        status IN ('approved', 'completed')
        OR (host_id = auth.uid()::text)
        OR public.is_admin()
    );

CREATE POLICY "User insert pending travel trip" ON public.travel_trips
    FOR INSERT WITH CHECK (
        status IN ('pending', 'draft')
        OR public.is_admin()
    );

CREATE POLICY "Admin manage travel trips" ON public.travel_trips
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. STAY REQUESTS POLICIES
DROP POLICY IF EXISTS "Allow all access to stay_requests" ON public.stay_requests;

CREATE POLICY "Public read approved stay requests" ON public.stay_requests
    FOR SELECT USING (
        (status = 'approved' AND is_approved = true)
        OR (user_id = auth.uid()::text)
        OR public.is_admin()
    );

CREATE POLICY "User insert pending stay request" ON public.stay_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
        AND (is_approved IS NOT TRUE OR public.is_admin())
    );

CREATE POLICY "Admin manage stay requests" ON public.stay_requests
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. JOBS & APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Allow all access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow all access to job_applications" ON public.job_applications;

CREATE POLICY "Public read active jobs" ON public.jobs
    FOR SELECT USING (status = 'Active' OR public.is_recruiter());

CREATE POLICY "Recruiter manage jobs" ON public.jobs
    FOR ALL USING (public.is_recruiter()) WITH CHECK (public.is_recruiter());

CREATE POLICY "Candidate apply job" ON public.job_applications
    FOR INSERT WITH CHECK (status = 'Pending');

CREATE POLICY "Recruiter manage job applications" ON public.job_applications
    FOR ALL USING (public.is_recruiter()) WITH CHECK (public.is_recruiter());

-- 8. MODERATION REPORTS POLICIES
DROP POLICY IF EXISTS "Allow all access to people_reports" ON public.people_reports;
DROP POLICY IF EXISTS "Allow all access to stay_request_reports" ON public.stay_request_reports;

CREATE POLICY "User insert people report" ON public.people_reports
    FOR INSERT WITH CHECK (resolved IS NOT TRUE AND status = 'pending');

CREATE POLICY "Admin manage people reports" ON public.people_reports
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "User insert stay request report" ON public.stay_request_reports
    FOR INSERT WITH CHECK (resolved IS NOT TRUE AND status = 'pending');

CREATE POLICY "Admin manage stay request reports" ON public.stay_request_reports
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==============================================================================
-- SEED INITIAL SUPER ADMIN PROFILE (Link to your current login email)
-- ==============================================================================
INSERT INTO public.profiles (email, name, full_name, role, status, is_approved, is_verified)
VALUES ('admin@nextkinlife.com', 'Super Admin', 'Super Admin', 'super_admin', 'approved', true, true)
ON CONFLICT (email) DO UPDATE 
SET role = 'super_admin', status = 'approved', is_approved = true, is_verified = true;

