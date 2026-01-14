import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const testUsers = [
      {
        email: '1234567890123@casetrack.saps.gov.za',
        password: 'victim123',
        role: 'victim',
        full_name: 'Test Victim',
        id_number: '1234567890123',
        phone: '0821234567',
      },
      {
        email: '9876543210987@casetrack.saps.gov.za',
        password: 'police123',
        role: 'police',
        full_name: 'Test Police Officer',
        id_number: '9876543210987',
        phone: '0829876543',
      },
      {
        email: '1111222233334@casetrack.saps.gov.za',
        password: 'admin1234',
        role: 'admin',
        full_name: 'Test Administrator',
        id_number: '1111222233334',
        phone: '0821112222',
      },
    ]

    const results = []

    for (const user of testUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const exists = existingUser?.users?.find(u => u.email === user.email)
      
      if (exists) {
        results.push({ 
          role: user.role, 
          status: 'already exists',
          id_number: user.id_number,
          password: user.password 
        })
        continue
      }

      // Create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          id_number: user.id_number,
          phone: user.phone,
          role: user.role,
        },
      })

      if (error) {
        results.push({ role: user.role, status: 'error', error: error.message })
      } else {
        results.push({ 
          role: user.role, 
          status: 'created',
          id_number: user.id_number,
          password: user.password 
        })
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      testCredentials: {
        victim: { id: '1234567890123', password: 'victim123' },
        police: { id: '9876543210987', password: 'police123' },
        admin: { id: '1111222233334', password: 'admin1234' },
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
