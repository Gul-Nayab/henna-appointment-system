'use client';
import { signOut, useSession } from 'next-auth/react';
import NavBar from '@/components/Navbar';

function Dashboard() {
  const { data: session, status } = useSession();
  return (
    <>
      <NavBar />
      <h1> Welcome Back, {session?.user.username}</h1>
    </>
  );
}

export default Dashboard;
