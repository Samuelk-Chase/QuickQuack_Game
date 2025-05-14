import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();

  console.log('LOGIN ATTEMPT:', { email, normalizedEmail: email.toLowerCase() });

  // Fetch user by email
  const { data: user, error } = await supabase
    .from('User')
    .select('*')
    .ilike('email', normalizedEmail)
    .single();

  console.log('USER FOUND:', user);
  console.log('SUPABASE ERROR:', error);

  if (!user) {
    console.log('No user found for email:', normalizedEmail);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Compare password
  console.log('Comparing password:', password, 'with hash:', user.password);
  const isValid = bcrypt.compareSync(password, user.password);
  console.log('Password valid:', isValid);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Success: return minimal user info (never password)
  return res.status(200).json({ success: true, email: user.email });
} 