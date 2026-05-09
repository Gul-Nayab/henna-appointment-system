'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/Navbar';
import { useEffect } from 'react';
import '@/styles/account.css';
import { IconPalette, IconUserHeart } from '@tabler/icons-react';

function Account() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isArtist = session?.user.role === 'ARTIST';

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

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
          <h1>Welcome back, {session?.user.name}</h1>
          <p>
            {isArtist
              ? 'Manage your availability, appointments, and artist profile.'
              : 'Book appointments, view your schedule, and manage your account.'}
          </p>
        </section>

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
            <button className='account-secondary-button'>
              Edit Information
            </button>

            <button
              className='account-secondary-button'
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Logout
            </button>

            <button className='account-danger-button'>
              Permanently Delete Account
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default Account;
