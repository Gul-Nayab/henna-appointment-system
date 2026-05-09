'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
  name: string;
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

type ServiceOption = {
  serviceId: number;
  type: string;
  duration: number;
  price: number;
};

type BookingSlot = {
  slotId: number;
  artistId: number;
  artistName: string;
  date: string;
  slotStartTime: string;
  slotEndTime: string;
  services: ServiceOption[];
};

export default function BookAppointmentPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [selectedModalServiceId, setSelectedModalServiceId] = useState('');
  const [appointmentStartTime, setAppointmentStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [error, setError] = useState('');

  const [notificationStatus, setNotificationStatus] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  async function loadBookingOptions() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/booking-options`,
        {
          params: {
            artistId: selectedArtistId || undefined,
            serviceId: selectedServiceId || undefined,
          },
          timeout: 5000,
        },
      );

      setBookingOptions(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load available slots.');
    }
  }

  useEffect(() => {
    async function loadBaseData() {
      try {
        const servicesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services`,
        );
        const artistsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists`,
        );

        setServices(servicesRes.data);
        setArtists(artistsRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load booking data.');
      }
    }

    loadBaseData();
  }, []);

  useEffect(() => {
    loadBookingOptions();
  }, [selectedServiceId, selectedArtistId]);

  function formatTime(time: string) {
    const [hourString, minuteString] = time.split(':');
    const hour = Number(hourString);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${displayHour}:${minuteString.padStart(2, '0')} ${period}`;
  }

  function timeToMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function makeDateTime(date: string, time: string) {
    return new Date(`${date}T${time}`);
  }

  function isFutureSlot(slot: BookingSlot) {
    const slotEndDateTime = makeDateTime(slot.date, slot.slotEndTime);
    return slotEndDateTime > new Date();
  }

  const bookingSlots = useMemo(() => {
    const grouped = new Map<number, BookingSlot>();

    for (const option of bookingOptions) {
      const service: ServiceOption = {
        serviceId: option.serviceId,
        type: option.serviceType,
        duration: option.duration,
        price: option.price,
      };

      const existingSlot = grouped.get(option.slotId);

      if (!existingSlot) {
        grouped.set(option.slotId, {
          slotId: option.slotId,
          artistId: option.artistId,
          artistName: option.artistName,
          date: option.date,
          slotStartTime: option.slotStartTime,
          slotEndTime: option.slotEndTime,
          services: [service],
        });
      } else {
        const serviceAlreadyAdded = existingSlot.services.some(
          (existingService) => existingService.serviceId === service.serviceId,
        );

        if (!serviceAlreadyAdded) {
          existingSlot.services.push(service);
        }
      }
    }

    return Array.from(grouped.values());
  }, [bookingOptions]);

  const visibleSlots = useMemo(() => {
    return bookingSlots.filter((slot) => {
      const matchesDate = !selectedDate || slot.date === selectedDate;

      const matchesTime =
        !selectedTime ||
        (timeToMinutes(slot.slotStartTime) <= timeToMinutes(selectedTime) &&
          timeToMinutes(slot.slotEndTime) > timeToMinutes(selectedTime));

      return isFutureSlot(slot) && matchesDate && matchesTime;
    });
  }, [bookingSlots, selectedDate, selectedTime]);

  const selectedService = useMemo(() => {
    if (!selectedSlot || !selectedModalServiceId) return null;

    return selectedSlot.services.find(
      (service) => service.serviceId === Number(selectedModalServiceId),
    );
  }, [selectedSlot, selectedModalServiceId]);

  function addMinutes(time: string, minutes: number) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();

    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);

    return date.toTimeString().slice(0, 8);
  }
  const artistMap = useMemo(() => {
    return Object.fromEntries(
      artists.map((artist) => [artist.artistId, artist]),
    );
  }, [artists]);

  function openBookingModal(slot: BookingSlot) {
    setSelectedSlot(slot);
    setAppointmentStartTime(slot.slotStartTime);
    setNotes('');

    if (selectedServiceId) {
      setSelectedModalServiceId(selectedServiceId);
    } else {
      setSelectedModalServiceId('');
    }
  }

  async function submitAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSlot || !selectedService || !session?.user?.id) return;

    const endTime = addMinutes(appointmentStartTime, selectedService.duration);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`,
        {
          customerId: Number(session.user.id),
          serviceId: selectedService.serviceId,
          slotId: selectedSlot.slotId,
          startTime: appointmentStartTime,
          endTime,
          notes,
        },
        { timeout: 5000 },
      );

      console.log('Booking response:', response.data);

      setNotificationStatus(response.data.notificationStatus);
      setNotificationMessage(response.data.notificationMessage);

      setSelectedSlot(null);
      setConfirmationOpen(true);
      await loadBookingOptions();
    } catch (err) {
      console.error(err);
      alert('Could not book appointment.');
    }
  }

  return (
    <>
      <NavBar />

      <main className='booking-page'>
        <section className='booking-header'>
          <h1>Book an Appointment</h1>
          <p>
            Filter by service, artist, date, or time. Then choose an available
            slot.
          </p>
        </section>

        {error && <p className='booking-error'>{error}</p>}

        <section className='booking-filters'>
          <label>
            Service
            <select
              value={selectedServiceId}
              onChange={(event) => setSelectedServiceId(event.target.value)}
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
              onChange={(event) => setSelectedArtistId(event.target.value)}
            >
              <option value=''>All artists</option>
              {artists.map((artist) => (
                <option key={artist.artistId} value={artist.artistId}>
                  {artist.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type='date'
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>

          <label>
            Time
            <input
              type='time'
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
            />
          </label>
        </section>

        <section className='booking-options'>
          {visibleSlots.length === 0 ? (
            <p className='booking-empty'>
              No available slots match your filters.
            </p>
          ) : (
            visibleSlots.map((slot) => (
              <button
                key={slot.slotId}
                type='button'
                className='booking-slot-card'
                onClick={() => openBookingModal(slot)}
              >
                <span className='booking-slot-date'>{slot.date}</span>

                <span className='booking-slot-time'>
                  {formatTime(slot.slotStartTime)} -{' '}
                  {formatTime(slot.slotEndTime)}
                </span>

                <span className='booking-slot-meta'>
                  Artist: {slot.artistName}
                </span>
                <span className='booking-slot-meta'>
                  Level: {artistMap[slot.artistId]?.skillLevel ?? 'Beginner'}
                </span>

                <span className='booking-slot-services'>
                  Services offered:{' '}
                  {slot.services.map((service) => service.type).join(', ')}
                </span>
              </button>
            ))
          )}
        </section>

        {selectedSlot && (
          <div className='booking-modal-overlay'>
            <div className='booking-modal'>
              <div className='booking-modal-header'>
                <h2>Book Your Appointment</h2>
                <button type='button' onClick={() => setSelectedSlot(null)}>
                  ×
                </button>
              </div>

              <form onSubmit={submitAppointment} className='booking-modal-form'>
                <div className='booking-summary'>
                  <p>
                    <strong>Artist:</strong> {selectedSlot.artistName}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedSlot.date}
                  </p>
                  <p>
                    <strong>Available:</strong>{' '}
                    {formatTime(selectedSlot.slotStartTime)} -{' '}
                    {formatTime(selectedSlot.slotEndTime)}
                  </p>
                </div>

                <label>
                  Service
                  <select
                    value={selectedModalServiceId}
                    onChange={(event) =>
                      setSelectedModalServiceId(event.target.value)
                    }
                    required
                  >
                    <option value=''>Choose a service</option>
                    {selectedSlot.services.map((service) => (
                      <option key={service.serviceId} value={service.serviceId}>
                        {service.type}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedService && (
                  <div className='booking-service-preview'>
                    <p>
                      <strong>Duration:</strong> {selectedService.duration}{' '}
                      minutes
                    </p>
                    <p>
                      <strong>Price:</strong> ${selectedService.price}
                    </p>
                  </div>
                )}

                <label>
                  Start time
                  <input
                    type='time'
                    step='60'
                    value={appointmentStartTime.slice(0, 5)}
                    onChange={(event) =>
                      setAppointmentStartTime(`${event.target.value}:00`)
                    }
                    min={selectedSlot.slotStartTime.slice(0, 5)}
                    max={selectedSlot.slotEndTime.slice(0, 5)}
                    required
                  />
                </label>

                {appointmentStartTime && selectedService && (
                  <p className='booking-time-preview'>
                    Appointment time: {formatTime(appointmentStartTime)} -{' '}
                    {formatTime(
                      addMinutes(
                        appointmentStartTime,
                        selectedService.duration,
                      ),
                    )}
                  </p>
                )}

                <label>
                  Notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder='Add design notes or requests...'
                  />
                </label>

                <button
                  type='submit'
                  className='booking-submit-button'
                  disabled={!selectedService}
                >
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
              <br />
              <p> Notification Sent: {notificationStatus}</p>
              <p> {notificationMessage}</p>
              <button
                type='button'
                onClick={() => router.push('/appointments')}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
