import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dmhxnuxlodsshdkunngb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaHhudXhsb2Rzc2hka3VubmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDEwOTEsImV4cCI6MjEwMzExNzA5MX0.3HYB8stLkxNE4j32PVwKL6s8bwulfIJI247MbBE6hqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testQueries() {
  const [profiles, properties, events, buySell, travel, jobs, jobApps] = await Promise.all([
    supabase.from('profiles').select('id, role, status, is_approved, country, city, created_at'),
    supabase.from('properties').select('id, status, is_approved, country, city, created_at'),
    supabase.from('events').select('id, status, is_approved, country, city, created_at'),
    supabase.from('buy_sell').select('id, status, is_approved, country, city, created_at'),
    supabase.from('travel_trips').select('id, status, origin, destination, created_at'),
    supabase.from('jobs').select('id, status, created_at'),
    supabase.from('job_applications').select('id, status, created_at'),
  ]);

  console.log('Profiles count:', profiles.data?.length, 'error:', profiles.error?.message);
  console.log('Properties count:', properties.data?.length, 'error:', properties.error?.message);
  console.log('Events count:', events.data?.length, 'error:', events.error?.message);
  console.log('BuySell count:', buySell.data?.length, 'error:', buySell.error?.message);
  console.log('Travel count:', travel.data?.length, 'error:', travel.error?.message);
  console.log('Jobs count:', jobs.data?.length, 'error:', jobs.error?.message);
  console.log('Job Applications count:', jobApps.data?.length, 'error:', jobApps.error?.message);
}

testQueries();
