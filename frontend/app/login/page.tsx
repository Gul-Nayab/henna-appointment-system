'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/Navbar';
import '@/styles/auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      username: username,
      password: password,
      redirect: false,
    });
    console.log('signIn result:', res);
    if (res?.error) {
      alert('Invalid credentials');
      console.error(res.error);
      return;
    }
    router.push(`/${username}/account`);
  };

  return (
    <main className='auth-page'>
      <NavBar />

      <section className='auth-form-section'>
        <form onSubmit={handleSubmit} className='auth-form-card'>
          <div className='auth-form-field'>
            <label htmlFor='text'>Username</label>
            <input
              type='text'
              placeholder='username...'
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='auth-form-field'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              placeholder='password...'
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type='submit' className='auth-primary-button'>
            Sign in
          </button>

          <Link href='/forgot-password' className='auth-text-link'>
            Forgot password?
          </Link>
        </form>
      </section>
    </main>
  );
}
