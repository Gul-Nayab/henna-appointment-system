'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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

function AppointmentCard({
  appointment,
  upcoming,
}: {
  appointment: Appointment;
  upcoming: boolean;
}) {
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
  function formatTime(time: string) {
    const [hourString, minuteString] = time.split(':');
    const hour = Number(hourString);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${displayHour}:${minuteString.padStart(2, '0')} ${period}`;
  }
  return (
    <article className='appointment-card'>
      <div className='appointment-card-header'>
        <div>
          <h3>{appointment.serviceType}</h3>
          <p>
            {appointment.date} • {formatTime(appointment.startTime)} -{' '}
            {formatTime(appointment.endTime)}
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

export default AppointmentCard;
