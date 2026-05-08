'use client';

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

type Props = {
  appointment: Appointment;
  upcoming: boolean;
  canEdit: boolean;
  cancelLabel: 'Cancel' | 'Reject';
  onEdit: () => void;
  onCancel: () => void;
};

export default function AppointmentCard({
  appointment,
  upcoming,
  canEdit,
  cancelLabel,
  onEdit,
  onCancel,
}: Props) {
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
          {canEdit && (
            <button className='appointment-secondary-button' onClick={onEdit}>
              Edit
            </button>
          )}

          <button className='appointment-danger-button' onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      )}
    </article>
  );
}
