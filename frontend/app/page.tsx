'use client';

import '@/styles/home.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className='home-page'>
      <div className='landing-image'>
        <Image
          src={'/images/splash.png'}
          alt={'multiple hands with henna on stone'}
          fill
          priority
          className='bg-image'
        />
      </div>
      <div className='landing'>
        <nav className='main-nav'>
          <Link href='/' className='brand-link'>
            Henna Appointment System
          </Link>

          <div className='nav-actions'>
            <button
              className='nav-btn btn-dark'
              onClick={() => router.push('/login')}
            >
              Login
            </button>
            <button
              className='nav-btn btn-light'
              onClick={() => router.push('/signup')}
            >
              Sign Up
            </button>
          </div>
        </nav>

        <div className='hero-content'>
          <h1>Book a Henna Appointment for All Your Events</h1>
          <button
            className='hero-btn btn-dark'
            onClick={() => router.push('/login')}
          >
            Book
          </button>
        </div>
      </div>

      <div className='details'>
        <div className='details-row'>
          <div className='details-text customer-text'>
            <h2>Customer</h2>
            <p>
              Need henna done for your next event? Going to a wedding? Just
              curious and want to try it out? Check out available artists and
              book an appointment today!
            </p>
            <button
              type='button'
              className='details-btn'
              onClick={() => router.push('/login')}
            >
              View Availability
            </button>
          </div>

          <div className='details-image customer-image'>
            <Image
              src='/images/customer.jpg'
              width={600}
              height={400}
              alt='customer getting henna done'
            />
          </div>
        </div>

        <div className='details-row reverse'>
          <div className='details-image artist-image'>
            <Image
              src='/images/artist.png'
              width={600}
              height={400}
              alt='artist doing henna'
            />
          </div>

          <div className='details-text artist-text'>
            <h2>Artists</h2>
            <p>
              Want to promote your art? Looking to expand with more clients?
              Need a better management system? Try it out today
            </p>
            <button
              type='button'
              className='details-btn'
              onClick={() => router.push('/signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
