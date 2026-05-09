'use client';

import Image from 'next/image';
import Link from 'next/link';

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
          width={300}
          height={300}
        />
      </div>

      <div className='artist-card-content'>
        <p className='artist-label'>Name</p>
        <h3 className='artist-name'>{artist.name}</h3>

        <p className='artist-label'>Skill Level</p>
        <p className='artist-skill'>{artist.skillLevel}</p>

        <p className='artist-label'>Portfolio</p>
        <p className='artist-skill'>
          <Link href={artist.portfolioLink}>{artist.portfolioLink}</Link>
        </p>

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
