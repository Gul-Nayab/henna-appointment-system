'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/Navbar';
import axios from 'axios';
import '@/styles/appointment.css';
import AppointmentCard from '@/components/AppointmentCard';

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

function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
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

export default AppointmentsPage;
