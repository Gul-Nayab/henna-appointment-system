'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/Navbar';
import axios from 'axios';
import '@/styles/appointment.css';

type Appointment = {
  apptId: number;
  appointmentStatus: 'BOOKED' | 'CANCELLED';
  artistId: number;
  artistName: string;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceType: string;
  slotId: number;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>('');

  async function getUserAppointments() {
    if (!session?.user?.id || !session?.user?.role) return;

    try {
      const url =
        session.user.role === 'ARTIST'
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists/${session.user.id}/appointments`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/${session.user.id}/appointments`;

      const response = await axios.get(url, { timeout: 5000 });
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments.');
    }
  }

  useEffect(() => {
    getUserAppointments();
  }, [session?.user?.id, session?.user?.role]);

  const today = new Date().toISOString().slice(0, 10);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appt) => appt.date >= today && appt.appointmentStatus === 'BOOKED',
    );
  }, [appointments, today]);

  const pastAppointments = useMemo(() => {
    return appointments.filter(
      (appt) => appt.date < today || appt.appointmentStatus === 'CANCELLED',
    );
  }, [appointments, today]);

  async function cancelAppointment(apptId: number) {
    const confirmed = confirm(
      'Are you sure you want to cancel this appointment?',
    );
    if (!confirmed) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${apptId}/cancel`,
      );
      await getUserAppointments();
    } catch (err) {
      console.error(err);
      alert('Could not cancel appointment.');
    }
  }

  function AppointmentCard({
    appointment,
    upcoming,
  }: {
    appointment: Appointment;
    upcoming: boolean;
  }) {
    return (
      <article className='appointment-card'>
        <div className='appointment-card-header'>
          <div>
            <h3>{appointment.serviceType}</h3>
            <p>
              {appointment.date} • {appointment.startTime} -{' '}
              {appointment.endTime}
            </p>
          </div>
          <span
            className={`appointment-status ${appointment.appointmentStatus.toLowerCase()}`}
          >
            {appointment.appointmentStatus}
          </span>
        </div>

        <div className='appointment-details'>
          <p>
            <strong>Artist:</strong> {appointment.artistName}
          </p>
          <p>
            <strong>Customer:</strong> {appointment.customerName}
          </p>
          {appointment.notes && (
            <p>
              <strong>Notes:</strong> {appointment.notes}
            </p>
          )}
        </div>

        {upcoming && (
          <div className='appointment-actions'>
            <button className='appointment-secondary-button'>Edit</button>
            <button
              className='appointment-danger-button'
              onClick={() => cancelAppointment(appointment.apptId)}
            >
              Cancel
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <>
      <NavBar />
      <main className='appointments-page'>
        <section className='appointments-header'>
          <h1>My Appointments</h1>
          <p>View your upcoming and past henna appointments.</p>
        </section>

        {error && <p className='appointments-error'>{error}</p>}

        <section className='appointments-section'>
          <h2>Upcoming Appointments</h2>

          {upcomingAppointments.length === 0 ? (
            <p className='appointments-empty'>No upcoming appointments.</p>
          ) : (
            <div className='appointments-grid'>
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.apptId}
                  appointment={appointment}
                  upcoming={true}
                />
              ))}
            </div>
          )}
        </section>

        <section className='appointments-section'>
          <h2>Past Appointments</h2>

          {pastAppointments.length === 0 ? (
            <p className='appointments-empty'>No past appointments.</p>
          ) : (
            <div className='appointments-grid'>
              {pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.apptId}
                  appointment={appointment}
                  upcoming={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
