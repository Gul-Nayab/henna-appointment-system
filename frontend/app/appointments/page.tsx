'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/Navbar';
import AppointmentCard from '@/components/AppointmentCard';
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
  const isArtist = session?.user?.role === 'ARTIST';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

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

  function formatTime(time: string) {
    const [hourString, minuteString] = time.split(':');
    const hour = Number(hourString);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${displayHour}:${minuteString.padStart(2, '0')} ${period}`;
  }

  function makeDateTime(date: string, time: string) {
    return new Date(`${date}T${time}`);
  }

  function isFutureAppointment(appointment: Appointment) {
    return makeDateTime(appointment.date, appointment.endTime) > new Date();
  }

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appt) =>
        appt.appointmentStatus === 'BOOKED' && isFutureAppointment(appt),
    );
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    return appointments.filter(
      (appt) =>
        appt.appointmentStatus === 'CANCELLED' || !isFutureAppointment(appt),
    );
  }, [appointments]);

  async function cancelAppointment(apptId: number) {
    const confirmed = confirm(
      isArtist
        ? 'Are you sure you want to reject this appointment?'
        : 'Are you sure you want to cancel this appointment?',
    );

    if (!confirmed) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${apptId}/cancel`,
      );
      await getUserAppointments();
    } catch (err) {
      console.error(err);
      alert(
        isArtist
          ? 'Could not reject appointment.'
          : 'Could not cancel appointment.',
      );
    }
  }

  function openEditModal(appointment: Appointment) {
    if (isArtist) return;
    setEditingAppointment(appointment);
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
                  canEdit={!isArtist}
                  cancelLabel={isArtist ? 'Reject' : 'Cancel'}
                  onEdit={() => openEditModal(appointment)}
                  onCancel={() => cancelAppointment(appointment.apptId)}
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
                  canEdit={false}
                  cancelLabel={isArtist ? 'Reject' : 'Cancel'}
                  onEdit={() => {}}
                  onCancel={() => cancelAppointment(appointment.apptId)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Keep your existing edit modal here unchanged */}
      {editingAppointment && (
        <div className='appointment-modal-overlay'>
          <div className='appointment-edit-modal'>
            <div className='appointment-edit-header'>
              <h2>Edit Appointment</h2>
              <button onClick={() => setEditingAppointment(null)}>×</button>
            </div>

            <p>
              Editing for {editingAppointment.serviceType} on{' '}
              {editingAppointment.date}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
