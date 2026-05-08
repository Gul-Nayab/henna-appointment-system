'use client';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/Navbar';
import { useEffect } from 'react';

function Account() {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  return (
    <>
      <NavBar />
      <h1> Welcome Back, {session?.user.username}</h1>
      <button> Edit Information</button>
      <button> Permanantly Delete Accout</button>
      <button onClick={() => router.push('/book')}> Book an Appointment</button>
      <button onClick={() => router.push('/appointments')}>
        View upcoming appointments
      </button>
      <button onClick={() => signOut({ callbackUrl: '/login' })}>Logout</button>
    </>
  );
}

export default Account;
