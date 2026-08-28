import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dmhxnuxlodsshdkunngb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaHhudXhsb2Rzc2hka3VubmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDEwOTEsImV4cCI6MjEwMzExNzA5MX0.3HYB8stLkxNE4j32PVwKL6s8bwulfIJI247MbBE6hqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdminAccount() {
  const email = process.argv[2] || 'admin@nextkinlife.com';
  const password = process.argv[3] || 'Admin@123456';
  const name = process.argv[4] || 'Super Admin';
  const role = process.argv[5] || 'super_admin';

  console.log(`Creating admin account for: ${email}`);

  // 1. Sign up user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (authError) {
    console.log('Auth Signup Note:', authError.message);
  } else {
    console.log('Auth User Created/Found ID:', authData?.user?.id || 'pending verification');
  }

  // 2. Upsert profile in public.profiles table
  const profileRecord = {
    email,
    name,
    full_name: name,
    role,
    status: 'approved',
    is_approved: true,
    is_verified: true,
  };

  if (authData?.user?.id) {
    profileRecord.id = authData.user.id;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert(profileRecord, { onConflict: 'email' })
    .select();

  if (profileError) {
    console.log('Profile Table Note:', profileError.message);
  } else {
    console.log('Profile Record Upserted Successfully:', profileData);
  }

  console.log('\n--- Credentials Summary ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${role}`);
}

createAdminAccount();
