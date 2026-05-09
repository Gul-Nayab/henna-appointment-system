'use client';

import { signOut, useSession } from 'next-auth/react';

import Link from 'next/link';
import Image from 'next/image';
import {
  IconCalendarClock,
  IconCalendarWeek,
  IconLogout,
  IconUserFilled,
} from '@tabler/icons-react';
import '@/styles/navbar.css';

function NavBar() {
  const { data: session, status } = useSession();

  return (
    <>
      <div className='navbar-image'>
        <Image
          src={'/images/splash.png'}
          alt={'multiple hands with henna on stone'}
          fill
          priority
          className='bg-image'
        />
      </div>

      <div className='navbar'>
        <nav className='main-nav'>
          <Link href='/' className='brand-link'>
            Henna Appointment System
          </Link>
          {status === 'authenticated' ? (
            <div className='nav-actions'>
              {session.user.role === 'CUSTOMER' ? (
                <Link href={`/book`} title='Book an appointment'>
                  <IconCalendarWeek className='nav-icon' />
                </Link>
              ) : (
                <Link href={`/availability`} title='View your availability'>
                  <IconCalendarWeek className='nav-icon' />
                </Link>
              )}
              <Link href={`/appointments`} title='See all your appointments'>
                <IconCalendarClock className='nav-icon' />
              </Link>
              <Link
                href={`/${session.user.username}/account`}
                title='Go to your account'
              >
                <IconUserFilled className='nav-icon' />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className='logout-btn'
              >
                <IconLogout className='nav-icon' />
              </button>
            </div>
          ) : (
            <div className='nav-actions'>
              <Link href={`/`} title='Go to home page'>
                Home
              </Link>
              <Link href={`/reference`} title='Go to reference page'>
                References
              </Link>
              <Link href={`/login`} title='log into account'>
                Login
              </Link>
              <Link href={`/signup`} title='create an account'>
                Signup
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

export default NavBar;
