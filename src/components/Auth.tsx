import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Compare password
  const comparePassword = (password: string, hash: string) => bcrypt.compareSync(password, hash);

  // Signup (uses API route)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');
      setMessage(result.message);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login (still client-side)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Call the new login API route
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');

      setMessage('Login successful!');
      localStorage.setItem('session', JSON.stringify({ email: result.email })); // Store session
      router.push('/game'); // Redirect to /game page
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-4 sm:p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black mb-2">
            QuickQuack Game
          </h2>
          <p className="text-black mb-8">Join the adventure!</p>
        </div>
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Name
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          {message && (
            <div className="p-3 sm:p-4 rounded-lg text-sm text-center bg-blue-100 text-black">
              {message}
            </div>
          )}
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-black">
            By signing in, you agree to our{' '}
            <a href="#" className="font-medium text-black hover:text-gray-800">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-black hover:text-gray-800">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth; 