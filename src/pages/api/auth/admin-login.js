import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, type } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (type !== 'admin') {
    return res.status(400).json({ error: 'Invalid login type' });
  }

  // Initialize Supabase client with anon key for auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  try {
    // Use Supabase built-in authentication
    // Treat username as email (Supabase Auth uses email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password
    });

    if (error || !data.user) {
      return res.status(401).json({ error: 'Невалиден имейл адрес или парола' });
    }

    // Check if user has admin role in user_metadata or app_metadata
    const userRole = data.user.app_metadata?.role || data.user.user_metadata?.role;
    
    // If you want to restrict to admin users only, uncomment this:
    // if (userRole !== 'admin' && userRole !== 'administrator') {
    //   return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    // }

    // Return success response with session tokens
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        expires_at: data.session?.expires_at,
        token_type: 'Bearer'
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userRole || 'user'
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Възникна грешка при влизане. Моля, опитайте отново.' });
  }
}
