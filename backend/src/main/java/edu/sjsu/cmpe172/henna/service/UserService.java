package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.dto.*;
import edu.sjsu.cmpe172.henna.model.Artist;
import edu.sjsu.cmpe172.henna.model.Customer;
import edu.sjsu.cmpe172.henna.model.User;
import edu.sjsu.cmpe172.henna.repository.ArtistRepository;
import edu.sjsu.cmpe172.henna.repository.CustomerRepository;
import edu.sjsu.cmpe172.henna.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final CustomerRepository customerRepo;
    private final ArtistRepository artistRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepo, CustomerRepository customerRepo, ArtistRepository artistRepo) {
        this.userRepo = userRepo;
        this.customerRepo = customerRepo;
        this.artistRepo = artistRepo;
    }

    public List<UserResponse> getAllUsers() {
        return userRepo.findAll().stream().map(this::toUserResponse).toList();
    }

    public UserResponse getUserById(Integer id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));
        return toUserResponse(user);
    }

    public LoginUserResponse getLoginUserByUsername(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));
        return toLoginUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Integer id, UpdateUserRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            userRepo.findByUsername(request.getUsername()).ifPresent(existing -> {
                if (!existing.getUserId().equals(id)) {
                    throw new RuntimeException("Username already exists.");
                }
            });
            user.setUsername(request.getUsername());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());

        return toUserResponse(userRepo.save(user));
    }

    @Transactional
    public void deleteUser(Integer id) {
        userRepo.deleteById(id);
    }

    public List<Customer> getAllCustomers() {
        return customerRepo.findAll();
    }

    public Customer getCustomerById(Integer id) {
        return customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found."));
    }

    @Transactional
    public UserResponse createCustomer(CreateCustomerRequest request) {
        validateBaseUser(request.getUsername(), request.getPassword(), request.getName(), request.getEmail(),
                request.getPhoneNumber());
        ensureUniqueUser(request.getUsername(), request.getEmail());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());

        User savedUser = userRepo.save(user);

        Customer customer = new Customer();
        customer.setCustomerId(savedUser.getUserId());
        customerRepo.save(customer);

        return toUserResponse(savedUser);
    }

    @Transactional
    public void deleteCustomer(Integer customerId) {
        customerRepo.deleteById(customerId);
        userRepo.deleteById(customerId);
    }

    public List<Artist> getAllArtists() {
        return artistRepo.findAll();
    }

    public Artist getArtistById(Integer id) {
        return artistRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found."));
    }

    public List<ArtistResponse> getArtistResponses() {
        return artistRepo.findArtistResponses();
    }

    @Transactional
    public UserResponse createArtist(CreateArtistRequest request) {
        validateBaseUser(request.getUsername(), request.getPassword(), request.getName(), request.getEmail(),
                request.getPhoneNumber());

        if (request.getSkillLevel() == null || request.getSkillLevel().isBlank()) {
            throw new RuntimeException("Skill level is required.");
        }

        ensureUniqueUser(request.getUsername(), request.getEmail());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());

        User savedUser = userRepo.save(user);

        Artist artist = new Artist();
        artist.setArtistId(savedUser.getUserId());
        artist.setSkillLevel(request.getSkillLevel());
        artist.setPortfolioLink(request.getPortfolioLink());
        artist.setBio(request.getBio());

        artistRepo.save(artist);

        return toUserResponse(savedUser);
    }

    @Transactional
    public Artist updateArtist(Integer artistId, CreateArtistRequest request) {
        Artist artist = artistRepo.findById(artistId)
                .orElseThrow(() -> new RuntimeException("Artist not found."));

        if (request.getSkillLevel() != null && !request.getSkillLevel().isBlank()) {
            artist.setSkillLevel(request.getSkillLevel());
        }

        artist.setPortfolioLink(request.getPortfolioLink());
        artist.setBio(request.getBio());

        return artistRepo.save(artist);
    }

    @Transactional
    public void deleteArtist(Integer artistId) {
        artistRepo.deleteById(artistId);
        userRepo.deleteById(artistId);
    }

    private void validateBaseUser(String username, String password, String name, String email, String phoneNumber) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Username is required.");
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is required.");
        }

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Name is required.");
        }

        if ((email == null || email.isBlank()) && (phoneNumber == null || phoneNumber.isBlank())) {
            throw new RuntimeException("Email or phone number is required.");
        }
    }

    private void ensureUniqueUser(String username, String email) {
        if (userRepo.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists.");
        }

        if (email != null && !email.isBlank() && userRepo.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists.");
        }
    }

    private String getRole(Integer userId) {
        if (artistRepo.existsById(userId))
            return "ARTIST";
        if (customerRepo.existsById(userId))
            return "CUSTOMER";
        return "USER";
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                getRole(user.getUserId()));
    }

    private LoginUserResponse toLoginUserResponse(User user) {
        return new LoginUserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getPassword(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                getRole(user.getUserId()));
    }
}