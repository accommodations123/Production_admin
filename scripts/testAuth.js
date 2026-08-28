import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dmhxnuxlodsshdkunngb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaHhudXhsb2Rzc2hka3VubmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDEwOTEsImV4cCI6MjEwMzExNzA5MX0.3HYB8stLkxNE4j32PVwKL6s8bwulfIJI247MbBE6hqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('Testing signInWithPassword for admin@nextkinlife.com with Admin@123456');
  const res = await supabase.auth.signInWithPassword({
    email: 'admin@nextkinlife.com',
    password: 'Admin@123456',
  });

  console.log('Sign in result:', res.error ? res.error.message : 'SUCCESS! Session Token received: ' + res.data.session?.access_token?.slice(0, 20) + '...');

  // Also test signing up a fresh account or checking profiles
  const profilesRes = await supabase.from('profiles').select('*').limit(5);
  console.log('Profiles in DB:', profilesRes.data);
}

testAuth();
