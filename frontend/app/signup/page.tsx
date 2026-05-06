'use client';

import Link from 'next/link';
import { useState } from 'react';
import '@/styles/auth.css';
import NavBar from '@/components/Navbar';

type AccountType = 'artist' | 'customer';

export default function SignUpPage() {
  const [accountType, setAccountType] = useState<AccountType>('customer');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phoneNumber: formData.get('phoneNumber'),
      username: formData.get('username'),
      password: formData.get('password'),
      accountType,
    };

    console.log(payload);
  }

  return (
    <main className='auth-page'>
      <NavBar />

      <section className='auth-form-section'>
        <form className='auth-form-card' onSubmit={handleSubmit}>
          <div className='auth-form-field'>
            <label htmlFor='name'>Name</label>
            <input
              id='name'
              name='name'
              type='text'
              placeholder='Value'
              required
            />
          </div>

          <div className='auth-form-field'>
            <label htmlFor='email'>Email</label>
            <input id='email' name='email' type='email' placeholder='Value' />
          </div>

          <div className='auth-form-field'>
            <label htmlFor='phoneNumber'>Phone Number</label>
            <input
              id='phoneNumber'
              name='phoneNumber'
              type='tel'
              placeholder='Value'
            />
          </div>

          <div className='auth-form-field'>
            <label htmlFor='username'>Username</label>
            <input
              id='username'
              name='username'
              type='text'
              placeholder='Value'
              required
            />
          </div>

          <div className='auth-form-field'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              name='password'
              type='password'
              placeholder='Value'
              required
            />
          </div>

          <fieldset className='account-type-options'>
            <legend className='account-type-title'>Account Type</legend>

            <label className='radio-option'>
              <input
                type='radio'
                name='accountType'
                value='artist'
                checked={accountType === 'artist'}
                onChange={() => setAccountType('artist')}
              />
              <span>Artist</span>
            </label>

            <label className='radio-option'>
              <input
                type='radio'
                name='accountType'
                value='customer'
                checked={accountType === 'customer'}
                onChange={() => setAccountType('customer')}
              />
              <span>Customer</span>
            </label>
          </fieldset>

          <button type='submit' className='auth-primary-button'>
            Register
          </button>
        </form>
      </section>
    </main>
  );
}
