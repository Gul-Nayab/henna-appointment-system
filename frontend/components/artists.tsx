'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import ArtistCard from '@/components/artistCard';
import '@/styles/artists.css';

type Artist = {
  artistId: number;
  name: string;
  skillLevel: string;
  portfolioLink: string | null;
  bio: string | null;
};

function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getArtists() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/artists`,
          { timeout: 5000 },
        );
        setArtists(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load artists.');
      } finally {
        setLoading(false);
      }
    }

    getArtists();
  }, []);

  if (loading) return <div className='artists-message'>Loading artists...</div>;
  if (error) return <div className='artists-message'>{error}</div>;

  return (
    <section className='artists-section'>
      <h2 className='artists-title'>Artists</h2>

      <div className='artist-card-container'>
        {artists.map((artist) => (
          <ArtistCard artist={artist} key={artist.artistId} />
        ))}
      </div>
    </section>
  );
}

export default Artists;
