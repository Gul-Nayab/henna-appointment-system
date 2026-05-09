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

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const isArtist = session?.user?.role === 'ARTIST';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

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

  function timeToMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function addMinutes(time: string, minutes: number) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();

    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);

    return date.toTimeString().slice(0, 8);
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

  function groupBookingOptions(options: BookingOption[]) {
    const grouped = new Map<number, BookingSlot>();

    for (const option of options) {
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
  }

  async function openEditModal(appointment: Appointment) {
    if (isArtist) return;

    setEditingAppointment(appointment);
    setSelectedSlotId(String(appointment.slotId));
    setSelectedServiceId(String(appointment.serviceId));
    setEditStartTime(appointment.startTime);
    setEditNotes(appointment.notes ?? '');
    setEditError('');

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/booking-options`,
        {
          params: {
            artistId: appointment.artistId,
          },
          timeout: 5000,
        },
      );

      const freeSlots = groupBookingOptions(response.data);

      const currentSlot: BookingSlot = {
        slotId: appointment.slotId,
        artistId: appointment.artistId,
        artistName: appointment.artistName,
        date: appointment.date,
        slotStartTime: appointment.startTime,
        slotEndTime: appointment.endTime,
        services: [
          {
            serviceId: appointment.serviceId,
            type: appointment.serviceType,
            duration:
              timeToMinutes(appointment.endTime) -
              timeToMinutes(appointment.startTime),
            price: 0,
          },
        ],
      };

      setAvailableSlots([currentSlot, ...freeSlots]);
    } catch (err) {
      console.error(err);
      setEditError('Failed to load available slots.');
      setAvailableSlots([]);
    }
  }

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

  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;

    return availableSlots.find(
      (slot) => slot.slotId === Number(selectedSlotId),
    );
  }, [availableSlots, selectedSlotId]);

  const selectedService = useMemo(() => {
    if (!selectedSlot || !selectedServiceId) return null;

    return selectedSlot.services.find(
      (service) => service.serviceId === Number(selectedServiceId),
    );
  }, [selectedSlot, selectedServiceId]);

  const computedEditEndTime = useMemo(() => {
    if (!selectedService || !editStartTime) return '';

    return addMinutes(editStartTime, selectedService.duration);
  }, [selectedService, editStartTime]);

  const editValidationMessage = useMemo(() => {
    if (!editingAppointment) return 'No appointment selected.';
    if (!selectedSlot) return 'Please choose an available slot.';
    if (!selectedService) return 'Please choose a service.';
    if (!editStartTime) return 'Please choose a start time.';

    const start = timeToMinutes(editStartTime);
    const end = timeToMinutes(computedEditEndTime);
    const slotStart = timeToMinutes(selectedSlot.slotStartTime);
    const slotEnd = timeToMinutes(selectedSlot.slotEndTime);

    if (start < slotStart) {
      return 'The start time is before the selected slot begins.';
    }

    if (end > slotEnd) {
      return 'This service does not fit inside the selected slot.';
    }

    if (makeDateTime(selectedSlot.date, editStartTime) <= new Date()) {
      return 'You cannot move an appointment to a past time.';
    }

    return '';
  }, [
    editingAppointment,
    selectedSlot,
    selectedService,
    editStartTime,
    computedEditEndTime,
  ]);

  const canConfirmEdit =
    !editValidationMessage && !isSubmittingEdit && !!editingAppointment;

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !editingAppointment ||
      !selectedSlot ||
      !selectedService ||
      !canConfirmEdit
    ) {
      return;
    }

    setIsSubmittingEdit(true);
    setEditError('');

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${editingAppointment.apptId}`,
        {
          customerId: editingAppointment.customerId,
          serviceId: selectedService.serviceId,
          slotId: selectedSlot.slotId,
          startTime: editStartTime,
          endTime: computedEditEndTime,
          notes: editNotes,
        },
        { timeout: 5000 },
      );

      setEditingAppointment(null);
      await getUserAppointments();
    } catch (err) {
      console.error(err);

      setEditError(
        'Could not update appointment. The slot may no longer be available.',
      );
    } finally {
      setIsSubmittingEdit(false);
    }
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

      {editingAppointment && !isArtist && (
        <div className='appointment-modal-overlay'>
          <div className='appointment-edit-modal'>
            <div className='appointment-edit-header'>
              <h2>Edit Appointment</h2>

              <button type='button' onClick={() => setEditingAppointment(null)}>
                ×
              </button>
            </div>

            <form className='appointment-edit-form' onSubmit={submitEdit}>
              <div className='appointment-edit-summary'>
                <p>
                  <strong>Artist:</strong> {editingAppointment.artistName}
                </p>

                <p>
                  <strong>Current appointment:</strong>{' '}
                  {editingAppointment.date} •{' '}
                  {formatTime(editingAppointment.startTime)} -{' '}
                  {formatTime(editingAppointment.endTime)}
                </p>
              </div>

              <label>
                Available slot
                <select
                  value={selectedSlotId}
                  onChange={(event) => {
                    const newSlotId = event.target.value;

                    const newSlot = availableSlots.find(
                      (slot) => slot.slotId === Number(newSlotId),
                    );

                    setSelectedSlotId(newSlotId);
                    setSelectedServiceId('');
                    setEditStartTime(newSlot?.slotStartTime ?? '');
                  }}
                  required
                >
                  <option value=''>Choose a slot</option>

                  {availableSlots.map((slot) => (
                    <option key={slot.slotId} value={slot.slotId}>
                      {slot.date} • {formatTime(slot.slotStartTime)} -{' '}
                      {formatTime(slot.slotEndTime)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Service
                <select
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  required
                  disabled={!selectedSlot}
                >
                  <option value=''>Choose a service</option>

                  {selectedSlot?.services.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.type}
                      {service.price ? ` - $${service.price}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              {selectedService && (
                <div className='appointment-edit-preview'>
                  <p>
                    <strong>Service:</strong> {selectedService.type}
                  </p>

                  <p>
                    <strong>Duration:</strong> {selectedService.duration}{' '}
                    minutes
                  </p>

                  {selectedService.price > 0 && (
                    <p>
                      <strong>Price:</strong> ${selectedService.price}
                    </p>
                  )}
                </div>
              )}

              <label>
                Start time
                <input
                  type='time'
                  step='60'
                  value={editStartTime.slice(0, 5)}
                  onChange={(event) =>
                    setEditStartTime(`${event.target.value}:00`)
                  }
                  min={selectedSlot?.slotStartTime.slice(0, 5)}
                  max={selectedSlot?.slotEndTime.slice(0, 5)}
                  disabled={!selectedSlot}
                  required
                />
              </label>

              {editStartTime && selectedService && (
                <p className='appointment-edit-time-preview'>
                  New time: {formatTime(editStartTime)} -{' '}
                  {formatTime(computedEditEndTime)}
                </p>
              )}

              <label>
                Notes
                <textarea
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  placeholder='Add notes or design requests...'
                />
              </label>

              {(editValidationMessage || editError) && (
                <p className='appointment-edit-error'>
                  {editError || editValidationMessage}
                </p>
              )}

              <button
                type='submit'
                className='appointment-confirm-edit-button'
                disabled={!canConfirmEdit}
              >
                {isSubmittingEdit ? 'Updating...' : 'Confirm Edit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
