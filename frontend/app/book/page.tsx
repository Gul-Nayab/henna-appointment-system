'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import '@/styles/book.css';
import NavBar from '@/components/Navbar';

type Service = {
  serviceId: number;
  type: string;
  duration: number;
  price: number;
  description: string;
};

type Artist = {
  artistId: number;
  skillLevel: string;
  portfolioLink: string;
  bio: string;
};

type BookingOption = {
  slotId: number;
  artistId: number;
  artistName: string;
  serviceId: number;
  serviceType: string;
  duration: number;
  price: number;
  date: string;
  slotStartTime: string;
  slotEndTime: string;
};

export default function BookAppointmentPage() {
  const { data: session } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [selectedOption, setSelectedOption] = useState<BookingOption | null>(
    null,
  );
  const [appointmentStartTime, setAppointmentStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  async function loadBaseData() {
    const [servicesRes, artistsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services`),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists`),
    ]);

    setServices(await servicesRes.json());
    setArtists(await artistsRes.json());
  }

  async function loadBookingOptions() {
    const params = new URLSearchParams();

    if (selectedServiceId) params.set('serviceId', selectedServiceId);
    if (selectedArtistId) params.set('artistId', selectedArtistId);

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/booking-options?${params.toString()}`;

    const res = await fetch(url);
    const data = await res.json();

    setBookingOptions(data);
  }

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadBookingOptions();
  }, [selectedServiceId, selectedArtistId]);

  const visibleOptions = useMemo(() => {
    if (!selectedDate) return bookingOptions;
    return bookingOptions.filter((option) => option.date === selectedDate);
  }, [bookingOptions, selectedDate]);

  function addMinutes(time: string, minutes: number) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);

    return date.toTimeString().slice(0, 8);
  }

  function openBookingModal(option: BookingOption) {
    setSelectedOption(option);
    setAppointmentStartTime(option.slotStartTime);
    setNotes('');
  }

  async function submitAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedOption || !session?.user?.id) return;

    const endTime = addMinutes(appointmentStartTime, selectedOption.duration);

    const payload = {
      customerId: Number(session.user.id),
      serviceId: selectedOption.serviceId,
      slotId: selectedOption.slotId,
      startTime: appointmentStartTime,
      endTime,
      notes,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      alert('Could not book appointment.');
      return;
    }

    setSelectedOption(null);
    setConfirmationOpen(true);
    await loadBookingOptions();
  }

  return (
    <>
      <NavBar />
      <main className='booking-page'>
        <section className='booking-header'>
          <h1>Book an Appointment</h1>
          <p>Select a service, artist, or time slot to find availability.</p>
        </section>

        <section className='booking-filters'>
          <label>
            Service
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              <option value=''>All services</option>
              {services.map((service) => (
                <option key={service.serviceId} value={service.serviceId}>
                  {service.type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Artist
            <select
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
            >
              <option value=''>All artists</option>
              {artists.map((artist) => (
                <option key={artist.artistId} value={artist.artistId}>
                  Artist #{artist.artistId}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>
        </section>

        <section className='booking-options'>
          {visibleOptions.length === 0 ? (
            <p className='booking-empty'>
              No available slots match your filters.
            </p>
          ) : (
            visibleOptions.map((option) => (
              <button
                key={`${option.slotId}-${option.serviceId}`}
                className='booking-slot-card'
                onClick={() => openBookingModal(option)}
              >
                <span className='booking-slot-date'>{option.date}</span>
                <span className='booking-slot-time'>
                  {option.slotStartTime} - {option.slotEndTime}
                </span>
                <span className='booking-slot-meta'>
                  {option.serviceType} with {option.artistName}
                </span>
                <span className='booking-slot-price'>${option.price}</span>
              </button>
            ))
          )}
        </section>

        {selectedOption && (
          <div className='booking-modal-overlay'>
            <div className='booking-modal'>
              <div className='booking-modal-header'>
                <h2>Book Your Appointment</h2>
                <button type='button' onClick={() => setSelectedOption(null)}>
                  ×
                </button>
              </div>

              <form onSubmit={submitAppointment} className='booking-modal-form'>
                <div className='booking-summary'>
                  <p>
                    <strong>Service:</strong> {selectedOption.serviceType}
                  </p>
                  <p>
                    <strong>Artist:</strong> {selectedOption.artistName}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedOption.date}
                  </p>
                  <p>
                    <strong>Available:</strong> {selectedOption.slotStartTime} -{' '}
                    {selectedOption.slotEndTime}
                  </p>
                </div>

                <label>
                  Start time
                  <input
                    type='time'
                    step='60'
                    value={appointmentStartTime.slice(0, 5)}
                    onChange={(e) =>
                      setAppointmentStartTime(`${e.target.value}:00`)
                    }
                    min={selectedOption.slotStartTime.slice(0, 5)}
                    max={selectedOption.slotEndTime.slice(0, 5)}
                    required
                  />
                </label>

                <label>
                  Notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='Add design notes or requests...'
                  />
                </label>

                <button type='submit' className='booking-submit-button'>
                  Book Appointment
                </button>
              </form>
            </div>
          </div>
        )}

        {confirmationOpen && (
          <div className='booking-modal-overlay'>
            <div className='booking-confirmation'>
              <h2>Appointment Booked!</h2>
              <p>Your appointment has been booked successfully.</p>
              <button onClick={() => setConfirmationOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
