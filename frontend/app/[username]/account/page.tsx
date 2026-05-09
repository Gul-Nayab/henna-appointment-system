'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '@/styles/account.css';

function Account() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isArtist = session?.user.role === 'ARTIST';
  const username = session?.user.username;
  const userId = session?.user.id;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [artistProfile, setArtistProfile] = useState<{
    skillLevel: string;
    portfolioLink: string | null;
    bio: string | null;
  } | null>(null);

  const [form, setForm] = useState({
    name: session?.user.name ?? '',
    email: session?.user.email ?? '',
    phoneNumber: '',
    bio: '',
    portfolioLink: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    async function loadArtistProfile() {
      if (!session?.user?.id || session.user.role !== 'ARTIST') return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists/${session.user.id}`,
          { timeout: 5000 },
        );

        setArtistProfile(response.data);

        setForm((prev) => ({
          ...prev,
          bio: response.data.bio ?? '',
          portfolioLink: response.data.portfolioLink ?? '',
        }));
      } catch (err) {
        console.error(err);
      }
    }

    loadArtistProfile();
  }, [session?.user?.id, session?.user?.role]);
  function updateField(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/account`,
        {
          name: form.name,
          email: form.email || null,
          phoneNumber: form.phoneNumber || null,
          bio: isArtist ? form.bio : null,
          portfolioLink: isArtist ? form.portfolioLink : null,
        },
        { timeout: 5000 },
      );

      setEditOpen(false);
      alert('Account updated. Please refresh to see changes.');
    } catch (err) {
      console.error(err);
      setFormError('Could not update account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteAccount() {
    if (!userId) return;

    if (deleteConfirmText !== 'DELETE') {
      setFormError('Type DELETE to confirm account deletion.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/account`,
        { timeout: 5000 },
      );

      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error(err);
      setFormError('Could not delete account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <>
        <NavBar />
        <main className='account-page'>
          <p className='account-message'>Loading account...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <main className='account-page'>
        <section className='account-hero'>
          <p className='account-kicker'>
            {isArtist ? 'Artist Dashboard' : 'Customer Dashboard'}
          </p>
          <h1>Welcome back, {username}</h1>
          <p>
            {isArtist
              ? 'Manage your availability, appointments, and artist profile.'
              : 'Book appointments, view your schedule, and manage your account.'}
          </p>
        </section>
        {isArtist && artistProfile ? (
          <section className='account-settings-card'>
            <h2>Artist Profile</h2>

            <p>
              <strong>Name:</strong> {session?.user.name}
            </p>

            <p>
              <strong>Username:</strong>
              {session?.user.username}
            </p>

            <p>
              <strong>Email:</strong> {session?.user.email}
            </p>
            <p>
              <strong>Skill Level:</strong> {artistProfile.skillLevel}
            </p>

            <p>
              <strong>Portfolio:</strong>{' '}
              {artistProfile.portfolioLink ? (
                <a href={artistProfile.portfolioLink} target='_blank'>
                  {artistProfile.portfolioLink}
                </a>
              ) : (
                'No portfolio link added.'
              )}
            </p>

            <p>
              <strong>Bio:</strong> {artistProfile.bio || 'No bio added yet.'}
            </p>
          </section>
        ) : (
          <section className='account-settings-card'>
            <h2>Customer Profile</h2>

            <p>
              <strong>Name:</strong> {session?.user.name}
            </p>

            <p>
              <strong>Username:</strong>
              {session?.user.username}
            </p>

            <p>
              <strong>Email:</strong> {session?.user.email}
            </p>
          </section>
        )}
        <section className='account-actions-grid'>
          {isArtist ? (
            <>
              <button
                className='account-action-card'
                onClick={() => router.push('/availability')}
              >
                <span>Set Availability</span>
                <p>Create new time slots customers can book.</p>
              </button>

              <button
                className='account-action-card'
                onClick={() => router.push('/appointments')}
              >
                <span>View Appointments</span>
                <p>Review upcoming appointments and reject if needed.</p>
              </button>

              <button
                className='account-action-card'
                onClick={() => router.push('/reference')}
              >
                <span>View Services</span>
                <p>See available service types and prices.</p>
              </button>
            </>
          ) : (
            <>
              <button
                className='account-action-card'
                onClick={() => router.push('/book')}
              >
                <span>Book an Appointment</span>
                <p>Choose a service, artist, date, and time.</p>
              </button>

              <button
                className='account-action-card'
                onClick={() => router.push('/appointments')}
              >
                <span>My Appointments</span>
                <p>View, edit, or cancel upcoming bookings.</p>
              </button>

              <button
                className='account-action-card'
                onClick={() => router.push('/reference')}
              >
                <span>Browse Reference</span>
                <p>Explore henna services and artists.</p>
              </button>
            </>
          )}
        </section>

        <section className='account-settings-card'>
          <h2>Account Settings</h2>

          <div className='account-settings-actions'>
            <button
              className='account-secondary-button'
              onClick={() => setEditOpen(true)}
            >
              Edit Information
            </button>

            <button
              className='account-secondary-button'
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Logout
            </button>

            <button
              className='account-danger-button'
              onClick={() => {
                setDeleteOpen(true);
                setFormError('');
                setDeleteConfirmText('');
              }}
            >
              Permanently Delete Account
            </button>
          </div>
        </section>
      </main>

      {editOpen && (
        <div className='account-modal-overlay'>
          <div className='account-modal'>
            <div className='account-modal-header'>
              <h2>Edit Account</h2>
              <button type='button' onClick={() => setEditOpen(false)}>
                ×
              </button>
            </div>

            <form className='account-form' onSubmit={submitEdit}>
              <label>
                Name
                <input
                  name='name'
                  value={form.name}
                  onChange={updateField}
                  placeholder='Name'
                />
              </label>

              <label>
                Email
                <input
                  name='email'
                  type='email'
                  value={form.email}
                  onChange={updateField}
                  placeholder='Email'
                />
              </label>

              <label>
                Phone Number
                <input
                  name='phoneNumber'
                  value={form.phoneNumber}
                  onChange={updateField}
                  placeholder='Phone number'
                />
              </label>

              {isArtist && (
                <>
                  <label>
                    Portfolio Link
                    <input
                      name='portfolioLink'
                      value={form.portfolioLink}
                      onChange={updateField}
                      placeholder='https://portfolio.com'
                    />
                  </label>

                  <label>
                    Bio
                    <textarea
                      name='bio'
                      value={form.bio}
                      onChange={updateField}
                      placeholder='Tell customers about your style...'
                    />
                  </label>
                </>
              )}

              {formError && <p className='account-form-error'>{formError}</p>}

              <button
                type='submit'
                className='account-confirm-button'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className='account-modal-overlay'>
          <div className='account-modal'>
            <div className='account-modal-header'>
              <h2>Delete Account</h2>
              <button type='button' onClick={() => setDeleteOpen(false)}>
                ×
              </button>
            </div>

            <div className='account-form'>
              <p>
                This will permanently delete your account and all appointment
                records connected to it.
              </p>

              <label>
                Type DELETE to confirm
                <input
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  placeholder='DELETE'
                />
              </label>

              {formError && <p className='account-form-error'>{formError}</p>}

              <button
                type='button'
                className='account-danger-button'
                disabled={isSubmitting || deleteConfirmText !== 'DELETE'}
                onClick={deleteAccount}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Account;
