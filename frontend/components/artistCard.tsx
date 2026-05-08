'use client';

import Image from 'next/image';

type Artist = {
  artistId: number;
  name: string;
  skillLevel: string;
  portfolioLink: string | null;
  bio: string | null;
};

function ArtistCard({ artist }: { artist: Artist }) {
  const imageSrc = `/images/artists/artist_${artist.artistId}.jpg`;

  return (
    <article className='artist-card'>
      <div className='artist-image-wrapper'>
        <Image
          src={imageSrc}
          alt={artist.name}
          className='artist-image'
          width={180}
          height={180}
        />
      </div>

      <div className='artist-card-content'>
        <p className='artist-label'>Name</p>
        <h3 className='artist-name'>{artist.name}</h3>

        <p className='artist-label'>Skill Level</p>
        <p className='artist-skill'>{artist.skillLevel}</p>

        {artist.bio && (
          <>
            <p className='artist-label'>Bio</p>
            <p className='artist-bio'>{artist.bio}</p>
          </>
        )}
      </div>
    </article>
  );
}

export default ArtistCard;
