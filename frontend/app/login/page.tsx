'use client';

import Link from 'next/link';
import { useState } from 'react';
import '@/styles/auth.css';
import NavBar from '@/components/Navbar';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({ username, password });
  }

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
