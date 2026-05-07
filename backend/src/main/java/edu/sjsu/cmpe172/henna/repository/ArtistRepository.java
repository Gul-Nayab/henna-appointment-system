package edu.sjsu.cmpe172.henna.repository;

import edu.sjsu.cmpe172.henna.dto.ArtistResponse;
import edu.sjsu.cmpe172.henna.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Integer> {

    @Query("""
                SELECT new edu.sjsu.cmpe172.henna.dto.ArtistResponse(
                    a.artistId,
                    u.name,
                    a.skillLevel,
                    a.portfolioLink,
                    a.bio
                )
                FROM Artist a
                JOIN User u ON a.artistId = u.userId
                ORDER BY u.name
            """)
    List<ArtistResponse> findArtistResponses();
}