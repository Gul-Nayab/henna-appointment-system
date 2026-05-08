'use client';

import Image from 'next/image';

interface Service {
  serviceId: number;
  type: string;
  duration: number;
  price: number;
  description: string;
}

function formatDuration(duration: number) {
  if (duration < 60) return `${duration} min`;
  if (duration === 60) return '1 hr';
  if (duration % 60 === 0) return `${duration / 60} hr`;

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours} hr ${minutes} min`;
}

function ServiceCard({ service }: { service: Service }) {
  const imageSrc = `/images/services/service_${service.type.toLowerCase()}_${service.serviceId}.jpg`;

  return (
    <article className='service-card'>
      <div className='service-image-wrapper'>
        <Image
          src={imageSrc}
          alt={service.type}
          className='service-image'
          width={360}
          height={180}
        />
      </div>

      <div className='service-card-content'>
        <h3 className='service-name'>{service.type}</h3>
        <p className='service-description'>
          {service.description} - {formatDuration(service.duration)}
        </p>
        <p className='service-price'>${service.price}</p>
      </div>
    </article>
  );
}

export default ServiceCard;
