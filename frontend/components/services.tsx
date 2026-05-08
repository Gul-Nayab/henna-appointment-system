'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import ServiceCard from '@/components/serviceCard';
import '@/styles/services.css';

interface Service {
  serviceId: number;
  type: string;
  duration: number;
  price: number;
  description: string;
}

function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getAllServices() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services`,
          { timeout: 5000 },
        );
        setServices(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load services.');
      } finally {
        setLoading(false);
      }
    }

    getAllServices();
  }, []);

  if (loading)
    return <div className='services-message'>Loading services...</div>;
  if (error) return <div className='services-message'>{error}</div>;

  return (
    <section className='services-section'>
      <h2 className='services-title'>Service Types</h2>

      <div className='service-card-container'>
        {services.map((service) => (
          <ServiceCard service={service} key={service.serviceId} />
        ))}
      </div>
    </section>
  );
}

export default Services;
