import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the user's JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Create a client with the user's JWT to verify their identity
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Use service role client to delete the user
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up user data before deleting auth record
    // Delete user's favorites, bookings (cancel pending ones), messages, etc.
    await adminClient
      .from('favorites')
      .delete()
      .eq('user_id', user.id);

    await adminClient
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('user_id', user.id)
      .in('status', ['pending']);

    // Soft-delete profile (keep for data integrity)
    await adminClient
      .from('profiles')
      .update({ full_name: 'Silinmiş Kullanıcı', avatar_url: null, email: null, phone: null })
      .eq('id', user.id);

    // Deactivate user's listings
    await adminClient
      .from('listings')
      .update({ is_active: false })
      .eq('host_id', user.id);

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete account: ' + deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
