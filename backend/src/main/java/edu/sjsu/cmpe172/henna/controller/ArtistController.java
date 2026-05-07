package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.dto.CreateArtistRequest;
import edu.sjsu.cmpe172.henna.dto.UserResponse;
import edu.sjsu.cmpe172.henna.dto.ArtistResponse;
import edu.sjsu.cmpe172.henna.model.Artist;
import edu.sjsu.cmpe172.henna.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
@CrossOrigin(origins = "http://localhost:3000")
public class ArtistController {

    private final UserService service;

    public ArtistController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<ArtistResponse> getAllArtists() {
        return service.getArtistResponses();
    }

    @GetMapping("/{id}")
    public Artist getArtistById(@PathVariable Integer id) {
        return service.getArtistById(id);
    }

    @PostMapping
    public UserResponse createArtist(@RequestBody CreateArtistRequest request) {
        return service.createArtist(request);
    }

    @PutMapping("/{id}")
    public Artist updateArtist(@PathVariable Integer id, @RequestBody CreateArtistRequest request) {
        return service.updateArtist(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteArtist(@PathVariable Integer id) {
        service.deleteArtist(id);
    }
}