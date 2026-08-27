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
    rejection_reason TEXT,
    block_reason TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRATION: Run this if your profiles table already exists:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street_address TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_proof TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS metadata JSONB;

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
    title TEXT,
    origin TEXT,
    destination TEXT,
    travel_date TIMESTAMPTZ,
    departure_time TEXT,
    seats_available INTEGER DEFAULT 1,
    price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'cancelled', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable read & write for authenticated admins and public reads where appropriate
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

-- Allow full access for anon/authenticated roles for all tables
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to event_reviews" ON public.event_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to job_applications" ON public.job_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to buy_sell" ON public.buy_sell FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to stay_requests" ON public.stay_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to travel_trips" ON public.travel_trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to people_reports" ON public.people_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to stay_request_reports" ON public.stay_request_reports FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED INITIAL SUPER ADMIN PROFILE (Link to your current login email)
-- ==============================================================================
INSERT INTO public.profiles (email, name, full_name, role, status, is_approved)
VALUES ('admin@nextkinlife.com', 'Super Admin', 'Super Admin', 'super_admin', 'approved', true)
ON CONFLICT (email) DO UPDATE 
SET role = 'super_admin', status = 'approved', is_approved = true;
