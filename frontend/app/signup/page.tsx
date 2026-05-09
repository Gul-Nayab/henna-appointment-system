'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '@/styles/auth.css';
import NavBar from '@/components/Navbar';

type AccountType = 'artist' | 'customer';

export default function SignUpPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    username: '',
    password: '',
    skillLevel: '',
    portfolioLink: '',
    bio: '',
  });

  function updateField(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!form.email && !form.phoneNumber) {
      setError('Please enter either an email or phone number.');
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint =
        accountType === 'artist'
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers`;

      const payload =
        accountType === 'artist'
          ? {
              username: form.username,
              password: form.password,
              name: form.name,
              email: form.email || null,
              phoneNumber: form.phoneNumber || null,
              skillLevel: form.skillLevel,
              portfolioLink: form.portfolioLink || null,
              bio: form.bio || null,
            }
          : {
              username: form.username,
              password: form.password,
              name: form.name,
              email: form.email || null,
              phoneNumber: form.phoneNumber || null,
            };

      await axios.post(endpoint, payload, { timeout: 5000 });

      alert('Account created successfully!');
      router.push('/login');
    } catch (err) {
      console.error(err);
      setError(
        'Could not create account. Username or email may already exist.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className='auth-page'>
      <NavBar />

      <section className='auth-form-section'>
        <form className='auth-form-card' onSubmit={handleSubmit}>
          <div className='account-type-tabs'>
            <button
              type='button'
              className={`account-type-tab ${
                accountType === 'customer' ? 'active' : ''
              }`}
              onClick={() => setAccountType('customer')}
            >
              Customer
            </button>

            <button
              type='button'
              className={`account-type-tab ${
                accountType === 'artist' ? 'active' : ''
              }`}
              onClick={() => setAccountType('artist')}
            >
              Artist
            </button>
          </div>

          <h2 className='auth-form-title'>
            {accountType === 'customer'
              ? 'Create Customer Account'
              : 'Create Artist Account'}
          </h2>

          <p className='auth-form-group-title'>Personal Information</p>

          <div className='auth-form-field'>
            <label htmlFor='name'>Name *</label>
            <input
              id='name'
              name='name'
              type='text'
              placeholder='Full name'
              value={form.name}
              onChange={updateField}
              required
            />
          </div>

          <div className='auth-form-field'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              name='email'
              type='email'
              placeholder='Email address'
              value={form.email}
              onChange={updateField}
            />
          </div>

          <div className='auth-form-field'>
            <label htmlFor='phoneNumber'>Phone Number</label>
            <input
              id='phoneNumber'
              name='phoneNumber'
              type='tel'
              placeholder='Phone number'
              value={form.phoneNumber}
              onChange={updateField}
            />
          </div>

          {accountType === 'artist' && (
            <>
              <p className='auth-form-group-title'>Artist Information</p>

              <div className='auth-form-field'>
                <label htmlFor='skillLevel'>Skill Level *</label>
                <select
                  id='skillLevel'
                  name='skillLevel'
                  value={form.skillLevel}
                  onChange={updateField}
                  required={accountType === 'artist'}
                >
                  <option value=''>Select skill level</option>
                  <option value='Beginner'>Beginner</option>
                  <option value='Intermediate'>Intermediate</option>
                  <option value='Expert'>Expert</option>
                </select>
              </div>

              <div className='auth-form-field'>
                <label htmlFor='portfolioLink'>Portfolio Link</label>
                <input
                  id='portfolioLink'
                  name='portfolioLink'
                  type='url'
                  placeholder='https://your-portfolio.com'
                  value={form.portfolioLink}
                  onChange={updateField}
                />
              </div>

              <div className='auth-form-field'>
                <label htmlFor='bio'>Bio</label>
                <textarea
                  id='bio'
                  name='bio'
                  placeholder='Tell customers about your henna style...'
                  value={form.bio}
                  onChange={updateField}
                />
              </div>
            </>
          )}

          <p className='auth-form-group-title'>Account Security</p>

          <div className='auth-form-field'>
            <label htmlFor='username'>Username *</label>
            <input
              id='username'
              name='username'
              type='text'
              placeholder='Username'
              value={form.username}
              onChange={updateField}
              required
            />
          </div>

          <div className='auth-form-field'>
            <label htmlFor='password'>Password *</label>
            <input
              id='password'
              name='password'
              type='password'
              placeholder='Password'
              value={form.password}
              onChange={updateField}
              required
            />
          </div>

          {error && <p className='auth-error-message'>{error}</p>}

          <button
            type='submit'
            className='auth-primary-button'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className='auth-helper-text'>* indicates required field</p>
        </form>
      </section>
    </main>
  );
}
