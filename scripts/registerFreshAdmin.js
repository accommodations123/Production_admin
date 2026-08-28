import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dmhxnuxlodsshdkunngb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaHhudXhsb2Rzc2hka3VubmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDEwOTEsImV4cCI6MjEwMzExNzA5MX0.3HYB8stLkxNE4j32PVwKL6s8bwulfIJI247MbBE6hqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function registerFreshAdmin() {
  const email = process.argv[2] || 'superadmin@nextkinlife.com';
  const password = process.argv[3] || 'Nextkin@2026';
  const name = 'Nextkin Super Admin';
  const role = 'super_admin';

  console.log(`Registering fresh admin: ${email}`);

  // 1. Sign up
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
    console.log('SignUp Error:', authError);
    return;
  }

  console.log('SignUp Success:', authData.user ? `User ID: ${authData.user.id}` : 'No user');

  // 2. Profile table upsert
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user?.id,
      email,
      name,
      full_name: name,
      role,
      status: 'approved',
      is_approved: true,
      is_verified: true,
    }, { onConflict: 'email' })
    .select();

  if (profileError) {
    console.log('Profile upsert note:', profileError);
  } else {
    console.log('Profile created:', profile);
  }

  // 3. Immediately test signInWithPassword
  console.log('Testing sign in with the new credentials:');
  const signInRes = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInRes.error) {
    console.log('SignIn test result:', signInRes.error.message);
    if (signInRes.error.message.includes('Email not confirmed')) {
      console.log('NOTE: In your Supabase Dashboard -> Authentication -> Providers -> Email, "Confirm email" is currently ENABLED. You can disable "Confirm email" or confirm this user in the Supabase Dashboard Authentication table.');
    }
  } else {
    console.log('🎉 SUCCESS! Signed in successfully. Access token length:', signInRes.data.session?.access_token?.length);
  }
}

registerFreshAdmin();
