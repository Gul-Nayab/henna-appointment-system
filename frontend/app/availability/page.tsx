'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import NavBar from '@/components/Navbar';
import '@/styles/availability.css';

type AvailabilitySlot = {
  slotId: number;
  artistId: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

export default function AvailabilityPage() {
  const router = useRouter;
  const { data: session } = useSession();

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArtist = session?.user?.role === 'ARTIST';

  async function loadAvailability() {
    if (!session?.user?.id || !isArtist) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists/${session.user.id}/availability-slots`,
        { timeout: 5000 },
      );

      setSlots(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load availability.');
    }
  }

  useEffect(() => {
    loadAvailability();
  }, [session?.user?.id, session?.user?.role]);

  function formatTime(time: string) {
    const [hourString, minuteString] = time.split(':');
    const hour = Number(hourString);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${displayHour}:${minuteString.padStart(2, '0')} ${period}`;
  }

  function makeDateTime(slotDate: string, time: string) {
    return new Date(`${slotDate}T${time}`);
  }

  const upcomingSlots = useMemo(() => {
    return slots
      .filter((slot) => makeDateTime(slot.date, slot.endTime) > new Date())
      .sort((a, b) => {
        const aTime = makeDateTime(a.date, a.startTime).getTime();
        const bTime = makeDateTime(b.date, b.startTime).getTime();
        return aTime - bTime;
      });
  }, [slots]);

  const pastSlots = useMemo(() => {
    return slots
      .filter((slot) => makeDateTime(slot.date, slot.endTime) <= new Date())
      .sort((a, b) => {
        const bTime = makeDateTime(b.date, b.startTime).getTime();
        const aTime = makeDateTime(a.date, a.startTime).getTime();
        return bTime - aTime;
      });
  }, [slots]);

  function openModal() {
    setDate('');
    setStartTime('');
    setEndTime('');
    setFormError('');
    setModalOpen(true);
  }

  async function submitAvailability(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user?.id) return;

    setFormError('');

    if (!date || !startTime || !endTime) {
      setFormError('Please choose a date, start time, and end time.');
      return;
    }

    const start = makeDateTime(date, `${startTime}:00`);
    const end = makeDateTime(date, `${endTime}:00`);

    if (start <= new Date()) {
      setFormError('Availability must be in the future.');
      return;
    }

    if (end <= start) {
      setFormError('End time must be after start time.');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists/${session.user.id}/availability-slots`,
        {
          date,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          isBooked: false,
        },
        { timeout: 5000 },
      );

      setModalOpen(false);
      await loadAvailability();
    } catch (err) {
      console.error(err);
      setFormError('Could not create availability.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isArtist) {
    router.push('/');
  }

  return (
    <>
      <NavBar />

      <main className='availability-page'>
        <section className='availability-header'>
          <div>
            <h1>My Availability</h1>
            <p>Create and view the time slots customers can book.</p>
          </div>

          <button className='availability-primary-button' onClick={openModal}>
            Add Availability
          </button>
        </section>

        {error && <p className='availability-error'>{error}</p>}

        <section className='availability-section'>
          <h2>Upcoming Availability</h2>

          {upcomingSlots.length === 0 ? (
            <p className='availability-empty'>No upcoming availability.</p>
          ) : (
            <div className='availability-grid'>
              {upcomingSlots.map((slot) => (
                <article
                  key={slot.slotId}
                  className={`availability-card ${
                    slot.isBooked ? 'booked' : 'open'
                  }`}
                >
                  <div>
                    <h3>{slot.date}</h3>
                    <p>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </p>
                  </div>

                  <span className='availability-status'>
                    {slot.isBooked ? 'Booked' : 'Open'}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className='availability-section'>
          <h2>Past Availability</h2>

          {pastSlots.length === 0 ? (
            <p className='availability-empty'>No past availability.</p>
          ) : (
            <div className='availability-grid'>
              {pastSlots.map((slot) => (
                <article key={slot.slotId} className='availability-card past'>
                  <div>
                    <h3>{slot.date}</h3>
                    <p>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </p>
                  </div>

                  <span className='availability-status'>Past</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div className='availability-modal-overlay'>
          <div className='availability-modal'>
            <div className='availability-modal-header'>
              <h2>Add Availability</h2>
              <button type='button' onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>

            <form className='availability-form' onSubmit={submitAvailability}>
              <label>
                Date
                <input
                  type='date'
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </label>

              <label>
                Start Time
                <input
                  type='time'
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
              </label>

              <label>
                End Time
                <input
                  type='time'
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                />
              </label>

              {formError && (
                <p className='availability-form-error'>{formError}</p>
              )}

              <button
                type='submit'
                className='availability-primary-button'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Availability'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
